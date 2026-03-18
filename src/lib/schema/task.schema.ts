import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';
import { t } from '@/lib/locales/i18n';

const statusValues: readonly number[] = Object.values(TASK_STATUS);
const priorityValues: readonly number[] = Object.values(TASK_PRIORITY);

/**
 * タスク作成・編集フォーム 共通バリデーションスキーマ
 */
export const taskFormSchema = z.object({
  /**
   * title: 必須 (最大長バリデーションあり)
   */
  title: z
    .string()
    .trim()
    .min(1, { message: t.validation.required(t.task.fields.title) })
    .max(255, { message: t.validation.maxLength(t.task.fields.title, 255) }),

  /**
   * description: 任意 (最大長バリデーションあり)
   */
  description: z
    .string()
    .max(100000, { message: t.validation.maxLength(t.task.fields.description, 100000) })
    .transform((val) => (val.trim() === '' ? null : val))
    .nullable()
    .optional(),

  /**
   * dueAt: 任意 (null可)
   */
  dueAt: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined) {
          return true;
        }
        return !isNaN(new Date(val).getTime());
      },
      {
        message: t.validation.invalid_format(t.task.fields.dueAt),
      }
    ),

  /**
   * priority: 数値 (デフォルト: 中)
   */
  priority: z.coerce
    .number()
    .refine((val) => priorityValues.includes(val), {
      message: t.validation.invalid_selection(t.task.fields.priority),
    })
    .default(TASK_PRIORITY.MEDIUM),

  /**
   * status: 数値 (デフォルト: 未着手)
   */
  status: z.coerce
    .number()
    .refine((val) => statusValues.includes(val), {
      message: t.validation.invalid_selection(t.task.fields.status),
    })
    .default(TASK_STATUS.TODO),
});

/**
 * ZodスキーマからTypeScriptの型を自動生成
 * (フォームが扱うデータ型)
 */
export type TaskFormInput = z.infer<typeof taskFormSchema>;
