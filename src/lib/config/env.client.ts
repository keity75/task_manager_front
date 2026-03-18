/**
 * クライアント専用の環境変数検証と設定。
 */

/**
 * APIベースURLの検証
 */
const _apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!_apiBaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_API_BASE_URL. Check your environment variable configuration (.env, env dashboard, etc.).'
  );
}

/**
 * 型安全なクライアント環境変数
 */
export const CLIENT_ENV = {
  API_BASE_URL: _apiBaseUrl,
} as const;
