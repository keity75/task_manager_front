import { LOGOUT_REQUIRED_ERRORS } from '@/lib/constants/auth';

/**
 * エラーが自動ログアウト対象かチェック
 *
 * @param error - セッションエラー文字列
 * @returns ログアウトが必要な場合true
 */
export function isLogoutRequiredError(error: string | undefined): boolean {
  if (!error) return false;
  return LOGOUT_REQUIRED_ERRORS.includes(error as (typeof LOGOUT_REQUIRED_ERRORS)[number]);
}
