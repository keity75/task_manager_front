/**
 * Next.js Middleware
 *
 * 認証が必要なルートを保護し、未認証ユーザーをログインページにリダイレクト
 *
 * @module middleware
 */

import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse, NextFetchEvent } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { isCustomJWT } from '@/lib/types/auth';
import { ROUTES } from '@/lib/constants/routes';
import { isLogoutRequiredError } from '@/lib/auth/validation';

// メインのミドルウェア
export default async function middleware(req: NextRequestWithAuth, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // Basic認証 (サイト全体を保護)
  // 開発環境ではBasic認証をスキップ
  if (process.env.NODE_ENV === 'production') {
    const basicAuthUser = process.env.BASIC_AUTH_USER;
    const basicAuthPass = process.env.BASIC_AUTH_PASSWORD;
    if (basicAuthUser && basicAuthPass) {
      const basicAuth = req.headers.get('authorization');
      if (!basicAuth) return requestBasicAuth();

      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      if (user !== basicAuthUser || pwd !== basicAuthPass) return requestBasicAuth();
    }
  }

  // loginページ: 認証済みの場合はダッシュボードへリダイレクト
  if (pathname === ROUTES.LOGIN) {
    const token = await getToken({ req });
    if (token && isCustomJWT(token) && !isLogoutRequiredError(token.error)) {
      // 認証済みユーザーはダッシュボードにリダイレクト
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    }
    // 未認証ユーザーはログインページを表示
    return NextResponse.next();
  }

  // その他のルートはnext-authの認証ミドルウェアで保護
  return authMiddleware(req, event);
}

// Basic認証を要求するレスポンスを返すヘルパー関数
function requestBasicAuth() {
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
  });
}

//　next-authの認証ミドルウェア設定
const authMiddleware = withAuth(
  // `withAuth`の第1引数は、認証が成功した場合の処理
  function middleware(_req: NextRequestWithAuth) {
    // 認証済みユーザーの場合、そのまま続行
    return NextResponse.next();
  },
  {
    // `withAuth`の第2引数は、認証設定
    callbacks: {
      authorized: ({ token }: { token: JWT | null }) => {
        // トークンが存在しない場合は認証失敗
        if (!token) return false;

        // Type Guardで型を安全にチェック
        if (!isCustomJWT(token)) return false;

        if (token.error && isLogoutRequiredError(token.error)) {
          console.warn('Logout required error detected in middleware:', token.error);
          return false;
        }

        // トークンが有効な場合のみ認証成功
        return true;
      },
    },
    pages: {
      signIn: ROUTES.LOGIN,
    },
  }
);

/**
 * 認証が必要なルートのマッチパターン
 * - `/login` ルート
 * - `/dashboard` 配下のすべてのルート
 * - `/tasks` 配下のすべてのルート
 * - `/emails` 配下のすべてのルート
 */
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/tasks/:path*', '/emails/:path*'],
};
