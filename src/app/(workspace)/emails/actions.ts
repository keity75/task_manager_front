'use server';

/**
 * @file
 * [Feature Server Actions (Email)]
 * * このファイルは、「メール」機能に関連するすべての「サーバーサイドの操作」を定義します。
 * (Next.js Server Actions)
 * * 現状はGmail連携APIが未実装のため、モックデータを返す暫定実装です。
 * バックエンドAPI（Gmail連携）実装後、authApi経由の呼び出しに置き換える想定です。
 * * @see app/(workspace)/emails/_hooks/useEmails.ts (Reactフック)
 */

import { GetEmailsResponse } from './types';
import { buildMockEmails } from './mock-data';

const MOCK_EMAILS = buildMockEmails();

// モックAPIのレイテンシを模倣する
async function simulateNetworkDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// Read
export async function getEmails(options: {
  page: number;
  limit: number;
  subject?: string;
  from?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}): Promise<GetEmailsResponse> {
  const { page, limit, subject, from, dateFrom, dateTo } = options;

  await simulateNetworkDelay();

  let filtered = MOCK_EMAILS;

  if (subject) {
    const keyword = subject.toLowerCase();
    filtered = filtered.filter((email) => email.subject.toLowerCase().includes(keyword));
  }
  if (from) {
    const keyword = from.toLowerCase();
    filtered = filtered.filter((email) => email.from.toLowerCase().includes(keyword));
  }
  if (dateFrom) {
    const fromTime = new Date(dateFrom).getTime();
    filtered = filtered.filter((email) => new Date(email.receivedAt).getTime() >= fromTime);
  }
  if (dateTo) {
    // 終了日を含めるため、指定日の終わり（23:59:59.999）まで対象にする
    const toTime = new Date(dateTo).getTime() + (24 * 60 * 60 * 1000 - 1);
    filtered = filtered.filter((email) => new Date(email.receivedAt).getTime() <= toTime);
  }

  const totalCount = filtered.length;
  const safePage = Math.max(page, 1);
  const offset = (safePage - 1) * limit;
  const emails = filtered.slice(offset, offset + limit);

  return { emails, totalCount };
}
