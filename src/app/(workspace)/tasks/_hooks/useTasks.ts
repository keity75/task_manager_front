/**
 * @file
 * [Feature Custom Hooks (Task)]
 * タスク機能のデータ取得系カスタムフックを定義する。
 * Server Action 呼び出しと、UIで扱いやすい取得結果の整形を担う。
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, getTaskSummary, createTask } from '../actions';
import { SortKey, SortOrder, GetTasksResponse, TaskSummaryResponse } from '../types';
import { TaskFormInput } from '@/lib/schema/task.schema';

/**
 * タスク一覧を取得するカスタムフック
 */
export const useTasksQuery = ({
  page,
  limit,
  sortKey,
  sortOrder,
  title,
  dateFrom,
  dateTo,
  priorities,
  statuses,
}: {
  page: number;
  limit: number;
  sortKey: SortKey;
  sortOrder: SortOrder;
  title?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  priorities?: number[];
  statuses?: number[];
}) => {
  // hooks内で正規化（空文字列・空配列 → undefined）
  const normalizedFilters = {
    title: title || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    priorities: priorities?.length ? priorities : undefined,
    statuses: statuses?.length ? statuses : undefined,
  };

  const { data, isLoading, error } = useQuery<GetTasksResponse>({
    queryKey: ['tasks', { page, limit, sortKey, sortOrder, ...normalizedFilters }],
    queryFn: () => getTasks({ page, limit, sortKey, sortOrder, ...normalizedFilters }),
  });

  return {
    tasks: data?.tasks ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * タスク統計情報を取得するカスタムフック
 */
export const useTaskSummaryQuery = () => {
  const { data, isLoading, error } = useQuery<TaskSummaryResponse>({
    queryKey: ['taskSummary'],
    queryFn: () => getTaskSummary(),
  });

  return {
    summary: data,
    isLoading,
    isError: !!error,
    error,
  };
};

/**
 * タスク作成用カスタムフック
 * 成功時にタスク一覧・タスク統計のキャッシュを無効化し、即時反映する
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TaskFormInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskSummary'] });
    },
  });
};
