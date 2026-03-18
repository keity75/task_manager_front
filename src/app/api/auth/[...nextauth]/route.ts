/**
 * NextAuth.js設定とAPIルートハンドラー
 *
 * OAuth2認証を処理し、バックエンドからAPIトークンを取得
 * Next.js 15 App Router形式で実装
 *
 * @module app/api/auth/[...nextauth]
 */

import NextAuth from 'next-auth';
import { NextAuthRouteContext } from '@/lib/types/auth';
import { authOptions } from '@/lib/auth/options';

// ============================================================================
// NextAuth ハンドラー
// ============================================================================

/**
 * NextAuth.jsハンドラー
 * Next.js 15 App Router形式でGETとPOSTリクエストを処理
 */
const handler = NextAuth(authOptions);

/**
 * 認証リクエストの共通ハンドラー
 * NextAuthのハンドラーを実行する
 */
async function handleAuthRequest(req: Request, context: NextAuthRouteContext) {
  return handler(req, context);
}

// ============================================================================
// Route Handlers (Exports)
// ============================================================================

/**
 * GETリクエストハンドラー
 */
export async function GET(req: Request, context: NextAuthRouteContext) {
  return handleAuthRequest(req, context);
}

/**
 * POSTリクエストハンドラー
 */
export async function POST(req: Request, context: NextAuthRouteContext) {
  return handleAuthRequest(req, context);
}
