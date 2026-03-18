import {
  Input,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/atoms';
import { t } from '@/lib/locales/i18n';
import { TaskFilterValues, TaskFilterHandlers } from '../types';
import { ResponsiveFilter } from '@/components/molecules/ResponsiveFilter';
import { FilterItem } from '@/components/molecules/FilterItem';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants/tasks';
import { TOTAL_TASK_STATUS_COUNT, TOTAL_TASK_PRIORITY_COUNT } from '@/lib/domains/tasks';
import { ChevronDown } from 'lucide-react';

interface TaskFilterProps {
  filters: TaskFilterValues;
  filterHandlers: TaskFilterHandlers;
  isSearching: boolean;
}

export function TaskFilter({ filters, filterHandlers, isSearching }: TaskFilterProps) {
  // カスタムフックを使用 (IME対応も自動的にされる)
  const handleEnter = useEnterSubmit(filterHandlers.onSearchClick, isSearching);

  // 優先度の複数選択ハンドラ
  const handlePriorityToggle = (priority: number) => {
    const currentPriorities = filters.priorities;
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    filterHandlers.onFilterChange('priorities', newPriorities);
  };

  // ステータスの複数選択ハンドラ
  const handleStatusToggle = (status: number) => {
    const currentStatuses = filters.statuses;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    filterHandlers.onFilterChange('statuses', newStatuses);
  };

  // 優先度の表示ラベル
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case TASK_PRIORITY.URGENT:
        return t.task.labels.priority.urgent;
      case TASK_PRIORITY.HIGH:
        return t.task.labels.priority.high;
      case TASK_PRIORITY.MEDIUM:
        return t.task.labels.priority.medium;
      case TASK_PRIORITY.LOW:
        return t.task.labels.priority.low;
      default:
        return t.task.labels.priority.unknown;
    }
  };

  // ステータスの表示ラベル
  const getStatusLabel = (status: number) => {
    switch (status) {
      case TASK_STATUS.TODO:
        return t.task.labels.status.todo;
      case TASK_STATUS.IN_PROGRESS:
        return t.task.labels.status.in_progress;
      case TASK_STATUS.DONE:
        return t.task.labels.status.done;
      default:
        return t.task.labels.status.unknown;
    }
  };

  // 優先度ドロップダウンの表示テキスト
  const priorityDisplayText =
    filters.priorities.length === 0
      ? t.ui.placeholder.select
      : filters.priorities.length === TOTAL_TASK_PRIORITY_COUNT
        ? t.ui.placeholder.all
        : filters.priorities.map(getPriorityLabel).join(', ');

  // ステータスドロップダウンの表示テキスト
  const statusDisplayText =
    filters.statuses.length === 0
      ? t.ui.placeholder.select
      : filters.statuses.length === TOTAL_TASK_STATUS_COUNT
        ? t.ui.placeholder.all
        : filters.statuses.map(getStatusLabel).join(', ');

  // フィルター入力欄を生成するヘルパー関数
  const FilterInputs = {
    title: () => (
      <FilterItem label={t.task.fields.title}>
        <Input
          type='text'
          value={filters.title}
          onChange={(e) => filterHandlers.onFilterChange('title', e.target.value)}
          onKeyDown={handleEnter}
          placeholder={t.task.fields.title}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
    dateFrom: () => (
      <FilterItem label={t.task.fields.date_from}>
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
      <FilterItem label={t.task.fields.date_to}>
        <Input
          type='date'
          value={filters.dateTo || ''}
          onChange={(e) => filterHandlers.onFilterChange('dateTo', e.target.value || null)}
          onKeyDown={handleEnter}
          className='w-full text-xs'
        />
      </FilterItem>
    ),
    priority: () => (
      <FilterItem label={t.task.fields.priority}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='w-full justify-between text-xs h-9 font-normal'>
              <span className='truncate'>{priorityDisplayText}</span>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-[200px]' align='start'>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.length === TOTAL_TASK_PRIORITY_COUNT}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(checked) => {
                if (checked) {
                  filterHandlers.onFilterChange('priorities', [
                    TASK_PRIORITY.URGENT,
                    TASK_PRIORITY.HIGH,
                    TASK_PRIORITY.MEDIUM,
                    TASK_PRIORITY.LOW,
                  ]);
                } else {
                  filterHandlers.onFilterChange('priorities', []);
                }
              }}
            >
              {t.ui.placeholder.all}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes(TASK_PRIORITY.URGENT)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handlePriorityToggle(TASK_PRIORITY.URGENT)}
            >
              {t.task.labels.priority.urgent}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes(TASK_PRIORITY.HIGH)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handlePriorityToggle(TASK_PRIORITY.HIGH)}
            >
              {t.task.labels.priority.high}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes(TASK_PRIORITY.MEDIUM)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handlePriorityToggle(TASK_PRIORITY.MEDIUM)}
            >
              {t.task.labels.priority.medium}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes(TASK_PRIORITY.LOW)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handlePriorityToggle(TASK_PRIORITY.LOW)}
            >
              {t.task.labels.priority.low}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </FilterItem>
    ),
    status: () => (
      <FilterItem label={t.task.fields.status}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='w-full justify-between text-xs h-9 font-normal'>
              <span className='truncate'>{statusDisplayText}</span>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-[200px]' align='start'>
            <DropdownMenuCheckboxItem
              checked={filters.statuses.length === TOTAL_TASK_STATUS_COUNT}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(checked) => {
                if (checked) {
                  filterHandlers.onFilterChange('statuses', [
                    TASK_STATUS.TODO,
                    TASK_STATUS.IN_PROGRESS,
                    TASK_STATUS.DONE,
                  ]);
                } else {
                  filterHandlers.onFilterChange('statuses', []);
                }
              }}
            >
              {t.ui.placeholder.all}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.statuses.includes(TASK_STATUS.TODO)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handleStatusToggle(TASK_STATUS.TODO)}
            >
              {t.task.labels.status.todo}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.statuses.includes(TASK_STATUS.IN_PROGRESS)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handleStatusToggle(TASK_STATUS.IN_PROGRESS)}
            >
              {t.task.labels.status.in_progress}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.statuses.includes(TASK_STATUS.DONE)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handleStatusToggle(TASK_STATUS.DONE)}
            >
              {t.task.labels.status.done}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </FilterItem>
    ),
  };

  // モバイル用の入力項目レイアウト
  const mobileInputs = (
    <>
      {/* タイトルキーワード */}
      {FilterInputs.title()}
      {/* 日付範囲（2列） */}
      <div className='grid grid-cols-2 gap-3'>
        {FilterInputs.dateFrom()}
        {FilterInputs.dateTo()}
      </div>
      {/* 優先度 */}
      {FilterInputs.priority()}
      {/* ステータス */}
      {FilterInputs.status()}
    </>
  );

  // デスクトップ用の入力項目レイアウト
  const desktopInputs = (
    <div className='grid grid-cols-5 gap-4'>
      {/* タイトルキーワード */}
      {FilterInputs.title()}
      {/* 開始日 */}
      {FilterInputs.dateFrom()}
      {/* 終了日 */}
      {FilterInputs.dateTo()}
      {/* 優先度 */}
      {FilterInputs.priority()}
      {/* ステータス */}
      {FilterInputs.status()}
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
