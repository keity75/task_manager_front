/**
 * テスト用レンダーヘルパー
 * React Testing Libraryのrender関数を拡張し、プロバイダーでラップする
 */

import React from 'react';
import { render, renderHook, RenderOptions, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/providers/SessionProvider';
import { buildMockUser } from './builders';
import type { User } from 'next-auth';

/**
 * テスト用のQueryClient設定
 * リトライを無効化してテストを高速化
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * セッションオプション型
 */
interface SessionOptions {
  user?: Partial<User>;
  backendAccessToken?: string;
  expires?: string;
}

/**
 * カスタムレンダーオプション
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * モックセッションデータ
   */
  session?: SessionOptions;
  /**
   * カスタムQueryClient（オプション）
   */
  queryClient?: QueryClient;
}

/**
 * テスト用のプロバイダーラッパーを作成する内部ヘルパー関数
 *
 * @param session - モックセッションオプション
 * @param providedQueryClient - カスタムQueryClient（オプション）
 * @returns QueryClientとWrapperコンポーネント
 */
function createTestWrapper(session?: SessionOptions, providedQueryClient?: QueryClient) {
  // モックユーザーデータを構築
  const mockUser = buildMockUser(session?.user);

  // QueryClientを取得または作成
  const queryClient = providedQueryClient ?? createTestQueryClient();

  // モックセッションデータ
  const mockSession = {
    user: mockUser,
    backendAccessToken: session?.backendAccessToken ?? 'mock-backend-access-token',
    expires: session?.expires ?? new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  };

  // useSessionのモックを更新
  const { useSession } = require('next-auth/react');
  useSession.mockReturnValue({
    data: mockSession,
    status: 'authenticated',
  });

  // ラッパーコンポーネント
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    );
  };

  return { queryClient, Wrapper };
}

/**
 * プロバイダーでラップされたレンダー関数
 *
 * @param ui - レンダーするReact要素
 * @param options - レンダーオプション
 * @returns レンダー結果とユーティリティ関数
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * expect(getByText('Hello')).toBeInTheDocument();
 * ```
 */
export function renderWithProviders(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const { session, queryClient, ...renderOptions } = options;
  const { Wrapper } = createTestWrapper(session, queryClient);
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Hooksテスト用のカスタムレンダーオプション
 */
interface CustomHookRenderOptions<Props> extends Omit<RenderHookOptions<Props>, 'wrapper'> {
  /**
   * モックセッションデータ
   */
  session?: SessionOptions;
  /**
   * カスタムQueryClient（オプション）
   */
  queryClient?: QueryClient;
}

/**
 * プロバイダーでラップされたrenderHook関数
 *
 * @param hook - テストするフック
 * @param options - レンダーオプション
 * @returns renderHook結果
 *
 * @example
 * ```tsx
 * const { result } = renderHookWithProviders(() => useTasksQuery({ page: 1, limit: 10 }));
 * await waitFor(() => expect(result.current.isLoading).toBe(false));
 * expect(result.current.tasks).toHaveLength(2);
 * ```
 */
export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  options: CustomHookRenderOptions<Props> = {}
) {
  const { session, queryClient, ...hookOptions } = options;
  const { Wrapper } = createTestWrapper(session, queryClient);
  return renderHook(hook, { wrapper: Wrapper, ...hookOptions });
}

/**
 * テスト用のQueryClientを作成するヘルパー関数
 * 外部からQueryClientをカスタマイズしたい場合に使用
 */
export { createTestQueryClient };

// すべてのReact Testing Libraryのエクスポートを再エクスポート
export * from '@testing-library/react';
