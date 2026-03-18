/**
 * APIクライアント エントリーポイント
 *
 * クライアントから安全に使用できるAPI関連機能を集約して再エクスポートします。
 * サーバー専用のAPIクライアント（authApi, authenticatedFetch）は @/lib/api/server からインポートしてください。
 */

// Core
export { ApiError, apiFetch } from './core';

// Unauthenticated API
export { unauthApi } from './unauth';
