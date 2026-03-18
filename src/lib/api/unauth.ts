/**
 * 認証不要のAPI
 *
 * NextAuth内部からFastAPIを呼び出す際に使用します。
 * タイムアウトとエラーハンドリングを自動的に適用します。
 */

import { apiFetch } from './core';

/**
 * 認証不要のAPIショートカット
 *
 * @example
 * ```typescript
 * // app/api/auth/[...nextauth]/route.ts
 * import { unauthApi } from '@/lib/api';
 *
 * const result = await unauthApi.post<AuthTokenResponse>(
 *   '/api/v1/auth/sync',
 *   { provider: 'google', ... }
 * );
 * ```
 */
export const unauthApi = {
  /**
   * GET request without authentication
   */
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request without authentication
   */
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * PATCH request without authentication
   */
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  /**
   * DELETE request without authentication
   */
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
