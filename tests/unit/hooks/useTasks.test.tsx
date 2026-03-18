/**
 * @file useTasks.test.tsx
 * タスク関連フックの単体テスト
 */

import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '../../utils/render';

jest.mock('@/app/(workspace)/tasks/actions', () => ({
  getTaskSummary: jest.fn(),
}));

import { useTaskSummaryQuery } from '@/app/(workspace)/tasks/_hooks/useTasks';
import { getTaskSummary } from '@/app/(workspace)/tasks/actions';

const mockGetTaskSummary = getTaskSummary as jest.MockedFunction<typeof getTaskSummary>;

describe('useTaskSummaryQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('API 成功時に summary が返る', async () => {
    mockGetTaskSummary.mockResolvedValue({
      total: 10,
      todo: 5,
      inProgress: 3,
      done: 2,
    });

    const { result } = renderHookWithProviders(() => useTaskSummaryQuery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toBeDefined();
    expect(result.current.summary?.total).toBe(10);
    expect(result.current.isError).toBe(false);
  });
});
