import 'server-only';

/**
 * NextAuth.js設定オプション
 *
 * OAuth2認証の設定とコールバック処理を定義します。
 */

import { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { googleOAuthConfig, nextAuthConfig } from '@/lib/config/env.server';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { SESSION_MAX_AGE_SECONDS, TOKEN_REFRESH, TOKEN_ERRORS } from '@/lib/constants/auth';
import { OAUTH } from '@/lib/constants/oauth';
import { ROUTES } from '@/lib/constants/routes';

import {
  AuthSyncResponse,
  AuthTokenRefreshResponse,
  CustomJWT,
  JWTCallbackParams,
  SessionCallbackParams,
  SignInCallbackParams,
  isCustomJWT,
  isCustomUser,
} from '@/lib/types/auth';

import { unauthApi } from '@/lib/api';
import { encrypt } from '@/lib/encryption';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * metadataがerrorプロパティを持つオブジェクトかチェック（Type Guard）
 */
function hasErrorProperty(metadata: unknown): metadata is { error?: unknown } {
  return metadata !== null && typeof metadata === 'object' && 'error' in metadata;
}

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * ユーザーキャンセル（access_denied）かどうかを判定
 *
 * @param metadata - NextAuthのloggerから渡されるmetadata
 * @returns ユーザーキャンセルの場合true
 */
function isUserCancellation(metadata?: unknown): boolean {
  if (metadata instanceof Error) {
    return metadata.message.includes('access_denied');
  }

  if (hasErrorProperty(metadata)) {
    const errorValue = metadata.error;
    return (
      errorValue === 'access_denied' ||
      (typeof errorValue === 'string' && errorValue.includes('access_denied')) ||
      (errorValue instanceof Error && errorValue.message.includes('access_denied'))
    );
  }

  return false;
}

/**
 * トークンがリフレッシュ対象かどうかを判定
 *
 * @param expiresAt - トークンの有効期限（UNIXタイムスタンプ）
 * @returns リフレッシュが必要な場合true
 */
function isTokenExpiringSoon(expiresAt: number | undefined): boolean {
  if (!expiresAt || typeof expiresAt !== 'number') {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return expiresAt <= now + TOKEN_REFRESH.REFRESH_THRESHOLD;
}

/**
 * バックエンドリフレッシュトークンを使用してアクセストークンを更新
 *
 * @param backendRefreshToken - バックエンドリフレッシュトークン
 * @returns 更新されたトークン情報、失敗時はnull
 */
async function refreshBackendToken(
  backendRefreshToken: string
): Promise<AuthTokenRefreshResponse | null> {
  try {
    const response = await unauthApi.post<AuthTokenRefreshResponse>(
      API_ENDPOINTS.AUTH.TOKEN_REFRESH,
      { refreshToken: backendRefreshToken }
    );
    if (response.status === 'success') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Backend token refresh failed:', error);
    return null;
  }
}

// ============================================================================
// NextAuth 設定
// ============================================================================

/**
 * NextAuth.js設定オプション
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleOAuthConfig.clientId,
      clientSecret: googleOAuthConfig.clientSecret,
      authorization: {
        params: {
          scope: [
            OAUTH.GOOGLE.SCOPES.OPENID,
            OAUTH.GOOGLE.SCOPES.EMAIL,
            OAUTH.GOOGLE.SCOPES.PROFILE,
            OAUTH.GOOGLE.SCOPES.GMAIL.READONLY,
          ].join(' '),
          access_type: 'offline', // refresh_tokenを取得するために必要
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  secret: nextAuthConfig.secret,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    /**
     * サインイン時のコールバック
     * OAuth認証成功時に、プロバイダートークンを暗号化してバックエンドに送信し、
     * バックエンドAPIトークンを取得する
     */
    async signIn({ user, account, profile: _profile }: SignInCallbackParams) {
      if (!account) {
        return false;
      }

      try {
        // トークンの存在確認
        if (!account.access_token || !account.refresh_token) {
          console.error('Missing tokens in account object');
          return false;
        }

        // プロバイダートークンを暗号化
        const encryptedAccessToken = encrypt(account.access_token);
        const encryptedRefreshToken = encrypt(account.refresh_token);

        // バックエンドに認証情報を同期してAPIトークンを取得
        const response = await unauthApi.post<AuthSyncResponse>(API_ENDPOINTS.AUTH.SYNC, {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name,
          providerAccessToken: encryptedAccessToken,
          providerRefreshToken: encryptedRefreshToken,
          providerTokenExpiresAt: account.expires_at,
        });

        if (response.status !== 'success') {
          return false;
        }

        const result = response.data;

        // バックエンドから取得した情報をユーザーオブジェクトに保存
        // これらはjwtコールバックでJWTに転送される
        user.id = result.userId;
        user.name = result.userName;
        user.backendAccessToken = result.accessToken;
        user.backendRefreshToken = result.refreshToken;
        user.backendExpiresAt = result.expiresAt;

        return true;
      } catch (error) {
        console.error('Backend token request failed:', error);
        return false;
      }
    },

    /**
     * JWTトークン生成時のコールバック
     * バックエンドトークンをJWTに保存し、必要に応じてリフレッシュ
     */
    async jwt({ token, user, account: _account }: JWTCallbackParams): Promise<CustomJWT> {
      // CustomJWTに変換
      let customToken: CustomJWT;

      if (isCustomJWT(token)) {
        customToken = token;
      } else {
        customToken = {
          userId: undefined,
          backendAccessToken: undefined,
          backendRefreshToken: undefined,
          backendExpiresAt: undefined,
          error: undefined,
        };
      }

      // 初回サインイン時、ユーザー情報をJWTに保存
      if (user && isCustomUser(user)) {
        customToken.userId = user.id;
        customToken.userName = user.name || undefined;
        customToken.backendAccessToken = user.backendAccessToken;
        customToken.backendRefreshToken = user.backendRefreshToken;
        customToken.backendExpiresAt = user.backendExpiresAt;
      }

      // バックエンドトークンのリフレッシュ
      if (isTokenExpiringSoon(customToken.backendExpiresAt)) {
        if (!customToken.backendRefreshToken) {
          customToken.error = TOKEN_ERRORS.REFRESH_BACKEND_TOKEN_ERROR;
        } else {
          const refreshed = await refreshBackendToken(customToken.backendRefreshToken);
          if (refreshed) {
            customToken.backendAccessToken = refreshed.accessToken;
            customToken.backendExpiresAt = refreshed.expiresAt;
          } else {
            customToken.error = TOKEN_ERRORS.REFRESH_BACKEND_TOKEN_ERROR;
          }
        }
      }

      return customToken;
    },

    /**
     * セッション生成時のコールバック
     * バックエンドアクセストークンをセッションに含める
     */
    async session({ session, token }: SessionCallbackParams): Promise<Session> {
      if (!isCustomJWT(token)) {
        return session;
      }
      const customToken = token;

      // トークンエラーがある場合、エラーをセッションに含める
      if (customToken.error) {
        session.error = customToken.error;
        return session;
      }

      // ユーザーIDをセッションに設定
      if (customToken.userId) {
        session.user.id = customToken.userId;
      }

      // ユーザー名をセッションに設定
      if (customToken.userName) {
        session.user.name = customToken.userName;
      }

      // バックエンドアクセストークンをセッションに公開（APIクライアントで使用）
      if (customToken.backendAccessToken) {
        session.backendAccessToken = customToken.backendAccessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: ROUTES.LOGIN,
    error: ROUTES.LOGIN,
  },
  events: {
    /**
     * ログアウト時のイベントハンドラー
     * バックエンドのリフレッシュトークンを無効化する
     */
    async signOut({ token }: { token: CustomJWT | null }) {
      if (token && isCustomJWT(token) && token.backendRefreshToken) {
        try {
          await unauthApi.post(API_ENDPOINTS.AUTH.LOGOUT, {
            refreshToken: token.backendRefreshToken,
          });
        } catch (error) {
          // ログアウト失敗はユーザー体験に影響しないため、ログのみ
          console.error('Backend logout failed:', error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',

  /**
   * NextAuth内部ログのカスタマイズ
   * OAuth認証フローのエラーをログ出力し、調査可能にする
   */
  logger: {
    error(code: string, metadata?: unknown) {
      // ユーザーキャンセル（access_denied）は正常な動作のため送信しない
      if (isUserCancellation(metadata)) {
        console.log('[NextAuth Info] User cancelled authentication', code);
        return;
      }

      console.error('[NextAuth Error]', code, metadata);
    },
    warn(code: string) {
      console.warn('[NextAuth Warning]', code);
    },
    debug(code: string, metadata?: unknown) {
      // 開発環境のみデバッグログを出力
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata);
      }
    },
  },
};
