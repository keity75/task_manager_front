import { CLIENT_ENV } from '@/lib/config/env.client';

/**
 * API関連の設定定義
 */
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// 返信文案生成APIパス
export const API_ENDPOINTS = {
  TASKS: {
    BASE: `${API_PREFIX}/tasks`,
    SUMMARY: `${API_PREFIX}/tasks/summary`,
  },
  AUTH: {
    SYNC: `${API_PREFIX}/auth/sync`,
    TOKEN_REFRESH: `${API_PREFIX}/auth/token/refresh`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
  },
} as const;

/**
 * APIのベースURL
 */
export const API_BASE_URL = CLIENT_ENV.API_BASE_URL;

/**
 * APIリクエストのタイムアウト時間（ミリ秒）
 */
export const API_TIMEOUT_MS = 130_000;

/**
 * HTTPステータスコード
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * エラーレスポンスのプレビュー最大文字数
 */
export const ERROR_PREVIEW_MAX_LENGTH = 100;

/**
 * TanStack Query リトライ設定
 */
export const QUERY_RETRY_CONFIG = {
  /** 最大リトライ回数（Query） */
  MAX_RETRY_COUNT: 3,

  /** Mutationのデフォルトはリトライしない。*/
  MUTATION_RETRY: false,
} as const;

/**
 * APIエラーコード
 */
export const API_ERROR_CODES = {
  /** 認証トークン欠落 */
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  /** トークンリフレッシュ失敗 */
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  /** プロバイダー権限取り消し */
  PROVIDER_PERMISSION_REVOKED: 'PROVIDER_PERMISSION_REVOKED',
} as const;

/**
 * TanStack Query 設定
 */
export const QUERY_CONFIG = {
  /** データの鮮度保持時間（ミリ秒）: 5分 */
  STALE_TIME_MS: 5 * 60 * 1000,

  /** リトライ初期間隔（ミリ秒）: 1秒 */
  RETRY_INITIAL_DELAY_MS: 1000,

  /** リトライ最大間隔（ミリ秒）: 30秒 */
  RETRY_MAX_DELAY_MS: 30 * 1000,
} as const;

/**
 * UI関連の定数
 */
export const UI_CONSTANTS = {
  /** コピー完了フィードバック表示時間（ミリ秒）: 2秒 */
  COPY_FEEDBACK_DURATION_MS: 2000,
} as const;
