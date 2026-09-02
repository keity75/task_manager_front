'use client';

import { t } from '@/lib/locales/i18n';
import { ROUTES, type ExtractPath } from './routes';

/**
 * ナビゲーションID定数（ROUTESから派生、ナビゲーション専用）
 * ROUTESのパスから'/'を除いた値を使用し、型アサーションでリテラル型を保持
 */
export const NAV_IDS = {
  DASHBOARD: ROUTES.DASHBOARD.slice(1) as ExtractPath<typeof ROUTES.DASHBOARD>,
  EMAILS: ROUTES.EMAILS.slice(1) as ExtractPath<typeof ROUTES.EMAILS>,
  TASKS: ROUTES.TASKS.slice(1) as ExtractPath<typeof ROUTES.TASKS>,
} as const;

/**
 * ナビゲーションIDの型（リテラル型のユニオン）
 */
export type NavId = (typeof NAV_IDS)[keyof typeof NAV_IDS];

export interface NavItem {
  id: NavId;
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: NAV_IDS.DASHBOARD,
    label: t.navigation.dashboard,
    href: ROUTES.DASHBOARD,
  },
  {
    id: NAV_IDS.EMAILS,
    label: t.navigation.emails,
    href: ROUTES.EMAILS,
  },
  {
    id: NAV_IDS.TASKS,
    label: t.navigation.tasks,
    href: ROUTES.TASKS,
  },
] as const;
