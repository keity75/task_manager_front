/**
 * OAuth 2.0 設定定数
 *
 * 各OAuthプロバイダーの設定（エンドポイント、スコープ）を一元管理します。
 * AUTH_PROVIDERS（auth.ts）と同じ階層構造を採用し、一貫性を保ちます。
 */
export const OAUTH = {
  /**
   * Google OAuth 2.0 設定
   */
  GOOGLE: {
    /** NextAuthのプロバイダーID */
    PROVIDER_ID: 'google',
    /** OAuth 2.0 エンドポイント */
    ENDPOINTS: {
      /** トークンリフレッシュエンドポイント */
      TOKEN: 'https://oauth2.googleapis.com/token',
      /** ユーザー情報取得エンドポイント */
      USERINFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
      /** トークン無効化エンドポイント */
      REVOKE: 'https://oauth2.googleapis.com/revoke',
    },

    /** OAuth 2.0 スコープ */
    SCOPES: {
      // OpenID Connect標準スコープ
      OPENID: 'openid',
      EMAIL: 'email',
      PROFILE: 'profile',

      // Google API固有スコープ
      GMAIL: {
        READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
        MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
        COMPOSE: 'https://www.googleapis.com/auth/gmail.compose',
      },
    },
  },

  // 将来の拡張例:
  // MICROSOFT: {
  //   PROVIDER_ID: 'azure-ad',
  //   ENDPOINTS: { TOKEN: '...', USERINFO: '...' },
  //   SCOPES: { OPENID: '...', EMAIL: '...' },
  // },
} as const;
