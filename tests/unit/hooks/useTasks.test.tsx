/**
 * @file useTasks.test.tsx
 * タスク関連フックの単体テスト
 */

import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders, createTestQueryClient } from '../../utils/render';

jest.mock('@/app/(workspace)/tasks/actions', () => ({
  getTaskSummary: jest.fn(),
  createTask: jest.fn(),
}));

import {
  useTaskSummaryQuery,
  useCreateTaskMutation,
} from '@/app/(workspace)/tasks/_hooks/useTasks';
import { getTaskSummary, createTask } from '@/app/(workspace)/tasks/actions';
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/constants/tasks';

const mockGetTaskSummary = getTaskSummary as jest.MockedFunction<typeof getTaskSummary>;
const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;

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

describe('useCreateTaskMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const input = {
    title: '新しいタスク',
    description: null,
    dueAt: null,
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.TODO,
  };

  it('入力内容でcreateTaskが呼ばれ、成功時にidが返る', async () => {
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    const queryClient = createTestQueryClient();

    const { result } = renderHookWithProviders(() => useCreateTaskMutation(), { queryClient });

    let response: { id: string } | undefined;
    await act(async () => {
      response = await result.current.mutateAsync(input);
    });

    expect(mockCreateTask).toHaveBeenCalledWith(input);
    expect(response).toEqual({ id: 'task-1' });
  });

  it('作成成功時にタスク一覧・タスク統計のキャッシュを無効化し、即時反映する', async () => {
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useCreateTaskMutation(), { queryClient });

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tasks'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['taskSummary'] });
  });

  it('作成失敗時はキャッシュを無効化せずエラーを伝播する', async () => {
    mockCreateTask.mockRejectedValue(new Error('API error'));
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useCreateTaskMutation(), { queryClient });

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toThrow('API error');
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
