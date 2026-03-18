import { Button } from '@/components/atoms';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortKey, SortOrder } from '../types';

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
}

/**
 * ソート可能なテーブルヘッダーコンポーネント
 * クリック時にソートを切り替え、現在のソート状態を視覚的に表示する
 *
 * @param label - ヘッダーのラベルテキスト
 * @param sortKey - このヘッダーに対応するソートキー
 * @param currentSortKey - 現在アクティブなソートキー
 * @param sortOrder - 現在のソート順序（'asc' または 'desc'）
 * @param onSort - ソートキーがクリックされたときのコールバック
 */
export function SortHeader({ label, sortKey, currentSortKey, sortOrder, onSort }: SortHeaderProps) {
  const isActive = currentSortKey === sortKey;

  return (
    <Button
      variant='ghost'
      onClick={() => onSort(sortKey)}
      className='h-auto px-0 py-0 font-semibold'
    >
      <span className='text-xs sm:text-sm'>{label}</span>
      {isActive &&
        (sortOrder === 'asc' ? (
          <ArrowUp className='ml-1 h-4 w-4' aria-label='昇順' />
        ) : (
          <ArrowDown className='ml-1 h-4 w-4' aria-label='降順' />
        ))}
    </Button>
  );
}
