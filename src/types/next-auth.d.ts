import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    /**
     * バックエンドAPIアクセストークン
     * FastAPIへのリクエストに使用
     */
    backendAccessToken?: string;
    /**
     * トークンエラーフラグ
     * 'RefreshBackendTokenError' の場合、再認証が必要
     */
    error?: string;
  }

  interface User {
    id: string;
    /**
     * バックエンドAPIアクセストークン
     * signInコールバックで設定
     */
    backendAccessToken?: string;
    /**
     * バックエンドリフレッシュトークン
     * signInコールバックで設定
     */
    backendRefreshToken?: string;
    /**
     * バックエンドトークンの有効期限（UNIXタイムスタンプ）
     */
    backendExpiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    /**
     * ユーザー名
     */
    userName?: string;
    /**
     * バックエンドAPIアクセストークン
     */
    backendAccessToken?: string;
    /**
     * バックエンドリフレッシュトークン
     */
    backendRefreshToken?: string;
    /**
     * バックエンドトークンの有効期限（UNIXタイムスタンプ）
     */
    backendExpiresAt?: number;
    /**
     * トークンエラーフラグ
     */
    error?: string;
  }
}
