/**
 * タスクユーティリティ関数のテスト
 * @see src/lib/domains/tasks.ts
 */

import {
  getTaskStatusLabel,
  getTaskPriorityLabel,
  mapTaskToFormInput,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '@/lib/domains/tasks';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';
import { buildMockTask } from '../../utils/builders';
import type { Task } from '@/app/(workspace)/tasks/types';

// i18nのモック
jest.mock('@/lib/locales/i18n', () => ({
  t: {
    task: {
      labels: {
        status: {
          todo: '未着手',
          in_progress: '処理中',
          done: '完了',
          unknown: '不明',
        },
        priority: {
          urgent: '緊急',
          high: '高',
          medium: '中',
          low: '低',
          unknown: '不明',
        },
      },
    },
  },
}));

describe('task utilities', () => {
  describe('getTaskStatusLabel', () => {
    describe('正常系', () => {
      it('ステータスコードをラベルに変換する（TODO）', () => {
        const result = getTaskStatusLabel(TASK_STATUS.TODO);
        expect(result).toBe('未着手');
      });

      it('ステータスコードをラベルに変換する（IN_PROGRESS）', () => {
        const result = getTaskStatusLabel(TASK_STATUS.IN_PROGRESS);
        expect(result).toBe('処理中');
      });

      it('ステータスコードをラベルに変換する（DONE）', () => {
        const result = getTaskStatusLabel(TASK_STATUS.DONE);
        expect(result).toBe('完了');
      });
    });

    describe('異常系', () => {
      it('存在しないステータスで"不明"を返す', () => {
        const result = getTaskStatusLabel(999);
        expect(result).toBe('不明');
      });
    });
  });

  describe('getTaskPriorityLabel', () => {
    describe('正常系', () => {
      it('優先度コードをラベルに変換する（URGENT）', () => {
        const result = getTaskPriorityLabel(TASK_PRIORITY.URGENT);
        expect(result).toBe('緊急');
      });

      it('優先度コードをラベルに変換する（HIGH）', () => {
        const result = getTaskPriorityLabel(TASK_PRIORITY.HIGH);
        expect(result).toBe('高');
      });

      it('優先度コードをラベルに変換する（MEDIUM）', () => {
        const result = getTaskPriorityLabel(TASK_PRIORITY.MEDIUM);
        expect(result).toBe('中');
      });

      it('優先度コードをラベルに変換する（LOW）', () => {
        const result = getTaskPriorityLabel(TASK_PRIORITY.LOW);
        expect(result).toBe('低');
      });
    });

    describe('異常系', () => {
      it('存在しない優先度で"不明"を返す', () => {
        const result = getTaskPriorityLabel(999);
        expect(result).toBe('不明');
      });
    });
  });

  describe('mapTaskToFormInput', () => {
    describe('正常系', () => {
      it('TaskオブジェクトをFormInputに変換する', () => {
        const task: Task = buildMockTask({
          title: 'テストタスク',
          description: '説明',
          dueAt: '2025-01-30T10:00:00Z',
          priority: TASK_PRIORITY.HIGH,
          status: TASK_STATUS.TODO,
        });

        const result = mapTaskToFormInput(task);

        expect(result).toEqual({
          title: 'テストタスク',
          description: '説明',
          dueAt: '2025-01-30T19:00', // UTCからJSTに変換（10:00 UTC = 19:00 JST）
          priority: TASK_PRIORITY.HIGH,
          status: TASK_STATUS.TODO,
        });
      });

      it('dueAtがUTCからJST形式に変換される', () => {
        const task: Task = buildMockTask({
          dueAt: '2025-01-28T05:30:00Z', // UTC 5:30
        });

        const result = mapTaskToFormInput(task);

        // JSTはUTC+9なので、5:30 UTC = 14:30 JST
        expect(result?.dueAt).toBe('2025-01-28T14:30');
      });

      it('dueAtがnullの場合、nullを返す', () => {
        const task: Task = buildMockTask({
          dueAt: null,
        });

        const result = mapTaskToFormInput(task);

        expect(result?.dueAt).toBeNull();
      });

      it('descriptionがnullの場合、空文字を返す', () => {
        const task: Task = buildMockTask({
          description: null,
        });

        const result = mapTaskToFormInput(task);

        expect(result?.description).toBe('');
      });
    });

    describe('異常系', () => {
      it('undefinedでundefinedを返す', () => {
        const result = mapTaskToFormInput(undefined);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('getPriorityBadgeClass', () => {
    describe('正常系', () => {
      it('優先度に応じたBadgeクラスを返す（URGENT）', () => {
        const result = getPriorityBadgeClass(TASK_PRIORITY.URGENT);
        expect(result).toContain('red');
        expect(result).toContain('bg-red-100');
      });

      it('優先度に応じたBadgeクラスを返す（HIGH）', () => {
        const result = getPriorityBadgeClass(TASK_PRIORITY.HIGH);
        expect(result).toContain('orange');
        expect(result).toContain('bg-orange-100');
      });

      it('優先度に応じたBadgeクラスを返す（MEDIUM）', () => {
        const result = getPriorityBadgeClass(TASK_PRIORITY.MEDIUM);
        expect(result).toContain('blue');
        expect(result).toContain('bg-blue-100');
      });

      it('優先度に応じたBadgeクラスを返す（LOW）', () => {
        const result = getPriorityBadgeClass(TASK_PRIORITY.LOW);
        expect(result).toContain('slate');
        expect(result).toContain('bg-slate-100');
      });
    });

    describe('異常系', () => {
      it('存在しない優先度でデフォルトクラスを返す', () => {
        const result = getPriorityBadgeClass(999);
        expect(result).toContain('slate');
        expect(result).toContain('bg-slate-100');
      });
    });
  });

  describe('getStatusBadgeClass', () => {
    describe('正常系', () => {
      it('ステータスに応じたBadgeクラスを返す（TODO）', () => {
        const result = getStatusBadgeClass(TASK_STATUS.TODO);
        expect(result).toContain('gray');
        expect(result).toContain('bg-gray-100');
      });

      it('ステータスに応じたBadgeクラスを返す（IN_PROGRESS）', () => {
        const result = getStatusBadgeClass(TASK_STATUS.IN_PROGRESS);
        expect(result).toContain('blue');
        expect(result).toContain('bg-blue-100');
      });

      it('ステータスに応じたBadgeクラスを返す（DONE）', () => {
        const result = getStatusBadgeClass(TASK_STATUS.DONE);
        expect(result).toContain('green');
        expect(result).toContain('bg-green-100');
      });
    });

    describe('異常系', () => {
      it('存在しないステータスでデフォルトクラスを返す', () => {
        const result = getStatusBadgeClass(999);
        expect(result).toContain('gray');
        expect(result).toContain('bg-gray-100');
      });
    });
  });
});
