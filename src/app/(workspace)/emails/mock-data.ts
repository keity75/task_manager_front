/**
 * @file
 * メール一覧のモックデータ生成
 *
 * Gmail連携APIの実装までの間、画面確認・動作検証に使うモックデータを提供する。
 * バックエンドAPI実装後にこのファイルと actions.ts のモック実装は不要になる。
 */

import { Email } from './types';

const MOCK_SENDERS = [
  'tanaka@example.com',
  'hr@example.com',
  'project@example.com',
  'sato@example.com',
  'suzuki@example.com',
  'support@example.com',
];

const MOCK_SUBJECT_TEMPLATES = [
  '来週の打ち合わせ日程について',
  '契約更新に関するご連絡',
  'プロジェクト進捗共有',
  '請求書送付のお知らせ',
  '新機能リリースのご案内',
  '定例会議の議事録',
  'システムメンテナンスのお知らせ',
  'アンケートのお願い',
];

const MOCK_EMAIL_COUNT = 42;
const MOCK_BASE_RECEIVED_AT = '2026-03-15T09:00:00Z';
const MOCK_INTERVAL_HOURS = 6;

export function buildMockEmails(): Email[] {
  const baseDate = new Date(MOCK_BASE_RECEIVED_AT);

  return Array.from({ length: MOCK_EMAIL_COUNT }, (_, i) => {
    const sender = MOCK_SENDERS[i % MOCK_SENDERS.length];
    const subject = `${MOCK_SUBJECT_TEMPLATES[i % MOCK_SUBJECT_TEMPLATES.length]}（${i + 1}）`;
    const receivedAt = new Date(
      baseDate.getTime() - i * MOCK_INTERVAL_HOURS * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `mock-email-${i + 1}`,
      subject,
      from: sender,
      receivedAt,
      body: `${subject}\n\nお世話になっております。\n${sender} です。\n\n本メールはモックデータです。バックエンドAPI（Gmail連携）実装後に実データへ切り替わります。\n\nよろしくお願いいたします。`,
    };
  });
}
