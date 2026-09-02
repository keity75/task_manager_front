/**
 * @file DeleteTaskDialog.test.tsx
 * DeleteTaskDialog コンポーネントの統合テスト
 *
 * タスク削除確認モーダル。actions（Server Action）をモックし、
 * 表示内容・確認/キャンセル操作・削除成功/失敗時のトースト表示を検証する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/tasks/actions', () => ({
  deleteTask: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { buildMockTask } from '../../../utils/builders';
import { DeleteTaskDialog } from '@/app/(workspace)/tasks/_components/DeleteTaskDialog';
import { deleteTask } from '@/app/(workspace)/tasks/actions';
import { Toaster } from '@/components/ui/toaster';

// モック型キャスト
const mockDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;

// トースト表示を確認するため、Toaster を併せてレンダリングする
function renderDialog(task: ReturnType<typeof buildMockTask> | null, onOpenChange = jest.fn()) {
  renderWithProviders(
    <>
      <DeleteTaskDialog task={task} onOpenChange={onOpenChange} />
      <Toaster />
    </>
  );
  return { onOpenChange };
}

// ═══ DeleteTaskDialog ══════════════════════════════════
describe('DeleteTaskDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('taskが渡されると確認モーダルが開き、対象タスクのタイトルが表示される', () => {
      // Arrange
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });

      // Act
      renderDialog(task);

      // Assert: 要件どおりの文言（タイトル・確認文・タスク名・警告文）
      expect(screen.getByRole('heading', { name: 'タスクの削除' })).toBeInTheDocument();
      expect(screen.getByText('本当にこのタスクを削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('「削除対象タスク」')).toBeInTheDocument();
      expect(screen.getByText('この操作は元に戻せません。')).toBeInTheDocument();
    });

    it('taskがnullの場合モーダルは表示されない', () => {
      // Arrange & Act
      renderDialog(null);

      // Assert
      expect(screen.queryByRole('heading', { name: 'タスクの削除' })).not.toBeInTheDocument();
    });

    it('削除するボタンクリックで削除が実行され、削除成功トーストが表示されモーダルが閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      mockDeleteTask.mockResolvedValue({ id: 'task-1' });
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });
      const { onOpenChange } = renderDialog(task);

      // Act
      await user.click(screen.getByRole('button', { name: '削除する' }));

      // Assert: 対象タスクのidで削除APIが呼ばれる
      await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
      });
      // Assert: 削除成功トースト
      expect(await screen.findByText('タスク削除成功')).toBeInTheDocument();
      expect(screen.getByText('タスクが正常に削除されました')).toBeInTheDocument();
      // Assert: モーダルを閉じる指示が親に伝わる
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('キャンセルボタンクリックで削除せずダイアログを閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });
      const { onOpenChange } = renderDialog(task);

      // Act
      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      // Assert
      expect(mockDeleteTask).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('削除に失敗した場合エラートーストが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      mockDeleteTask.mockRejectedValue(new Error('API error'));
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });
      renderDialog(task);

      // Act
      await user.click(screen.getByRole('button', { name: '削除する' }));

      // Assert
      expect(await screen.findByText('タスク削除失敗')).toBeInTheDocument();
      expect(screen.getByText('タスクの削除に失敗しました')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('モーダルが開いた状態でアクセシビリティ違反がない', async () => {
      // Arrange: DialogContentはPortalでdocument.body直下に描画されるため、containerではなくdocument.bodyを検査する
      const task = buildMockTask({ id: 'task-1', title: '削除対象タスク' });
      renderWithProviders(<DeleteTaskDialog task={task} onOpenChange={jest.fn()} />);

      // Act
      const results = await axe(document.body);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
