/**
 * @file UpcomingTasks.test.tsx
 * UpcomingTasks コンポーネントの統合テスト
 *
 * UpcomingTasks はプレゼンテーショナルコンポーネントのため、hooks モック不要。
 * 表示内容とカレンダーボタンの操作・disabled 状態の検証が中心。
 */

// CreateTaskDialog/EditTaskDialog/DeleteTaskDialog は独自のミューテーション（next-auth 経由の
// Server Action）を持つため、このテストの関心事（表示・カレンダー操作）から切り離してスタブ化する
jest.mock('@/app/(workspace)/tasks/_components/CreateTaskDialog', () => ({
  CreateTaskDialog: () => <div data-testid='create-task-dialog-mock' />,
}));
// 選択中タスクがEditTaskDialog/DeleteTaskDialogに正しく渡っているかを検証できるよう、
// taskプロパティをタイトルとして描画するスタブにする（task=nullのときは何も描画しない）
jest.mock('@/app/(workspace)/tasks/_components/EditTaskDialog', () => ({
  EditTaskDialog: ({ task }: { task: { title: string } | null }) =>
    task ? <div data-testid='edit-task-dialog-mock'>{task.title}</div> : null,
}));
jest.mock('@/app/(workspace)/tasks/_components/DeleteTaskDialog', () => ({
  DeleteTaskDialog: ({ task }: { task: { title: string } | null }) =>
    task ? <div data-testid='delete-task-dialog-mock'>{task.title}</div> : null,
}));

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { buildMockTask } from '../../../utils/builders';
import { UpcomingTasks } from '@/app/(workspace)/dashboard/_components/UpcomingTasks';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';

// ═══ UpcomingTasks ═════════════════════════════════════
describe('UpcomingTasks', () => {
  // デフォルト props ファクトリ
  const createDefaultProps = (overrides = {}) => ({
    tasks: [
      buildMockTask({
        id: 'task-1',
        title: 'テストタスク1',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH,
        dueAt: '2025-02-01T00:00:00Z',
        calendarLink: 'https://calendar.google.com/event/1',
      }),
    ],
    onCalendarClick: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  // レンダリング・カレンダーアクションを検証する
  describe('正常系', () => {
    it('タスク一覧が正しくレンダリングされる', () => {
      // Arrange
      const props = createDefaultProps({
        tasks: [
          buildMockTask({ id: 'task-1', title: 'タスクA' }),
          buildMockTask({ id: 'task-2', title: 'タスクB' }),
        ],
      });

      // Act
      renderWithProviders(<UpcomingTasks {...props} />);

      // Assert
      expect(screen.getByText('タスクA')).toBeInTheDocument();
      expect(screen.getByText('タスクB')).toBeInTheDocument();
    });

    it('各タスク行に優先度バッジ・タイトル・ステータス・期限が表示される', () => {
      // Arrange: priority=HIGH → 「高」、status=TODO → 「未着手」、dueAt=2025-02-01T00:00:00Z → JST: 2025/02/01 09:00
      const props = createDefaultProps({
        tasks: [
          buildMockTask({
            id: 'task-1',
            title: '優先度確認タスク',
            priority: TASK_PRIORITY.HIGH,
            status: TASK_STATUS.TODO,
            dueAt: '2025-02-01T00:00:00Z',
          }),
        ],
      });

      // Act
      renderWithProviders(<UpcomingTasks {...props} />);

      // Assert: 優先度ラベル・タイトル・ステータスラベル・期限日時
      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('優先度確認タスク')).toBeInTheDocument();
      expect(screen.getByText('未着手')).toBeInTheDocument();
      expect(screen.getByText(/2025\/02\/01 09:00/)).toBeInTheDocument();
    });

    it('dueAtがnullの場合「未設定」が表示される', () => {
      // Arrange
      const props = createDefaultProps({
        tasks: [buildMockTask({ id: 'task-1', title: '期限なしタスク', dueAt: null })],
      });

      // Act
      renderWithProviders(<UpcomingTasks {...props} />);

      // Assert: t.ui.not_set = 「未設定」
      expect(screen.getByText(/未設定/)).toBeInTheDocument();
    });

    it('空状態(0件)で「タスクがありません」が表示される', () => {
      // Arrange
      const props = createDefaultProps({ tasks: [] });

      // Act
      renderWithProviders(<UpcomingTasks {...props} />);

      // Assert: t.ui.no_items(t.task.name) = 「タスクがありません」
      expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    });

    it('カレンダーボタン有効時にonCalendarClickが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnCalendarClick = jest.fn();
      const task = buildMockTask({
        id: 'task-1',
        title: 'カレンダータスク',
        calendarLink: 'https://calendar.google.com/event/1',
      });
      const props = createDefaultProps({ tasks: [task], onCalendarClick: mockOnCalendarClick });
      renderWithProviders(<UpcomingTasks {...props} />);

      // Act: カレンダーボタンをクリック
      await user.click(screen.getByRole('button', { name: 'Googleカレンダーで開く' }));

      // Assert
      expect(mockOnCalendarClick).toHaveBeenCalledWith(task);
    });

    it('カレンダーボタンがcalendarLink未設定の場合はdisabledになる', () => {
      // Arrange
      const props = createDefaultProps({
        tasks: [buildMockTask({ id: 'task-1', title: 'リンクなしタスク', calendarLink: null })],
      });
      renderWithProviders(<UpcomingTasks {...props} />);

      // Act & Assert
      expect(screen.getByRole('button', { name: 'Googleカレンダーで開く' })).toBeDisabled();
    });

    it('編集アイコンクリックで編集モーダルにそのタスクが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      const task = buildMockTask({ id: 'task-1', title: '編集対象タスク' });
      renderWithProviders(<UpcomingTasks {...createDefaultProps({ tasks: [task] })} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'タスクを編集' }));

      // Assert
      expect(screen.getByTestId('edit-task-dialog-mock')).toHaveTextContent('編集対象タスク');
    });

    it('削除アイコンクリックで削除モーダルにそのタスクが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });
      renderWithProviders(<UpcomingTasks {...createDefaultProps({ tasks: [task] })} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'タスクを削除' }));

      // Assert
      expect(screen.getByTestId('delete-task-dialog-mock')).toHaveTextContent('削除対象タスク');
    });

    it('ヘッダー右端にタスク作成モーダルの導線が表示される', () => {
      // Arrange
      const props = createDefaultProps();

      // Act
      renderWithProviders(<UpcomingTasks {...props} />);

      // Assert
      expect(screen.getByTestId('create-task-dialog-mock')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  // jest-axe による違反チェックを検証する
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      // Arrange
      const props = createDefaultProps();
      const { container } = renderWithProviders(<UpcomingTasks {...props} />);

      // Act
      const results = await axe(container);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
