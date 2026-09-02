/**
 * @file emails.test.ts
 * メール取得 Server Action（getEmails）の単体テスト
 *
 * Gmail連携APIの実装までのモック実装に対して、フィルタ（件名・送信者・受信日の範囲）と
 * ページネーションのロジックを検証する。
 */

import { getEmails } from '@/app/(workspace)/emails/actions';

describe('getEmails', () => {
  describe('正常系', () => {
    it('全件取得時、totalCountとページ内件数が一致する', async () => {
      // Act
      const result = await getEmails({ page: 1, limit: 10 });

      // Assert
      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.emails).toHaveLength(10);
    });

    it('件名（部分一致・大文字小文字を区別しない）でフィルタできる', async () => {
      // Act
      const result = await getEmails({ page: 1, limit: 100, subject: 'プロジェクト進捗' });

      // Assert
      expect(result.emails.length).toBeGreaterThan(0);
      expect(result.emails.every((email) => email.subject.includes('プロジェクト進捗'))).toBe(
        true
      );
    });

    it('送信者（部分一致）でフィルタできる', async () => {
      // Act
      const result = await getEmails({ page: 1, limit: 100, from: 'hr@example.com' });

      // Assert
      expect(result.emails.length).toBeGreaterThan(0);
      expect(result.emails.every((email) => email.from === 'hr@example.com')).toBe(true);
    });

    it('受信日の範囲（開始日〜終了日）でフィルタできる', async () => {
      // Arrange: 絞り込み前の全件数を取得しておく
      const all = await getEmails({ page: 1, limit: 100 });

      // Act
      const result = await getEmails({
        page: 1,
        limit: 100,
        dateFrom: '2026-03-10',
        dateTo: '2026-03-12',
      });

      // Assert: 範囲内の日付のみ含まれ（終了日を含む）、全件より絞り込まれている
      expect(result.emails.length).toBeGreaterThan(0);
      expect(result.emails.length).toBeLessThan(all.emails.length);
      result.emails.forEach((email) => {
        const receivedAt = new Date(email.receivedAt).getTime();
        expect(receivedAt).toBeGreaterThanOrEqual(new Date('2026-03-10T00:00:00Z').getTime());
        expect(receivedAt).toBeLessThanOrEqual(new Date('2026-03-12T23:59:59.999Z').getTime());
      });
    });

    it('件名・送信者の複数条件を組み合わせてフィルタできる', async () => {
      // Act
      const result = await getEmails({
        page: 1,
        limit: 100,
        subject: '存在しないはずの件名キーワード',
        from: 'hr@example.com',
      });

      // Assert: 両方の条件を満たすメールはないため空になる
      expect(result.emails).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('ページネーションで指定件数ずつ取得できる', async () => {
      // Act
      const page1 = await getEmails({ page: 1, limit: 5 });
      const page2 = await getEmails({ page: 2, limit: 5 });

      // Assert
      expect(page1.emails).toHaveLength(5);
      expect(page2.emails).toHaveLength(5);
      expect(page1.totalCount).toBe(page2.totalCount);
      // ページ間でメールが重複しない
      const page1Ids = page1.emails.map((email) => email.id);
      const page2Ids = page2.emails.map((email) => email.id);
      expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false);
    });

    it('総件数を超えるページを指定すると空配列を返す', async () => {
      // Act
      const result = await getEmails({ page: 999, limit: 10 });

      // Assert
      expect(result.emails).toHaveLength(0);
      expect(result.totalCount).toBeGreaterThan(0);
    });
  });

  describe('異常系', () => {
    it('該当するメールが存在しないフィルタ条件では空配列を返す', async () => {
      // Act
      const result = await getEmails({ page: 1, limit: 10, subject: '該当しないはずの件名' });

      // Assert
      expect(result.emails).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('page に 0 以下を指定しても1ページ目として扱われる', async () => {
      // Act
      const page0 = await getEmails({ page: 0, limit: 5 });
      const page1 = await getEmails({ page: 1, limit: 5 });

      // Assert
      expect(page0.emails.map((email) => email.id)).toEqual(page1.emails.map((email) => email.id));
    });
  });
});
