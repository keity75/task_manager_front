import 'server-only';

/**
 * 認証必須のAPI
 *
 * Server Actions専用の認証付きAPIクライアント。
 * セッションからバックエンドAPIトークンを自動的に取得し、リクエストに付与します。
 */

import { getServerSession } from 'next-auth';
import { TOKEN_ERRORS } from '@/lib/constants/auth';
import { API_ERROR_CODES } from '@/lib/constants/api';
import { t } from '@/lib/locales/i18n';
import { authOptions } from '@/lib/auth/options';
import { apiFetch, ApiError } from './core';
import type { FastApiResponse } from '@/lib/types/api';

/**
 * Server Actions専用の認証付きfetch
 *
 * セッションからバックエンドAPIトークンを自動的に取得し、
 * Authorization: Bearer ヘッダーに設定してバックエンドにリクエストを送信します。
 *
 * @param endpoint - APIエンドポイント（例: '/api/v1/tasks'）
 * @param options - 追加のリクエストオプション
 * @throws {ApiError} トークンが存在しない場合、またはリフレッシュエラーの場合
 *
 * @example
 * ```typescript
 * // app/(workspace)/tasks/actions.ts
 * 'use server';
 *
 * export async function getTasks() {
 *   const response = await authenticatedFetch<Task[]>('/api/v1/tasks');
 *   if (response.status === 'success') {
 *     return response.data;
 *   }
 * }
 * ```
 */
export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<FastApiResponse<T>> {
  const session = await getServerSession(authOptions);

  // セッションまたはバックエンドトークンが存在しない場合
  if (!session?.backendAccessToken) {
    const apiError = new ApiError(
      API_ERROR_CODES.AUTH_TOKEN_MISSING,
      t.api.error.auth_token_missing
    );
    throw apiError;
  }

  // バックエンドトークンリフレッシュエラーがある場合
  if (session.error === TOKEN_ERRORS.REFRESH_BACKEND_TOKEN_ERROR) {
    const apiError = new ApiError(
      API_ERROR_CODES.TOKEN_REFRESH_FAILED,
      t.api.error.token_refresh_failed
    );
    throw apiError;
  }

  return apiFetch<T>(endpoint, { ...options, token: session.backendAccessToken });
}

/**
 * Server Actions専用の認証付きAPIショートカット
 *
 * @example
 * ```typescript
 * // app/(workspace)/tasks/actions.ts
 * 'use server';
 *
 * export async function getTasks() {
 *   const response = await authApi.get<Task[]>('/api/v1/tasks');
 *   if (response.status === 'success') {
 *     return response.data;
 *   }
 * }
 *
 * export async function createTask(input: CreateTaskInput) {
 *   const response = await authApi.post<Task>('/api/v1/tasks', input);
 *   if (response.status === 'success') {
 *     return response.data;
 *   }
 * }
 * ```
 */
export const authApi = {
  /**
   * GET request with authentication
   */
  get: <T>(endpoint: string, options?: RequestInit) =>
    authenticatedFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request with authentication
   */
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    authenticatedFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * PATCH request with authentication
   */
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    authenticatedFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  /**
   * DELETE request with authentication
   */
  delete: <T>(endpoint: string, options?: RequestInit) =>
    authenticatedFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
