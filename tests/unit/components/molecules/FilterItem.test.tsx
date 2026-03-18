import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FilterItem } from '@/components/molecules/FilterItem';

describe('FilterItem', () => {
  // ─── Props 適用（レンダリング） ──────────────────────
  describe('基本レンダリング', () => {
    it('labelが正しく表示される', () => {
      render(
        <FilterItem label='Filter Label'>
          <input type='text' />
        </FilterItem>
      );
      expect(screen.getByText('Filter Label')).toBeInTheDocument();
    });

    it('childrenが正しくレンダリングされる', () => {
      render(
        <FilterItem label='Label'>
          <input type='text' placeholder='Input' />
        </FilterItem>
      );
      expect(screen.getByPlaceholderText('Input')).toBeInTheDocument();
    });
  });

  // ─── Props 適用（スタイリング） ──────────────────────
  describe('スタイリング', () => {
    it('classNameが適用される', () => {
      const { container } = render(
        <FilterItem label='Label' className='custom-class'>
          <div>Content</div>
        </FilterItem>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ─── アクセシビリティ ────────────────────────────────
  describe('アクセシビリティ', () => {
    it('labelがinputと正しく関連付けられている', () => {
      render(
        <FilterItem label='Label'>
          <input type='text' />
        </FilterItem>
      );
      expect(screen.getByLabelText('Label')).toBeInTheDocument();
    });

    it('アクセシビリティ違反がない', async () => {
      const { container } = render(
        <FilterItem label='Label'>
          <input type='text' />
        </FilterItem>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
