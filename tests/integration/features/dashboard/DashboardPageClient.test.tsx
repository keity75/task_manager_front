/**
 * @file DashboardPageClient.test.tsx
 * DashboardPageClient コンポーネントの統合テスト
 *
 * ダッシュボードページのオーケストレーター。hooks モックを使用。
 * ローディング制御・統計表示・メール/タスク一覧の検証が中心。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/tasks/_hooks/useTasks', () => ({
  useTasksQuery: jest.fn(),
  useTaskSummaryQuery: jest.fn(),
}));
// CreateTaskDialog は独自のミューテーション（next-auth 経由のServer Action）を持つため、
// このテストの関心事（ダッシュボードのオーケストレーション）から切り離してスタブ化する
jest.mock('@/app/(workspace)/tasks/_components/CreateTaskDialog', () => ({
  CreateTaskDialog: () => <div data-testid='create-task-dialog-mock' />,
}));

import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { buildMockTask } from '../../../utils/builders';
import { DashboardPageClient } from '@/app/(workspace)/dashboard/_components/DashboardPageClient';
import { useTasksQuery, useTaskSummaryQuery } from '@/app/(workspace)/tasks/_hooks/useTasks';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';

// モック型キャスト
const mockUseTasksQuery = useTasksQuery as jest.MockedFunction<typeof useTasksQuery>;
const mockUseTaskSummaryQuery = useTaskSummaryQuery as jest.MockedFunction<
  typeof useTaskSummaryQuery
>;

// デフォルトのhooks戻り値を設定するヘルパー
// DashboardPageClient は多数の hooks を使用するため、全てのデフォルト戻り値を一箇所で管理する
function setupDefaultMocks(
  overrides: {
    tasks?: ReturnType<typeof buildMockTask>[];
    summary?: { total: number; todo: number; inProgress: number; done: number } | undefined;
  } = {}
) {
  const tasks = overrides.tasks ?? [
    buildMockTask({
      id: 'task-1',
      title: 'ダッシュボード タスク1',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.HIGH,
    }),
  ];
  const summary =
    overrides.summary !== undefined
      ? overrides.summary
      : { total: 5, todo: 2, inProgress: 2, done: 1 };

  mockUseTasksQuery.mockReturnValue({
    tasks,
    totalCount: tasks.length,
    isLoading: false,
    isError: false,
    error: null,
  });

  mockUseTaskSummaryQuery.mockReturnValue({
    summary,
    isLoading: false,
    isError: false,
    error: null,
  });
}

// ═══ DashboardPageClient ══════════════════════════════
describe('DashboardPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  // ローディング・統計・一覧を検証する
  describe('正常系', () => {
    it('ローディング中にローディングUIが表示される', () => {
      // Arrange: tasksLoading を true にする（いずれかが true で全体がローディング）
      mockUseTasksQuery.mockReturnValue({
        tasks: [],
        totalCount: 0,
        isLoading: true,
        isError: false,
        error: null,
      });

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert: ページレベルのローディング表示（子コンポーネントは未レンダリング）
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('タスク統計情報（4カード）が表示される', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert: 4つのカードラベルとその値が表示される
      expect(screen.getByText('タスク総数')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('未着手タスク')).toBeInTheDocument();
      // todo=2 と inProgress=2 で同じ数値「2」が2つ表示される
      expect(screen.getAllByText('2')).toHaveLength(2);
      expect(screen.getByText('処理中タスク')).toBeInTheDocument();
      expect(screen.getByText('完了タスク')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('直近のメールセクションが表示される', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert
      expect(screen.getByRole('heading', { name: '最新メール一覧' })).toBeInTheDocument();
    });

    it('直近のタスク一覧が表示される', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert
      expect(screen.getByText('ダッシュボード タスク1')).toBeInTheDocument();
    });

    it('タスク管理ヘッダーにタスク作成モーダルの導線が表示される', () => {
      // Arrange: setupDefaultMocks

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert: UpcomingTasks（「タスク管理」ヘッダー）内にCreateTaskDialogが配置される
      expect(screen.getByTestId('create-task-dialog-mock')).toBeInTheDocument();
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  // データ取得失敗時の空状態を検証する
  describe('異常系', () => {
    it('データ取得失敗時に空状態が表示される', () => {
      // Arrange: 全クエリを空データで返す
      // DashboardPageClient は isError を使用しないため、空データで空状態を検証
      // summary=undefined で DashboardStats は null を返す（カード非表示）
      setupDefaultMocks({ tasks: [], summary: undefined });

      // Act
      renderWithProviders(<DashboardPageClient />);

      // Assert: UpcomingTasks の空状態メッセージ（t.ui.no_items('タスク')）
      expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  // jest-axe による違反チェックを検証する
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      // Arrange
      const { container } = renderWithProviders(<DashboardPageClient />);

      // Act
      const results = await axe(container);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
