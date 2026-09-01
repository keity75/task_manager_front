'use server';

/**
 * @file
 * [Feature Server Actions (Task)]
 * * このファイルは、「タスク」機能に関連するすべての「サーバーサイドの操作」を定義します。
 * (Next.js Server Actions)
 * * 責務:
 * 1. API層（FastAPIやDB）との直接通信
 * 2. APIが期待する入力データ型は types.ts で定義
 * * このファイルの関数は、原則として
 * tasks/_hooks/useTasks.ts (TanStack Queryの mutationFn) から呼び出されます。
 * * @see app/(workspace)/tasks/_hooks/useTasks.ts (Reactフック)
 * @see lib/utils/tasks.ts (純粋なユーティリティ)
 */

import { authApi } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { convertToIsoWithTimezone } from '@/lib/domains/date';
import { TaskFormInput } from '@/lib/schema/task.schema';
import { TaskIdResponse } from '@/lib/types/api';
import { Task, SortKey, SortOrder, GetTasksResponse, TaskSummaryResponse } from './types';

// --- CRUD操作 ---

// Create
export async function createTask(input: TaskFormInput): Promise<TaskIdResponse> {
  const response = await authApi.post<TaskIdResponse>(API_ENDPOINTS.TASKS.BASE, {
    title: input.title,
    description: input.description ?? null,
    dueAt: convertToIsoWithTimezone(input.dueAt),
    priority: input.priority,
    status: input.status,
  });

  if (response.status !== 'success') {
    throw new Error('API returned error status');
  }

  return response.data;
}

// Read
export async function getTasks(options: {
  page: number;
  limit: number;
  sortKey: SortKey;
  sortOrder: SortOrder;
  title?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  priorities?: number[];
  statuses?: number[];
}): Promise<GetTasksResponse> {
  const { page, limit, sortKey, sortOrder, title, dateFrom, dateTo, priorities, statuses } =
    options;

  const safePage = Math.max(page, 1);
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String((safePage - 1) * limit),
    sortBy: sortKey,
    order: sortOrder,
  });

  if (title) {
    searchParams.set('title', title);
  }
  if (dateFrom) {
    searchParams.set('dueAtFrom', dateFrom);
  }
  if (dateTo) {
    searchParams.set('dueAtTo', dateTo);
  }
  if (priorities && priorities.length > 0) {
    priorities.forEach((priority) => searchParams.append('priority', String(priority)));
  }
  if (statuses && statuses.length > 0) {
    statuses.forEach((status) => searchParams.append('status', String(status)));
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.TASKS.BASE}?${queryString}`
    : API_ENDPOINTS.TASKS.BASE;
  const response = await authApi.get<Task[]>(endpoint);

  if (response.status !== 'success') {
    throw new Error('API returned error status');
  }

  // データ構造のチェック (dataが配列でない場合)
  if (!Array.isArray(response.data)) {
    const error = new Error('Invalid API response format: data is not an array');
    throw error;
  }

  return {
    tasks: response.data,
    totalCount: response.pagination?.totalCount ?? 0,
  };
}

export async function getTaskSummary(): Promise<TaskSummaryResponse> {
  const response = await authApi.get<TaskSummaryResponse>(API_ENDPOINTS.TASKS.SUMMARY);

  if (response.status !== 'success') {
    throw new Error('API returned error status');
  }

  // Validate data structure (Simple smoke test)
  if (!response.data) {
    const error = new Error('Invalid API response format: missing summary data');
    throw error;
  }

  return response.data;
}
