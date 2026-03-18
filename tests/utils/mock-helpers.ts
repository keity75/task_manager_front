import { UseMutationResult } from '@tanstack/react-query';
import { KeyboardEvent } from 'react';

/**
 * createMockMutationResult
 *
 * TanStack Query の UseMutationResult 型を満たす最小限のデフォルト値を持つオブジェクトを生成します。
 * テストコード内で `as unknown as ReturnType<...>` といった型アサーションを避けるために使用します。
 *
 * @param overrides - デフォルト値を上書きするプロパティ
 * @returns UseMutationResult 型のオブジェクト
 */
export function createMockMutationResult<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
>(
  overrides: Partial<UseMutationResult<TData, TError, TVariables, TContext>> = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const defaultResult = {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
    isPaused: false,
    status: 'idle',
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
  };

  return { ...defaultResult, ...overrides } as UseMutationResult<
    TData,
    TError,
    TVariables,
    TContext
  >;
}

/**
 * createMockKeyboardEvent
 *
 * React の KeyboardEvent 型を満たす最小限のデフォルト値を持つオブジェクトを生成します。
 * テストコード内で `as unknown as React.KeyboardEvent` といった型アサーションを避けるために使用します。
 *
 * @param overrides - デフォルト値を上書きするプロパティ
 * @returns React.KeyboardEvent 型のオブジェクト
 */
export function createMockKeyboardEvent<T = Element>(
  overrides: Omit<Partial<KeyboardEvent<T>>, 'nativeEvent'> & {
    nativeEvent?: Partial<globalThis.KeyboardEvent>;
  } = {}
): KeyboardEvent<T> {
  const defaultEvent = {
    key: '',
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };

  const defaultNativeEvent = {
    isComposing: false,
  };

  const mergedNativeEvent = {
    ...defaultNativeEvent,
    ...overrides.nativeEvent,
  } as unknown as globalThis.KeyboardEvent;

  return {
    ...defaultEvent,
    ...overrides,
    nativeEvent: mergedNativeEvent,
  } as unknown as KeyboardEvent<T>;
}
