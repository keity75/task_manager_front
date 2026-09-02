'use server';

/**
 * @file
 * [Feature Server Actions (Email)]
 * * このファイルは、「メール」機能に関連するすべての「サーバーサイドの操作」を定義します。
 * (Next.js Server Actions)
 * * 責務:
 * 1. API層（FastAPI/Gmail連携）との直接通信
 * 2. APIが期待する入力データ型は types.ts で定義
 * * このファイルの関数は、原則として
 * emails/_hooks/useEmails.ts (TanStack Queryの queryFn) から呼び出されます。
 * * @see app/(workspace)/emails/_hooks/useEmails.ts (Reactフック)
 */

import { authApi } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { Email, EmailDetail, GetEmailsResponse } from './types';

// Read (一覧)
export async function getEmails(options: {
  page: number;
  limit: number;
  subject?: string;
  from?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}): Promise<GetEmailsResponse> {
  const { page, limit, subject, from, dateFrom, dateTo } = options;

  const safePage = Math.max(page, 1);
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String((safePage - 1) * limit),
  });

  if (subject) {
    searchParams.set('subject', subject);
  }
  if (from) {
    searchParams.set('from', from);
  }
  if (dateFrom) {
    searchParams.set('receivedAtFrom', dateFrom);
  }
  if (dateTo) {
    searchParams.set('receivedAtTo', dateTo);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.EMAILS.BASE}?${queryString}`
    : API_ENDPOINTS.EMAILS.BASE;
  const response = await authApi.get<Email[]>(endpoint);

  if (response.status !== 'success') {
    throw new Error('API returned error status');
  }

  // データ構造のチェック (dataが配列でない場合)
  if (!Array.isArray(response.data)) {
    const error = new Error('Invalid API response format: data is not an array');
    throw error;
  }

  return {
    emails: response.data,
    totalCount: response.pagination?.totalCount ?? 0,
  };
}

// Read (詳細)
export async function getEmail(id: string): Promise<EmailDetail> {
  const response = await authApi.get<EmailDetail>(API_ENDPOINTS.EMAILS.DETAIL(id));

  if (response.status !== 'success') {
    throw new Error('API returned error status');
  }

  if (!response.data) {
    const error = new Error('Invalid API response format: missing email data');
    throw error;
  }

  return response.data;
}
