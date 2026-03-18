/**
 * テスト用モックデータビルダー
 * テストケースで使用するモックデータを生成するヘルパー関数
 */

import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';
import type { Task } from '@/app/(workspace)/tasks/types';
import type { User } from 'next-auth';

/**
 * モックタスクを生成
 *
 * @param overrides - デフォルト値を上書きするプロパティ
 * @returns モックタスクオブジェクト
 */
export function buildMockTask(overrides?: Partial<Task>): Task {
  const now = new Date().toISOString();
  return {
    id: 'task-1',
    title: 'テストタスク',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueAt: '2025-01-30T10:00:00Z',
    description: 'テストタスクの説明',
    calendarLink: null,
    userId: 'test-user-id',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

/**
 * モックユーザーを生成
 *
 * @param overrides - デフォルト値を上書きするプロパティ
 * @returns モックユーザーオブジェクト
 */
export function buildMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    backendAccessToken: 'mock-backend-access-token',
    backendRefreshToken: 'mock-backend-refresh-token',
    backendExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}
