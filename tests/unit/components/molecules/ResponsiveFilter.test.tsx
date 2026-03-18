import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ResponsiveFilter } from '@/components/molecules/ResponsiveFilter';

describe('ResponsiveFilter', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();
  const mobileInputs = <div>Mobile inputs</div>;
  const desktopInputs = <div>Desktop inputs</div>;

  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnClear.mockClear();
  });

  // ─── Props 適用 ──────────────────────────────────────
  // 外部から渡された props が正しくコンポーネントに反映されるか検証する
  describe('Props 適用', () => {
    it('title指定時に表示される', () => {
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
          title='Custom Filter'
        />
      );
      expect(screen.getByText('Custom Filter')).toBeInTheDocument();
    });

    it('title未指定時にデフォルト（t.ui.filter）が表示される', () => {
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      expect(screen.getByText('フィルター')).toBeInTheDocument();
    });

    it('isSearching=true時に検索ボタンがdisabledになる', () => {
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={true}
        />
      );
      // 初期状態では検索ボタンはデスクトップセクションのみ存在
      expect(screen.getByRole('button', { name: /検索/ })).toBeDisabled();
    });
  });

  // ─── 内部状態・条件レンダリング ────────────────────────
  // isExpanded の状態に基づく折りたたみ動作と、それに連動する mobileInputs の表示・非表示を検証する
  describe('折りたたみ動作', () => {
    it('初期状態で折りたたまれている', () => {
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      // isExpanded=false → mobileInputs は条件レンダリングで DOM に存在しない
      expect(screen.queryByText('Mobile inputs')).not.toBeInTheDocument();
    });

    it('ボタンクリックで展開され mobileInputs が表示される', async () => {
      const user = userEvent.setup();
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      await user.click(screen.getByRole('button', { name: /フィルター/ }));
      // isExpanded=true → mobileInputs が条件レンダリングで表示される
      expect(screen.getByText('Mobile inputs')).toBeInTheDocument();
    });

    it('再度クリックで折りたたまれる', async () => {
      const user = userEvent.setup();
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      const button = screen.getByRole('button', { name: /フィルター/ });
      await user.click(button);
      await user.click(button);
      expect(screen.queryByText('Mobile inputs')).not.toBeInTheDocument();
    });
  });

  // ─── ユーザーインタラクション ──────────────────────────
  // ボタンクリックによるコールバック呼び出しを検証する
  describe('コールバック', () => {
    it('検索ボタンクリックでonSearchが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      // 初期状態（展開なし）では検索ボタンはデスクトップセクションのみ1つ存在
      await user.click(screen.getByRole('button', { name: /検索/ }));
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('クリアボタンクリックでonClearが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      await user.click(screen.getByRole('button', { name: /クリア/ }));
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('アクセシビリティ違反がない', async () => {
      const { container } = render(
        <ResponsiveFilter
          mobileInputs={mobileInputs}
          desktopInputs={desktopInputs}
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          isSearching={false}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
