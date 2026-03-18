import 'server-only';

/**
 * サーバー専用の環境変数検証と設定。
 *
 * Zodスキーマを使用して型安全に環境変数を検証します。
 * アプリケーション起動時（import時）に即座に検証されます。
 */

import { z } from 'zod';

/**
 * 環境変数スキーマ定義
 */
const envSchema = z.object({
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters'),

  // Node environment
  // Docker環境: docker-compose.ymlで明示的に設定
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

/**
 * 環境変数の検証と型付け
 * import時に即座に実行される
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Environment variable validation failed:');
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid or missing environment variables. Please check your .env file.');
}

/**
 * 型安全な環境変数
 * 全ての環境変数はZodスキーマで検証済み
 */
export const env = parsedEnv.data;

/**
 * Google OAuth設定
 */
export const googleOAuthConfig = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
} as const;

/**
 * NextAuth設定
 */
export const nextAuthConfig = {
  secret: env.NEXTAUTH_SECRET,
} as const;
