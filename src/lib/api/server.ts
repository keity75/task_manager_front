import 'server-only';

/**
 * サーバー専用APIバレル
 *
 * Server ActionsやRSCからのみ利用可能なAPIクライアントを集約します。
 */
export { authenticatedFetch, authApi } from './auth';
