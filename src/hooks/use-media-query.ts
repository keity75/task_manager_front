'use client';

import { useEffect, useState } from 'react';

/**
 * メディアクエリをフックとして使用するカスタムフック
 * window.matchMediaをラップし、画面幅の変化に応じてリアルタイムで更新する
 *
 * @param query - メディアクエリ文字列（例: "(min-width: 768px)"）
 * @returns メディアクエリにマッチするかどうかの真偽値
 *
 * @example
 * // タブレット以上の画面幅かどうか判定
 * const isTablet = useMediaQuery('(min-width: 768px)');
 *
 * @example
 * // モバイル画面かどうか判定
 * const isMobile = useMediaQuery('(max-width: 767px)');
 *
 * @example
 * // 条件付きレンダリング
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * return isDesktop ? <DesktopNav /> : <MobileNav />;
 */
export function useMediaQuery(query: string): boolean {
  // サーバーサイドレンダリング時のデフォルト値（false）
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // MediaQueryListオブジェクトを作成
    const mediaQueryList = window.matchMedia(query);

    // 初期値を設定
    setMatches(mediaQueryList.matches);

    // メディアクエリの変化を監視するハンドラ
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // イベントリスナーを追加（モダンAPI）
    mediaQueryList.addEventListener('change', handleChange);

    // クリーンアップ関数
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * よく使用されるブレークポイントのヘルパーフック
 */

/**
 * モバイル画面かどうか判定（768px未満）
 *
 * @returns モバイル画面の場合true
 *
 * @example
 * const isMobile = useIsMobile();
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * タブレット画面かどうか判定（768px以上、1024px未満）
 *
 * @returns タブレット画面の場合true
 *
 * @example
 * const isTablet = useIsTablet();
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * デスクトップ画面かどうか判定（1024px以上）
 *
 * @returns デスクトップ画面の場合true
 *
 * @example
 * const isDesktop = useIsDesktop();
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
