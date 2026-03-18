/**
 * タスクフォームスキーマのテスト
 * @see src/lib/schema/task.schema.ts
 */

import { taskFormSchema } from '@/lib/schema/task.schema';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';

// i18nのモック
jest.mock('@/lib/locales/i18n', () => ({
  t: {
    validation: {
      required: (field: string) => `${field}は必須です。`,
      maxLength: (field: string, max: number) => `${field}は${max}文字以内で入力してください。`,
      invalid_format: (field: string) => `有効な${field}形式ではありません。`,
      invalid_selection: (field: string) => `無効な${field}です。`,
    },
    task: {
      fields: {
        title: 'タイトル',
        description: '説明',
        dueAt: '日時',
        priority: '優先度',
        status: 'ステータス',
      },
    },
  },
}));

describe('taskFormSchema', () => {
  describe('正常系', () => {
    it('有効なタスクデータでパースが成功する', () => {
      const validData = {
        title: 'テストタスク',
        description: '説明',
        dueAt: '2025-01-30T10:00',
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(validData);

      expect(result).toEqual({
        title: 'テストタスク',
        description: '説明',
        dueAt: '2025-01-30T10:00',
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.TODO,
      });
    });

    it('titleの前後空白がtrimされる', () => {
      const data = {
        title: '  テストタスク  ',
        description: '説明',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(data);

      expect(result.title).toBe('テストタスク');
    });

    it('descriptionが空文字の場合nullに変換される', () => {
      const data = {
        title: 'テストタスク',
        description: '',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(data);

      expect(result.description).toBeNull();
    });

    it('descriptionが空白のみの場合nullに変換される', () => {
      const data = {
        title: 'テストタスク',
        description: '   ',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(data);

      expect(result.description).toBeNull();
    });

    it('dueAtが空文字の場合nullに変換される', () => {
      const data = {
        title: 'テストタスク',
        dueAt: '',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(data);

      expect(result.dueAt).toBeNull();
    });

    it('priorityがデフォルト値で設定される', () => {
      const data = {
        title: 'テストタスク',
        status: TASK_STATUS.TODO,
      };

      const result = taskFormSchema.parse(data);

      expect(result.priority).toBe(TASK_PRIORITY.MEDIUM);
    });

    it('statusがデフォルト値で設定される', () => {
      const data = {
        title: 'テストタスク',
        priority: TASK_PRIORITY.HIGH,
      };

      const result = taskFormSchema.parse(data);

      expect(result.status).toBe(TASK_STATUS.TODO);
    });

    it('最小限の必須フィールドのみでパースが成功する', () => {
      const data = {
        title: 'テストタスク',
      };

      const result = taskFormSchema.parse(data);

      expect(result.title).toBe('テストタスク');
      expect(result.priority).toBe(TASK_PRIORITY.MEDIUM);
      expect(result.status).toBe(TASK_STATUS.TODO);
    });
  });

  describe('異常系', () => {
    it('空文字のtitleでバリデーションエラー', () => {
      const data = {
        title: '',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('空白のみのtitleでバリデーションエラー', () => {
      const data = {
        title: '   ',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('255文字超のtitleでバリデーションエラー', () => {
      const data = {
        title: 'a'.repeat(256),
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('100000文字超のdescriptionでバリデーションエラー', () => {
      const data = {
        title: 'テストタスク',
        description: 'a'.repeat(100001),
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('無効なstatusでバリデーションエラー', () => {
      const data = {
        title: 'テストタスク',
        status: 999,
        priority: TASK_PRIORITY.MEDIUM,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('無効なpriorityでバリデーションエラー', () => {
      const data = {
        title: 'テストタスク',
        priority: 999,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('無効な日付形式のdueAtでバリデーションエラー', () => {
      const data = {
        title: 'テストタスク',
        dueAt: 'invalid-date',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });

    it('titleが未定義でバリデーションエラー', () => {
      const data = {
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
      };

      expect(() => taskFormSchema.parse(data)).toThrow();
    });
  });
});
