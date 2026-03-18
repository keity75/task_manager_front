import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Pagination } from '@/components/molecules/Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  // ─── Props 適用 ──────────────────────────────────────
  describe('基本レンダリング', () => {
    it('現在ページ番号が正しく表示される', () => {
      render(<Pagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);
      // アクティブページは aria-current="page" で識別する
      expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page');
    });
  });

  // ─── ユーザーインタラクション ──────────────────────────
  describe('ページ遷移', () => {
    it('ページ番号クリックでonPageChangeが正しい引数で呼ばれる', async () => {
      const user = userEvent.setup();
      // currentPage=1, totalPages=10, siblingCount=1 → [1, 2, 3, 4, 5, '...', 10]
      render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);
      await user.click(screen.getByText('5'));
      expect(mockOnPageChange).toHaveBeenCalledWith(5);
    });

    it('「前へ」ボタンクリックでcurrentPage - 1が渡される', async () => {
      const user = userEvent.setup();
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      await user.click(screen.getByLabelText('Go to previous page'));
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('「次へ」ボタンクリックでcurrentPage + 1が渡される', async () => {
      const user = userEvent.setup();
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      await user.click(screen.getByLabelText('Go to next page'));
      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });
  });

  // ─── 境界条件 ────────────────────────────────────────
  // currentPage が上下限の場合の JS ガード動作を検証する
  describe('境界条件', () => {
    it('currentPage=1で「前へ」クリック時にonPageChangeが呼ばれない', async () => {
      const user = userEvent.setup();
      render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);
      // pointer-events-none は CSS のみ。jsdom では onClick ガード（if currentPage > 1）で呼び出しを阻止する
      await user.click(screen.getByLabelText('Go to previous page'));
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('currentPage=totalPagesで「次へ」クリック時にonPageChangeが呼ばれない', async () => {
      const user = userEvent.setup();
      render(<Pagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);
      await user.click(screen.getByLabelText('Go to next page'));
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  // ─── ページネーションロジック ────────────────────────
  // generatePaginationItems による省略記号の表示・非表示を検証する
  // 境界値: totalPages=7（全ページ表示）/ totalPages=8（省略記号出現）
  describe('ページネーションロジック', () => {
    it('totalPages > 7で省略記号が表示される', () => {
      render(<Pagination currentPage={5} totalPages={8} onPageChange={mockOnPageChange} />);
      // PaginationEllipsis は SVGアイコン + sr-only "More pages" で構成される
      const ellipses = screen.getAllByText('More pages');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('totalPages <= 7で全ページ番号が表示される', () => {
      render(<Pagination currentPage={3} totalPages={7} onPageChange={mockOnPageChange} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      // 省略記号が表示されていないことを確認
      expect(screen.queryByText('More pages')).not.toBeInTheDocument();
    });
  });

  // ─── 異常系 ────────────────────────────────────────
  describe('異常系', () => {
    it('totalPages=0で何もレンダリングされない', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  // aria 属性の設定と axe による違反チェックを検証する
  describe('アクセシビリティ', () => {
    it('aria-disabled属性が適切に設定される', () => {
      render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByLabelText('Go to previous page');
      expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('アクセシビリティ違反がない', async () => {
      const { container } = render(
        <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
