/**
 * アプリケーション全体のルート定数
 *
 * このファイルは全てのページパスを一元管理します。
 */

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
} as const;

/**
 * ルートパスから先頭の'/'を除いた型を抽出するヘルパー
 * 例: "/dashboard" → "dashboard"
 */
export type ExtractPath<T extends string> = T extends `/${infer P}` ? P : never;
