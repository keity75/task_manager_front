import { Input } from '@/components/atoms';
import { t } from '@/lib/locales/i18n';
import { EmailFilterValues, EmailFilterHandlers } from '../types';
import { ResponsiveFilter } from '@/components/molecules/ResponsiveFilter';
import { FilterItem } from '@/components/molecules/FilterItem';
import { useEnterSubmit } from '@/hooks/use-enter-submit';

interface EmailFilterProps {
  filters: EmailFilterValues;
  filterHandlers: EmailFilterHandlers;
  isSearching: boolean;
}

export function EmailFilter({ filters, filterHandlers, isSearching }: EmailFilterProps) {
  // カスタムフックを使用 (IME対応も自動的にされる)
  const handleEnter = useEnterSubmit(filterHandlers.onSearchClick, isSearching);

  // フィルター入力欄を生成するヘルパー関数
  const FilterInputs = {
    subject: () => (
      <FilterItem label={t.email.fields.subject}>
        <Input
          type='text'
          value={filters.subject}
          onChange={(e) => filterHandlers.onFilterChange('subject', e.target.value)}
          onKeyDown={handleEnter}
          placeholder={t.email.fields.subject}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
    from: () => (
      <FilterItem label={t.email.fields.from}>
        <Input
          type='text'
          value={filters.from}
          onChange={(e) => filterHandlers.onFilterChange('from', e.target.value)}
          onKeyDown={handleEnter}
          placeholder={t.email.fields.from}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
    dateFrom: () => (
      <FilterItem label={t.email.fields.date_from}>
        <Input
          type='date'
          value={filters.dateFrom || ''}
          onChange={(e) => filterHandlers.onFilterChange('dateFrom', e.target.value || null)}
          onKeyDown={handleEnter}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
    dateTo: () => (
      <FilterItem label={t.email.fields.date_to}>
        <Input
          type='date'
          value={filters.dateTo || ''}
          onChange={(e) => filterHandlers.onFilterChange('dateTo', e.target.value || null)}
          onKeyDown={handleEnter}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
  };

  // モバイル用の入力項目レイアウト
  const mobileInputs = (
    <>
      {FilterInputs.subject()}
      {FilterInputs.from()}
      <div className='grid grid-cols-2 gap-3'>
        {FilterInputs.dateFrom()}
        {FilterInputs.dateTo()}
      </div>
    </>
  );

  // デスクトップ用の入力項目レイアウト
  const desktopInputs = (
    <div className='grid grid-cols-4 gap-4'>
      {FilterInputs.subject()}
      {FilterInputs.from()}
      {FilterInputs.dateFrom()}
      {FilterInputs.dateTo()}
    </div>
  );

  return (
    <ResponsiveFilter
      mobileInputs={mobileInputs}
      desktopInputs={desktopInputs}
      onSearch={filterHandlers.onSearchClick}
      onClear={filterHandlers.onClearClick}
      isSearching={isSearching}
    />
  );
}
