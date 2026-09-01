/**
 * @file TasksPageClient.test.tsx
 * TasksPageClient コンポーネントの統合テスト
 *
 * タスク管理ページのオーケストレーター。useTasksQuery フックをモックし、
 * 一覧表示・フィルター・ソート・ページネーション・カレンダー操作・
 * ローディング/エラー/空状態を検証する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/tasks/_hooks/useTasks', () => ({
  useTasksQuery: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { buildMockTask } from '../../../utils/builders';
import { TasksPageClient } from '@/app/(workspace)/tasks/_components/TasksPageClient';
import { useTasksQuery } from '@/app/(workspace)/tasks/_hooks/useTasks';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';

// モック型キャスト
const mockUseTasksQuery = useTasksQuery as jest.MockedFunction<typeof useTasksQuery>;

// デフォルトのhooks戻り値を設定するヘルパー
function setupDefaultMocks(
  overrides: {
    tasks?: ReturnType<typeof buildMockTask>[];
    totalCount?: number;
    isLoading?: boolean;
    isError?: boolean;
  } = {}
) {
  const tasks = overrides.tasks ?? [
    buildMockTask({
      id: 'task-1',
      title: 'タスク一覧確認タスク',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.HIGH,
      dueAt: '2025-02-01T00:00:00Z',
      calendarLink: 'https://calendar.google.com/event/1',
    }),
  ];

  mockUseTasksQuery.mockReturnValue({
    tasks,
    totalCount: overrides.totalCount ?? tasks.length,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
    error: null,
  });
}

// 直近のuseTasksQuery呼び出し引数を取得するヘルパー
function getLastQueryArgs() {
  return mockUseTasksQuery.mock.calls.at(-1)?.[0];
}

// ═══ TasksPageClient ═══════════════════════════════════
describe('TasksPageClient', () => {
  const mockWindowOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
    window.open = mockWindowOpen;
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('ローディング中にローディングUIが表示される', () => {
      // Arrange
      setupDefaultMocks({ isLoading: true });

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('タスク一覧が表示される（タイトル・期限・優先度・ステータス）', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert: dueAt=2025-02-01T00:00:00Z → JST: 2025/02/01
      expect(screen.getByText('タスク一覧確認タスク')).toBeInTheDocument();
      expect(screen.getByText('2025/02/01')).toBeInTheDocument();
      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('未着手')).toBeInTheDocument();
    });

    it('タスク総件数がヘッダーに表示される', () => {
      // Arrange
      setupDefaultMocks({ totalCount: 42 });

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert: 「タスク一覧 (42)」がspan要素として表示される
      expect(
        screen.getByText(
          (content, element) =>
            element?.tagName.toLowerCase() === 'span' &&
            content.includes('タスク一覧') &&
            content.includes('42')
        )
      ).toBeInTheDocument();
    });

    it('検索ボタンクリックでフォームの入力値がフックに渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<TasksPageClient />);

      // Act: タイトルを入力して検索
      await user.type(screen.getByPlaceholderText('タイトル'), '会議');
      await user.click(screen.getByRole('button', { name: '検索' }));

      // Assert: 入力したタイトルと、変更していない他のフィルター値が渡される
      await waitFor(() => {
        expect(getLastQueryArgs()?.title).toBe('会議');
      });
      expect(getLastQueryArgs()?.statuses).toEqual([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS]);
      expect(getLastQueryArgs()?.page).toBe(1);
    });

    it('クリアボタンクリックでフィルターが初期状態に戻る', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<TasksPageClient />);
      const titleInput = screen.getByPlaceholderText('タイトル');
      await user.type(titleInput, '会議');
      await user.click(screen.getByRole('button', { name: '検索' }));
      await waitFor(() => {
        expect(getLastQueryArgs()?.title).toBe('会議');
      });

      // Act
      await user.click(screen.getByRole('button', { name: 'クリア' }));

      // Assert: 入力欄・フックへの引数がともに初期状態に戻る
      await waitFor(() => {
        expect(titleInput).toHaveValue('');
      });
      expect(getLastQueryArgs()?.title).toBe('');
      expect(getLastQueryArgs()?.statuses).toEqual([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS]);
    });

    it('ソートヘッダークリックでソートキー・順序が切り替わる', async () => {
      // Arrange: 初期状態は sortKey='priority', sortOrder='desc'
      const user = userEvent.setup();
      renderWithProviders(<TasksPageClient />);
      const titleSortButton = screen.getByRole('button', { name: 'タイトル' });

      // Act: 未アクティブなヘッダーをクリック → 昇順で選択される
      await user.click(titleSortButton);

      // Assert
      expect(getLastQueryArgs()?.sortKey).toBe('title');
      expect(getLastQueryArgs()?.sortOrder).toBe('asc');

      // Act: 同じヘッダーを再クリック → 降順に切り替わる
      await user.click(titleSortButton);

      // Assert
      expect(getLastQueryArgs()?.sortKey).toBe('title');
      expect(getLastQueryArgs()?.sortOrder).toBe('desc');
    });

    it('ページネーション操作でページが変わる', async () => {
      // Arrange: 総件数100件・20件/ページ → 5ページ
      const user = userEvent.setup();
      setupDefaultMocks({ totalCount: 100 });
      renderWithProviders(<TasksPageClient />);

      // Act
      await user.click(screen.getByRole('link', { name: '3' }));

      // Assert
      await waitFor(() => {
        expect(getLastQueryArgs()?.page).toBe(3);
      });
    });

    it('カレンダーボタンクリックでカレンダーリンクが新しいタブで開かれる', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(<TasksPageClient />);

      // Act
      await user.click(screen.getByRole('button', { name: 'カレンダーを表示' }));

      // Assert
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://calendar.google.com/event/1',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('カレンダーリンク未設定タスクではカレンダーボタンがdisabledになる', () => {
      // Arrange
      setupDefaultMocks({
        tasks: [buildMockTask({ id: 'task-1', title: 'リンクなしタスク', calendarLink: null })],
      });

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert
      expect(screen.getByRole('button', { name: 'カレンダーを表示' })).toBeDisabled();
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('データ取得失敗時にエラーメッセージが表示される', () => {
      // Arrange
      setupDefaultMocks({ isError: true, tasks: [] });

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert: t.ui.error_loading(t.task.name)
      expect(
        screen.getByText('エラーが発生しました。タスクの読み込みに失敗しました。')
      ).toBeInTheDocument();
    });

    it('タスクが0件の場合に空状態が表示される', () => {
      // Arrange
      setupDefaultMocks({ tasks: [], totalCount: 0 });

      // Act
      renderWithProviders(<TasksPageClient />);

      // Assert: t.ui.no_items(t.task.name)
      expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      // Arrange
      const { container } = renderWithProviders(<TasksPageClient />);

      // Act
      const results = await axe(container);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
