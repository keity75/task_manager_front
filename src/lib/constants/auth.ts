/**
 * 認証関連の定数
 *
 * このファイルは認証プロバイダーや認証関連の定数を一元管理します。
 */

/**
 * 認証プロバイダー情報
 * NextAuth用のID、FastAPI用のID、表示名を管理
 */
export const AUTH_PROVIDERS = {
  GOOGLE: {
    /**
     * NextAuth用プロバイダーID
     */
    PROVIDER_ID: 'google',

    /**
     * バックエンド用プロバイダーID
     */
    BACKEND_ID: 'google.com',

    /**
     * UI表示用の名前
     */
    DISPLAY_NAME: 'Google',
  },
  // MICROSOFT: {
  //   PROVIDER_ID: 'azure-ad',
  //   BACKEND_ID: 'microsoft.com',
  //   DISPLAY_NAME: 'Microsoft',
  // },
} as const;

/**
 * 認証プロバイダーの型
 */
export type AuthProvider = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];

/**
 * セッション有効期限（秒）: 30日
 */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * トークンリフレッシュ関連の定数（秒）
 */
export const TOKEN_REFRESH = {
  /** トークン期限切れの5分前をリフレッシュ対象とする（秒） */
  REFRESH_THRESHOLD: 300,
} as const;

/**
 * トークンエラーの種類
 * セッションに設定されるエラーフラグ
 */
export const TOKEN_ERRORS = {
  /**
   * バックエンドトークンリフレッシュ失敗エラー
   * バックエンドAPIトークンのリフレッシュ失敗時に発生
   */
  REFRESH_BACKEND_TOKEN_ERROR: 'RefreshBackendTokenError',
} as const;

/**
 * 自動ログアウトが必要なエラー
 * これらのエラーは再認証が必須
 */
export const LOGOUT_REQUIRED_ERRORS = [
  TOKEN_ERRORS.REFRESH_BACKEND_TOKEN_ERROR,
  // 将来追加: TOKEN_ERRORS.PROVIDER_PERMISSION_REVOKED,
] as const;
