/**
 * @file EmailsPageClient.test.tsx
 * EmailsPageClient コンポーネントの統合テスト
 *
 * メール管理ページのオーケストレーター。useEmailsQuery フックをモックし、
 * 一覧表示・フィルター・ページネーション・更新ボタン・詳細モーダル・
 * ローディング/エラー/空状態を検証する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/emails/_hooks/useEmails', () => ({
  useEmailsQuery: jest.fn(),
}));

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { EmailsPageClient } from '@/app/(workspace)/emails/_components/EmailsPageClient';
import { useEmailsQuery } from '@/app/(workspace)/emails/_hooks/useEmails';
import type { Email } from '@/app/(workspace)/emails/types';

// モック型キャスト
const mockUseEmailsQuery = useEmailsQuery as jest.MockedFunction<typeof useEmailsQuery>;

function buildMockEmail(overrides?: Partial<Email>): Email {
  return {
    id: 'email-1',
    subject: '来週の打ち合わせ日程について',
    from: 'tanaka@example.com',
    receivedAt: '2026-03-10T01:20:00Z',
    body: '来週の打ち合わせについてご連絡いたします。\nよろしくお願いいたします。',
    ...overrides,
  };
}

// デフォルトのhooks戻り値を設定するヘルパー
function setupDefaultMocks(
  overrides: {
    emails?: Email[];
    totalCount?: number;
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
    refetch?: jest.Mock;
  } = {}
) {
  const emails = overrides.emails ?? [buildMockEmail()];

  mockUseEmailsQuery.mockReturnValue({
    emails,
    totalCount: overrides.totalCount ?? emails.length,
    isLoading: overrides.isLoading ?? false,
    isFetching: overrides.isFetching ?? false,
    isError: overrides.isError ?? false,
    error: null,
    refetch: overrides.refetch ?? jest.fn(),
  });
}

// 直近のuseEmailsQuery呼び出し引数を取得するヘルパー
function getLastQueryArgs() {
  return mockUseEmailsQuery.mock.calls.at(-1)?.[0];
}

// ═══ EmailsPageClient ═══════════════════════════════════
describe('EmailsPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('ローディング中にローディングUIが表示される', () => {
      // Arrange
      setupDefaultMocks({ isLoading: true });

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('メール一覧が表示される（件名・送信者・受信日時）', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert: receivedAt=2026-03-10T01:20:00Z → JST: 2026/03/10 10:20
      expect(screen.getByText('来週の打ち合わせ日程について')).toBeInTheDocument();
      expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
      expect(screen.getByText('2026/03/10 10:20')).toBeInTheDocument();
    });

    it('メール総件数がヘッダーに表示される', () => {
      // Arrange
      setupDefaultMocks({ totalCount: 42 });

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert
      expect(
        screen.getByText(
          (content, element) =>
            element?.tagName.toLowerCase() === 'span' &&
            content.includes('メール一覧') &&
            content.includes('42')
        )
      ).toBeInTheDocument();
    });

    it('検索ボタンクリックでフォームの入力値がフックに渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);

      // Act: 件名を入力して検索
      await user.type(screen.getByPlaceholderText('件名'), '打ち合わせ');
      await user.click(screen.getByRole('button', { name: '検索' }));

      // Assert
      await waitFor(() => {
        expect(getLastQueryArgs()?.subject).toBe('打ち合わせ');
      });
      expect(getLastQueryArgs()?.page).toBe(1);
    });

    it('クリアボタンクリックでフィルターが初期状態に戻る', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);
      const subjectInput = screen.getByPlaceholderText('件名');
      await user.type(subjectInput, '打ち合わせ');
      await user.click(screen.getByRole('button', { name: '検索' }));
      await waitFor(() => {
        expect(getLastQueryArgs()?.subject).toBe('打ち合わせ');
      });

      // Act
      await user.click(screen.getByRole('button', { name: 'クリア' }));

      // Assert
      await waitFor(() => {
        expect(subjectInput).toHaveValue('');
      });
      expect(getLastQueryArgs()?.subject).toBe('');
    });

    it('ページネーション操作でページが変わる', async () => {
      // Arrange: 総件数100件・10件/ページ → 10ページ
      const user = userEvent.setup();
      setupDefaultMocks({ totalCount: 100 });
      renderWithProviders(<EmailsPageClient />);

      // Act
      await user.click(screen.getByRole('link', { name: '3' }));

      // Assert
      await waitFor(() => {
        expect(getLastQueryArgs()?.page).toBe(3);
      });
    });

    it('更新ボタンクリックでrefetchが呼ばれる', async () => {
      // Arrange
      const user = userEvent.setup();
      const refetch = jest.fn();
      setupDefaultMocks({ refetch });
      renderWithProviders(<EmailsPageClient />);

      // Act
      await user.click(screen.getByRole('button', { name: '更新' }));

      // Assert
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('更新中は更新ボタンが無効化され、更新中表示になる', () => {
      // Arrange
      setupDefaultMocks({ isFetching: true });

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert
      expect(screen.getByRole('button', { name: '更新中...' })).toBeDisabled();
    });

    it('行をクリックすると詳細モーダルに件名・送信者・受信日時・本文が表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);

      // Act
      await user.click(screen.getByText('来週の打ち合わせ日程について'));

      // Assert: モーダルの見出しは固定文言「メール詳細」
      expect(screen.getByRole('heading', { name: 'メール詳細' })).toBeInTheDocument();
      expect(
        screen.getByText('来週の打ち合わせについてご連絡いたします。', { exact: false })
      ).toBeInTheDocument();
      // 一覧とモーダルの両方に件名・送信者・受信日時が表示されるため、件数で存在を確認する
      expect(screen.getAllByText('来週の打ち合わせ日程について')).toHaveLength(2);
      expect(screen.getAllByText('tanaka@example.com')).toHaveLength(2);
      expect(screen.getAllByText('2026/03/10 10:20')).toHaveLength(2);
    });

    it('送信者と受信日時が横並びで表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);

      // Act
      await user.click(screen.getByText('来週の打ち合わせ日程について'));

      // Assert: 送信者・受信日時が同じgrid行内に配置される（モーダル内に絞り込んで検証）
      const dialog = screen.getByRole('dialog');
      const fromLabel = within(dialog).getByText('送信者');
      const receivedAtLabel = within(dialog).getByText('受信日時');
      expect(fromLabel.parentElement?.parentElement).toBe(
        receivedAtLabel.parentElement?.parentElement
      );
    });

    it('右上の閉じるボタンでモーダルを閉じても一覧に影響しない', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);
      await user.click(screen.getByText('来週の打ち合わせ日程について'));
      expect(screen.getByRole('heading', { name: 'メール詳細' })).toBeInTheDocument();

      // Act: DialogContent右上の閉じるボタン（アクセシブルネームは実装上 "Close"）
      await user.click(screen.getByRole('button', { name: 'Close' }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'メール詳細' })).not.toBeInTheDocument();
      });
      // 一覧の行は引き続き表示されている
      expect(screen.getByText('来週の打ち合わせ日程について')).toBeInTheDocument();
    });

    it('右下の「閉じる」ボタンでモーダルを閉じても一覧に影響しない', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);
      await user.click(screen.getByText('来週の打ち合わせ日程について'));
      expect(screen.getByRole('heading', { name: 'メール詳細' })).toBeInTheDocument();

      // Act: フッターの「閉じる」ボタン
      await user.click(screen.getByRole('button', { name: '閉じる' }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'メール詳細' })).not.toBeInTheDocument();
      });
      // 一覧の行は引き続き表示されている
      expect(screen.getByText('来週の打ち合わせ日程について')).toBeInTheDocument();
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('データ取得失敗時にエラーメッセージが表示される', () => {
      // Arrange
      setupDefaultMocks({ isError: true, emails: [] });

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert: t.ui.error_loading(t.email.name)
      expect(
        screen.getByText('エラーが発生しました。メールの読み込みに失敗しました。')
      ).toBeInTheDocument();
    });

    it('メールが0件の場合に空状態が表示される', () => {
      // Arrange
      setupDefaultMocks({ emails: [], totalCount: 0 });

      // Act
      renderWithProviders(<EmailsPageClient />);

      // Assert: t.ui.no_items(t.email.name)
      expect(screen.getByText('メールがありません')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      // Arrange
      const { container } = renderWithProviders(<EmailsPageClient />);

      // Act
      const results = await axe(container);

      // Assert
      expect(results).toHaveNoViolations();
    });

    it('詳細モーダルが開いた状態でアクセシビリティ違反がない', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<EmailsPageClient />);
      await user.click(screen.getByText('来週の打ち合わせ日程について'));

      // Act: DialogContentはPortalでdocument.body直下に描画されるため、document.bodyを検査する
      const results = await axe(document.body);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
