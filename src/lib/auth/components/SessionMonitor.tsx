'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { isLogoutRequiredError } from '@/lib/auth/validation';
import { ROUTES } from '@/lib/constants/routes';

/**
 * セッション監視コンポーネント
 *
 * セッションエラー（トークンリフレッシュ失敗等）を検出し、
 * 自動的にログアウト処理を実行します。
 *
 * NextAuthのデフォルト動作を利用:
 * - タブにフォーカスが戻った時にセッションを再取得
 * - ネットワーク再接続時にセッションを再取得
 */
export function SessionMonitor() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.error) {
      return;
    }

    if (!isLogoutRequiredError(session.error)) {
      return;
    }

    console.warn('Session error detected, signing out:', session.error);

    // 自動ログアウト（NextAuthセッションをクリア）
    signOut({ callbackUrl: ROUTES.LOGIN, redirect: true });
  }, [session, status]);

  return null; // UIを持たない監視専用コンポーネント
}
