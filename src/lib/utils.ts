import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を条件付きで安全にマージするユーティリティ関数
 *
 * @param inputs - クラス名、条件付きクラス名、配列、オブジェクトなど
 * @returns マージされたクラス名文字列
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500')
 * cn('px-2', { 'bg-blue-500': isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
