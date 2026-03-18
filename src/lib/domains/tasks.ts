/**
 * @file
 * [Domain Utility (Task)]
 * * このファイルは、「タスク」機能に"特化"した純粋なユーティリティ関数を提供します。
 * これらの関数は、Reactのフックやサーバーアクションを呼び出さず、
 * データの変換 (mapTaskToFormInput) や、
 * 表示用のラベル取得 (getTaskStatusLabel) のような、
 * 再利用可能なビジネスロジックを担当します。
 * * @see lib/domains/date.ts (日付ドメインのutils)
 * @see app/(workspace)/tasks/_hooks/useTasks.ts (Reactフック)
 * @see app/(workspace)/tasks/actions.ts (Server Actions)
 */

'use client';

import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';
import { Task } from '@/app/(workspace)/tasks/types';
import { TaskFormInput } from '@/lib/schema/task.schema';
import { formatUtcToJst } from '@/lib/domains/date';
import { t } from '@/lib/locales/i18n';

// --- セレクトボックス用オプション配列 ---

export const taskStatusOptions = [
  { label: t.task.labels.status.todo, value: TASK_STATUS.TODO },
  { label: t.task.labels.status.in_progress, value: TASK_STATUS.IN_PROGRESS },
  { label: t.task.labels.status.done, value: TASK_STATUS.DONE },
] as const;

export const taskPriorityOptions = [
  { label: t.task.labels.priority.urgent, value: TASK_PRIORITY.URGENT },
  { label: t.task.labels.priority.high, value: TASK_PRIORITY.HIGH },
  { label: t.task.labels.priority.medium, value: TASK_PRIORITY.MEDIUM },
  { label: t.task.labels.priority.low, value: TASK_PRIORITY.LOW },
] as const;

// --- 選択肢の総数 ---

/**
 * タスクステータスの選択肢の総数
 */
export const TOTAL_TASK_STATUS_COUNT = taskStatusOptions.length;

/**
 * タスク優先度の選択肢の総数
 */
export const TOTAL_TASK_PRIORITY_COUNT = taskPriorityOptions.length;

// --- ラベル取得ヘルパー関数 ---

export function getTaskStatusLabel(status: number): string {
  const found = taskStatusOptions.find((opt) => opt.value === status);
  return found?.label ?? t.task.labels.status.unknown;
}

export function getTaskPriorityLabel(priority: number): string {
  const found = taskPriorityOptions.find((opt) => opt.value === priority);
  return found?.label ?? t.task.labels.priority.unknown;
}

/**
 * DBから取得した Task オブジェクトを、フォーム用の TaskFormInput に変換する
 */
export function mapTaskToFormInput(task?: Task): TaskFormInput | undefined {
  if (!task) {
    return undefined;
  }

  // DBのUTC文字列を、HTMLの 'datetime-local' が要求するJST文字列 (YYYY-MM-DDTHH:MM) に変換する
  let jstString: string | null = null;
  if (task.dueAt) {
    const formatted = formatUtcToJst(task.dueAt, "yyyy-MM-dd'T'HH:mm");

    if (formatted) {
      jstString = formatted;
    }
  }

  return {
    title: task.title,
    description: task.description ?? '',
    dueAt: jstString,
    priority: task.priority,
    status: task.status,
  };
}

/**
 * 優先度に応じたバッジ用の色クラスを取得（背景色+テキスト色）
 * DashboardのUpcomingTasksコンポーネントで使用
 *
 * @param priority - タスクの優先度値
 * @returns Tailwind CSS クラス文字列（背景+テキスト）
 */
export function getPriorityBadgeClass(priority: number): string {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return 'bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-semibold border-red-200';
    case TASK_PRIORITY.HIGH:
      return 'bg-orange-100/80 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300';
    case TASK_PRIORITY.MEDIUM:
      return 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
    default:
      return 'bg-slate-100/80 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
  }
}

/**
 * ステータスに応じたバッジ用の色クラスを取得
 *
 * @param status - タスクのステータス値
 * @returns Tailwind CSS クラス文字列
 */
export function getStatusBadgeClass(status: number): string {
  switch (status) {
    case TASK_STATUS.TODO:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    case TASK_STATUS.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case TASK_STATUS.DONE:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}
