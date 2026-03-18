/**
 * FastAPI標準レスポンス形式の型定義
 *
 * FastAPIバックエンドとの通信で使用する共通の型を定義します。
 * route.tsとapi-client.tsの両方で使用されます。
 */

/**
 * FastAPI成功レスポンス
 */
export interface FastApiSuccessResponse<T> {
  status: 'success';
  data: T;
  pagination?: {
    totalCount: number;
    limit: number;
    offset: number;
  };
}

/**
 * FastAPIエラーレスポンス
 */
export interface FastApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * FastAPIレスポンス（成功またはエラー）
 */
export type FastApiResponse<T> = FastApiSuccessResponse<T> | FastApiErrorResponse;

/**
 * タスク作成APIのレスポンス
 */
export interface TaskIdResponse {
  id: string;
}
