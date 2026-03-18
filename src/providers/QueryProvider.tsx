'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/constants/routes';
import { QUERY_RETRY_CONFIG, QUERY_CONFIG, API_ERROR_CODES } from '@/lib/constants/api';

/**
 * トークンリフレッシュ失敗エラーかチェック
 */
function isTokenRefreshError(error: unknown): boolean {
  return error instanceof ApiError && error.code === API_ERROR_CODES.TOKEN_REFRESH_FAILED;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.STALE_TIME_MS,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // トークンリフレッシュ失敗時は即座にログインページへ
              if (isTokenRefreshError(error)) {
                // 強制リダイレクト（middlewareとSessionMonitorが検出する前に即座に対応）
                window.location.href = ROUTES.LOGIN;
                return false;
              }

              // それ以外のエラーは最大リトライ回数までリトライ
              return failureCount < QUERY_RETRY_CONFIG.MAX_RETRY_COUNT;
            },
            retryDelay: (attemptIndex) =>
              Math.min(
                QUERY_CONFIG.RETRY_INITIAL_DELAY_MS * 2 ** attemptIndex,
                QUERY_CONFIG.RETRY_MAX_DELAY_MS
              ),
          },
          mutations: {
            retry: (failureCount, error) => {
              // トークンリフレッシュ失敗時は即座にログインページへ
              if (isTokenRefreshError(error)) {
                window.location.href = ROUTES.LOGIN;
                return false;
              }

              // Mutationのデフォルトはリトライしない。
              return QUERY_RETRY_CONFIG.MUTATION_RETRY;
            },
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
