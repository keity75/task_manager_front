/**
 * @file UpcomingTasks.test.tsx
 * UpcomingTasks コンポーネントの統合テスト
 *
 * UpcomingTasks はプレゼンテーショナルコンポーネントのため、hooks モック不要。
 * 表示内容とカレンダーボタンの操作・disabled 状態の検証が中心。
 */

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
