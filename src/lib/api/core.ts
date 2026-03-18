/**
 * APIコア機能
 *
 * HTTP通信の基礎機能を提供します。
 * - fetch のラッパー
 * - エラーハンドリング
 * - タイムアウト制御
 */

import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  HTTP_STATUS,
  ERROR_PREVIEW_MAX_LENGTH,
} from '@/lib/constants/api';
import { FastApiResponse } from '@/lib/types/api';
import { t } from '@/lib/locales/i18n';

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * APIリクエストの基底実装
 * タイムアウト機能とエラーハンドリングを提供
 *
 * @param endpoint - APIエンドポイント
 * @param options - RequestInit + token（オプショナル）
 * @returns FastAPIのレスポンス全体（status, data, error, pagination等）
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<FastApiResponse<T>> {
  const { token, headers: customHeaders, ...restOptions } = options;

  const baseUrl = API_BASE_URL || 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;

  // デフォルトヘッダー
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // カスタムヘッダーをマージ
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  // 認証トークンがあればAuthorizationヘッダーを追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // タイムアウト制御用のAbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    // Fetch実行
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: controller.signal,
    });

    // タイムアウトタイマーをクリア
    clearTimeout(timeoutId);

    // 401 Unauthorizedエラーを検出
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      const apiError = new ApiError('UNAUTHORIZED', t.api.error.unauthorized, {
        status: HTTP_STATUS.UNAUTHORIZED,
        endpoint,
      });
      throw apiError;
    }

    // レスポンスをJSON解析
    let data: FastApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      // JSON解析エラーの場合、レスポンステキストを取得
      const text = await response.text();
      throw new ApiError(
        'INVALID_RESPONSE',
        t.api.error.invalid_response(text.substring(0, ERROR_PREVIEW_MAX_LENGTH)),
        {
          status: response.status,
          text,
        }
      );
    }

    // FastAPIのレスポンス形式を検証してそのまま返す
    if (data.status === 'success') {
      return data;
    } else {
      // エラーレスポンスの場合
      // プロバイダーAPI関連のエラーの場合、特別な処理
      if (
        data.error.code === 'PROVIDER_API_ERROR' ||
        data.error.message.includes('invalid_grant') ||
        data.error.message.includes('token_expired')
      ) {
        const apiError = new ApiError(
          'PROVIDER_PERMISSION_REVOKED',
          t.api.error.provider_permission_revoked,
          data.error.details
        );
        throw apiError;
      }

      const apiError = new ApiError(data.error.code, data.error.message, data.error.details);
      throw apiError;
    }
  } catch (error) {
    // タイムアウトタイマーをクリア
    clearTimeout(timeoutId);

    // タイムアウトエラー
    if (error instanceof Error && error.name === 'AbortError') {
      const apiError = new ApiError(
        'TIMEOUT_ERROR',
        t.api.error.timeout(API_TIMEOUT_MS / 1000),
        error
      );
      throw apiError;
    }

    // APIエラー
    if (error instanceof ApiError) {
      throw error;
    }

    // ネットワークエラーやJSON解析エラー
    const apiError = new ApiError('NETWORK_ERROR', t.api.error.network, error);
    throw apiError;
  }
}
