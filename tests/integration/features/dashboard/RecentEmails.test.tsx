/**
 * @file RecentEmails.test.tsx
 * RecentEmails コンポーネントの統合テスト
 *
 * RecentEmails はプレゼンテーショナルコンポーネント（メール一覧の表示・選択状態の管理）。
 * EmailDetailModal は自身のデータ取得（useEmailQuery、next-auth 経由の Server Action）を
 * 持つため、このテストの関心事（一覧表示・選択操作）から切り離してスタブ化する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/emails/_components/EmailDetailModal', () => ({
  EmailDetailModal: ({ emailId }: { emailId: string | null }) =>
    emailId ? <div data-testid='email-detail-modal-mock'>{emailId}</div> : null,
}));

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { RecentEmails } from '@/app/(workspace)/dashboard/_components/RecentEmails';
import type { Email } from '@/app/(workspace)/emails/types';

function buildMockEmail(overrides?: Partial<Email>): Email {
  return {
    id: 'email-1',
    subject: '来週の打ち合わせ日程について',
    from: 'tanaka@example.com',
    receivedAt: '2026-03-10T01:20:00Z',
    ...overrides,
  };
}

// ═══ RecentEmails ══════════════════════════════════════
describe('RecentEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('メール一覧が正しくレンダリングされる（送信者・件名・受信日時）', () => {
      // Arrange: receivedAt=2026-03-10T01:20:00Z → JST: 2026/03/10 10:20
      const email = buildMockEmail();

      // Act
      renderWithProviders(<RecentEmails emails={[email]} />);

      // Assert
      expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
      expect(screen.getByText('来週の打ち合わせ日程について')).toBeInTheDocument();
      expect(screen.getByText('2026/03/10 10:20')).toBeInTheDocument();
    });

    it('複数件のメールがそれぞれ表示される', () => {
      // Arrange
      const emails = [
        buildMockEmail({ id: 'email-1', subject: 'メールA' }),
        buildMockEmail({ id: 'email-2', subject: 'メールB' }),
      ];

      // Act
      renderWithProviders(<RecentEmails emails={emails} />);

      // Assert
      expect(screen.getByText('メールA')).toBeInTheDocument();
      expect(screen.getByText('メールB')).toBeInTheDocument();
    });

    it('メールをクリックすると詳細モーダルにそのメールのidが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      const email = buildMockEmail({ id: 'email-42' });
      renderWithProviders(<RecentEmails emails={[email]} />);
      expect(screen.queryByTestId('email-detail-modal-mock')).not.toBeInTheDocument();

      // Act
      await user.click(screen.getByText('来週の打ち合わせ日程について'));

      // Assert
      expect(screen.getByTestId('email-detail-modal-mock')).toHaveTextContent('email-42');
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('空状態(0件)で「メールがありません」が表示される', () => {
      // Arrange & Act
      renderWithProviders(<RecentEmails emails={[]} />);

      // Assert: t.ui.no_items(t.email.name)
      expect(screen.getByText('メールがありません')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      // Arrange
      const { container } = renderWithProviders(<RecentEmails emails={[buildMockEmail()]} />);

      // Act
      const results = await axe(container);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
