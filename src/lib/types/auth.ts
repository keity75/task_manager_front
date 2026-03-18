/**
 * 認証関連の型定義
 *
 * NextAuth、OAuth、バックエンド連携で使用する型を定義します。
 */

import { JWT } from 'next-auth/jwt';
import { User, Account, Profile, Session } from 'next-auth';

/**
 * カスタムJWTトークンの型定義
 * NextAuthのデフォルトJWTを拡張
 */
export interface CustomJWT extends JWT {
  /**
   * バックエンドから取得したユーザーID
   */
  userId?: string;

  /**
   * ユーザー名
   */
  userName?: string;

  /**
   * バックエンドAPIアクセストークン（JWT）
   * バックエンドAPIへのリクエストに使用
   */
  backendAccessToken?: string;

  /**
   * バックエンドリフレッシュトークン
   * バックエンドAPIトークンの更新に使用
   */
  backendRefreshToken?: string;

  /**
   * バックエンドトークンの有効期限（UNIXタイムスタンプ）
   */
  backendExpiresAt?: number;

  /**
   * トークンエラーフラグ
   * トークンリフレッシュ失敗時などに設定
   */
  error?: string;
}

/**
 * カスタムユーザー型
 * NextAuthのデフォルトUserを拡張
 */
export interface CustomUser extends User {
  /**
   * バックエンドから取得したユーザーID
   */
  id: string;

  /**
   * ユーザーのメールアドレス
   */
  email?: string | null;

  /**
   * ユーザーの表示名
   */
  name?: string | null;

  /**
   * バックエンドAPIアクセストークン
   */
  backendAccessToken?: string;

  /**
   * バックエンドリフレッシュトークン
   */
  backendRefreshToken?: string;

  /**
   * バックエンドトークンの有効期限
   */
  backendExpiresAt?: number;
}

/**
 * 認証情報同期リクエストの型定義
 * POST /api/v1/auth/sync
 */
export interface AuthSyncRequest {
  /** 認証プロバイダー (例: "google", "microsoft") */
  provider: string;
  /** プロバイダーアカウントID */
  providerAccountId: string;
  /** ユーザーメールアドレス */
  email: string;
  /** ユーザー名 */
  name: string;
  /** 暗号化されたプロバイダーアクセストークン */
  providerAccessToken: string;
  /** 暗号化されたプロバイダーリフレッシュトークン */
  providerRefreshToken: string;
  /** プロバイダートークンの有効期限（UNIXタイムスタンプ） */
  providerTokenExpiresAt: number;
}

/**
 * 認証情報同期レスポンスの型定義
 * POST /api/v1/auth/sync
 */
export interface AuthSyncResponse {
  /** バックエンドで生成されたユーザーID */
  userId: string;
  /** APIアクセストークン（JWT） */
  accessToken: string;
  /** リフレッシュトークン */
  refreshToken: string;
  /** アクセストークンの有効期限（UNIXタイムスタンプ） */
  expiresAt: number;
  /** 新規ユーザーかどうか */
  isNewUser: boolean;
  /** ユーザーの表示名 */
  userName?: string;
}

/**
 * トークンリフレッシュリクエストの型定義
 * POST /api/v1/auth/token/refresh
 */
export interface AuthTokenRefreshRequest {
  /** リフレッシュトークン */
  refreshToken: string;
}

/**
 * トークンリフレッシュレスポンスの型定義
 * POST /api/v1/auth/token/refresh
 */
export interface AuthTokenRefreshResponse {
  /** 新しいAPIアクセストークン */
  accessToken: string;
  /** 新しい有効期限（UNIXタイムスタンプ） */
  expiresAt: number;
}

/**
 * ログアウトリクエストの型定義
 * POST /api/v1/auth/logout
 */
export interface LogoutRequest {
  /** 無効化するリフレッシュトークン */
  refreshToken: string;
}

/**
 * signInコールバックの引数型
 */
export interface SignInCallbackParams {
  user: CustomUser;
  account: Account | null;
  profile?: Profile;
}

/**
 * jwtコールバックの引数型
 */
export interface JWTCallbackParams {
  token: JWT;
  user?: CustomUser;
  account?: Account | null;
  profile?: Profile;
  trigger?: 'signIn' | 'signUp' | 'update';
}

/**
 * sessionコールバックの引数型
 */
export interface SessionCallbackParams {
  session: Session;
  token: JWT;
  user?: CustomUser;
}

/**
 * Type Guard: JWTトークンがCustomJWT型かどうかを判定
 *
 * @param token - NextAuthのJWTトークン
 * @returns CustomJWT型の場合true
 */
export function isCustomJWT(token: JWT): token is CustomJWT {
  return (
    typeof token === 'object' &&
    token !== null &&
    ('userId' in token || 'backendAccessToken' in token)
  );
}

/**
 * Type Guard: UserがCustomUser型かどうかを判定
 *
 * @param user - NextAuthのUserオブジェクト
 * @returns CustomUser型の場合true
 */
export function isCustomUser(user: User): user is CustomUser {
  return typeof user === 'object' && user !== null && 'id' in user;
}

/**
 * NextAuth の Route Handler context 型
 * Next.js 15 App Router の [...nextauth] Dynamic Route Segment 用
 */
export type NextAuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};
