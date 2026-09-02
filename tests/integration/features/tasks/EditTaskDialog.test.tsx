/**
 * @file EditTaskDialog.test.tsx
 * EditTaskDialog コンポーネントの統合テスト
 *
 * タスク編集モーダル。actions（Server Action）をモックし、
 * プリフィル・必須バリデーション・更新成功/失敗時のトースト表示を検証する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/tasks/actions', () => ({
  updateTask: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { buildMockTask } from '../../../utils/builders';
import { EditTaskDialog } from '@/app/(workspace)/tasks/_components/EditTaskDialog';
import { updateTask } from '@/app/(workspace)/tasks/actions';
import { Toaster } from '@/components/ui/toaster';
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/constants/tasks';

// モック型キャスト
const mockUpdateTask = updateTask as jest.MockedFunction<typeof updateTask>;

// トースト表示を確認するため、Toaster を併せてレンダリングする
function renderDialog(task: ReturnType<typeof buildMockTask> | null, onOpenChange = jest.fn()) {
  renderWithProviders(
    <>
      <EditTaskDialog task={task} onOpenChange={onOpenChange} />
      <Toaster />
    </>
  );
  return { onOpenChange };
}

// ═══ EditTaskDialog ════════════════════════════════════
describe('EditTaskDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('taskが渡されるとモーダルが開き、既存情報がプリフィルされる', async () => {
      // Arrange
      const task = buildMockTask({
        id: 'task-1',
        title: '既存タスク',
        description: '既存の説明',
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.IN_PROGRESS,
      });

      // Act
      renderDialog(task);

      // Assert
      expect(screen.getByRole('heading', { name: 'タスク編集' })).toBeInTheDocument();
      expect(await screen.findByDisplayValue('既存タスク')).toBeInTheDocument();
      expect(screen.getByDisplayValue('既存の説明')).toBeInTheDocument();
    });

    it('taskがnullの場合モーダルは表示されない', () => {
      // Arrange & Act
      renderDialog(null);

      // Assert
      expect(screen.queryByRole('heading', { name: 'タスク編集' })).not.toBeInTheDocument();
    });

    it('内容を変更して更新すると、更新成功トーストが表示されモーダルが閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateTask.mockResolvedValue({ id: 'task-1' });
      const task = buildMockTask({ id: 'task-1', title: '既存タスク' });
      const { onOpenChange } = renderDialog(task);

      // Act
      const titleInput = await screen.findByDisplayValue('既存タスク');
      await user.clear(titleInput);
      await user.type(titleInput, '更新後タスク');
      await user.click(screen.getByRole('button', { name: '更新' }));

      // Assert: idと変更後の内容でAPIが呼ばれる
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          'task-1',
          expect.objectContaining({ title: '更新後タスク' })
        );
      });
      // Assert: 更新成功トースト
      expect(await screen.findByText('タスク更新成功')).toBeInTheDocument();
      expect(screen.getByText('タスクが正常に更新されました')).toBeInTheDocument();
      // Assert: モーダルを閉じる指示が親に伝わる
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('キャンセルボタンクリックで更新せずダイアログを閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      const task = buildMockTask({ id: 'task-1', title: '既存タスク' });
      const { onOpenChange } = renderDialog(task);
      await screen.findByDisplayValue('既存タスク');

      // Act
      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      // Assert
      expect(mockUpdateTask).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('タイトルを空にして更新すると必須バリデーションエラーが表示され、更新APIが呼ばれない', async () => {
      // Arrange
      const user = userEvent.setup();
      const task = buildMockTask({ id: 'task-1', title: '既存タスク' });
      renderDialog(task);
      const titleInput = await screen.findByDisplayValue('既存タスク');

      // Act
      await user.clear(titleInput);
      await user.click(screen.getByRole('button', { name: '更新' }));

      // Assert
      expect(await screen.findByText('タイトルは必須です。')).toBeInTheDocument();
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });

    it('更新に失敗した場合エラートーストが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateTask.mockRejectedValue(new Error('API error'));
      const task = buildMockTask({ id: 'task-1', title: '既存タスク' });
      renderDialog(task);
      await screen.findByDisplayValue('既存タスク');

      // Act
      await user.click(screen.getByRole('button', { name: '更新' }));

      // Assert
      expect(await screen.findByText('タスク更新失敗')).toBeInTheDocument();
      expect(screen.getByText('タスクの更新に失敗しました')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('モーダルが開いた状態でアクセシビリティ違反がない', async () => {
      // Arrange: DialogContentはPortalでdocument.body直下に描画されるため、containerではなくdocument.bodyを検査する
      const task = buildMockTask({ id: 'task-1', title: '既存タスク' });
      renderWithProviders(<EditTaskDialog task={task} onOpenChange={jest.fn()} />);
      await screen.findByDisplayValue('既存タスク');

      // Act
      const results = await axe(document.body);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
