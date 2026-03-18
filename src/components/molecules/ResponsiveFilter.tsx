'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/atoms';
import { t } from '@/lib/locales/i18n';

interface ResponsiveFilterProps {
  mobileInputs: React.ReactNode; // モバイル用にレイアウトされた入力項目群
  desktopInputs: React.ReactNode; // デスクトップ用にレイアウトされた入力項目群
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
  title?: string; // デフォルトは t.ui.filter ('フィルター')
}

export function ResponsiveFilter({
  mobileInputs,
  desktopInputs,
  onSearch,
  onClear,
  isSearching,
  title,
}: ResponsiveFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='border-b border-border px-4 sm:px-6 py-4 bg-muted/30'>
      {/* モバイル: 折りたたみ可能 */}
      <div className='lg:hidden'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='w-full justify-between'
        >
          <span className='text-sm font-medium'>{title ?? t.ui.filter}</span>
          {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </Button>
        {isExpanded && (
          <div className='mt-4 space-y-3'>
            {mobileInputs}
            {/* アクションボタン */}
            <div className='flex gap-2 pt-1'>
              <Button
                variant='default'
                size='sm'
                onClick={onSearch}
                disabled={isSearching}
                className='flex-1'
              >
                {t.ui.button.search}
              </Button>
              <Button variant='outline' size='sm' onClick={onClear} className='flex-1'>
                {t.ui.button.clear}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* デスクトップ: 常時表示 */}
      <div className='hidden lg:block space-y-4'>
        {/* 1行目: フィルター入力欄 */}
        {desktopInputs}
        {/* 2行目: アクションボタン（右揃え） */}
        <div className='flex justify-end gap-2'>
          <Button variant='default' size='sm' onClick={onSearch} disabled={isSearching}>
            {t.ui.button.search}
          </Button>
          <Button variant='outline' size='sm' onClick={onClear}>
            {t.ui.button.clear}
          </Button>
        </div>
      </div>
    </div>
  );
}
