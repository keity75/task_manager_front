/**
 * @file CreateTaskDialog.test.tsx
 * CreateTaskDialog コンポーネントの統合テスト
 *
 * タスク新規作成モーダル。actions（Server Action）をモックし、
 * 開閉・必須バリデーション・作成成功/失敗時のトースト表示を検証する。
 */

// ★ jest.mock は import より先に記述（Jest hoisting）
jest.mock('@/app/(workspace)/tasks/actions', () => ({
  createTask: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../../../utils/render';
import { CreateTaskDialog } from '@/app/(workspace)/tasks/_components/CreateTaskDialog';
import { createTask } from '@/app/(workspace)/tasks/actions';
import { Toaster } from '@/components/ui/toaster';

// モック型キャスト
const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;

// トースト表示を確認するため、Toaster を併せてレンダリングする
function renderDialog() {
  return renderWithProviders(
    <>
      <CreateTaskDialog />
      <Toaster />
    </>
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '+ タスク作成' }));
}

// ═══ CreateTaskDialog ══════════════════════════════════
describe('CreateTaskDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 正常系 ─────────────────────────────────────────
  describe('正常系', () => {
    it('トリガーボタンクリックでモーダルが開く', async () => {
      // Arrange
      const user = userEvent.setup();
      renderDialog();

      // Act
      await openDialog(user);

      // Assert
      expect(screen.getByRole('heading', { name: 'タスク作成' })).toBeInTheDocument();
    });

    it('タイトルを入力して保存すると、作成成功トーストが表示されモーダルが閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreateTask.mockResolvedValue({ id: 'task-1' });
      renderDialog();
      await openDialog(user);

      // Act
      await user.type(screen.getByPlaceholderText('タスクのタイトルを入力'), '新しいタスク');
      await user.click(screen.getByRole('button', { name: '保存' }));

      // Assert: 入力内容で作成APIが呼ばれる
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({ title: '新しいタスク' })
        );
      });
      // Assert: 成功トースト（タイトル・説明とも要件どおりの文言）
      expect(await screen.findByText('タスク作成成功')).toBeInTheDocument();
      expect(screen.getByText('タスクが正常に作成されました')).toBeInTheDocument();
      // Assert: モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'タスク作成' })).not.toBeInTheDocument();
      });
    });

    it('キャンセルボタンクリックでタスクを作成せずモーダルが閉じる', async () => {
      // Arrange
      const user = userEvent.setup();
      renderDialog();
      await openDialog(user);

      // Act
      await user.type(screen.getByPlaceholderText('タスクのタイトルを入力'), '破棄されるタスク');
      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      // Assert
      expect(mockCreateTask).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'タスク作成' })).not.toBeInTheDocument();
      });
    });
  });

  // ─── 異常系 ─────────────────────────────────────────
  describe('異常系', () => {
    it('タイトル未入力で保存すると必須バリデーションエラーが表示され、作成APIが呼ばれない', async () => {
      // Arrange
      const user = userEvent.setup();
      renderDialog();
      await openDialog(user);

      // Act
      await user.click(screen.getByRole('button', { name: '保存' }));

      // Assert
      expect(await screen.findByText('タイトルは必須です。')).toBeInTheDocument();
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('タスク作成に失敗した場合エラートーストが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreateTask.mockRejectedValue(new Error('API error'));
      renderDialog();
      await openDialog(user);

      // Act
      await user.type(screen.getByPlaceholderText('タスクのタイトルを入力'), '失敗するタスク');
      await user.click(screen.getByRole('button', { name: '保存' }));

      // Assert
      expect(await screen.findByText('タスク作成失敗')).toBeInTheDocument();
      expect(screen.getByText('タスクの作成に失敗しました')).toBeInTheDocument();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('モーダルを開いた状態でアクセシビリティ違反がない', async () => {
      // Arrange: DialogContentはPortalでdocument.body直下に描画されるため、containerではなくdocument.bodyを検査する
      // （Toasterは他テストのトースト残留がノイズになるためこのテストではマウントしない）
      const user = userEvent.setup();
      renderWithProviders(<CreateTaskDialog />);
      await openDialog(user);

      // Act
      const results = await axe(document.body);

      // Assert
      expect(results).toHaveNoViolations();
    });
  });
});
