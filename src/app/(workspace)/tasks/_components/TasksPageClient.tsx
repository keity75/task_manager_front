'use client';

import { useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTasksQuery } from '../_hooks/useTasks';
import {
  Task,
  TaskFilterValues,
  TaskFilterHandlers,
  TaskSortProps,
  TaskPaginationProps,
  SortKey,
  SortOrder,
} from '../types';
import { TaskList } from './TaskList';
import { TASK_STATUS } from '@/lib/constants/tasks';

const TASKS_FETCH_LIMIT = 20;

// フォームの初期値（初期表示：TODOとIN_PROGRESSのみ、優先度降順）
const initialFilterState: TaskFilterValues = {
  title: '',
  dateFrom: null,
  dateTo: null,
  priorities: [],
  statuses: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS],
};

// 初期ソート設定（優先度降順）
const initialSortKey: SortKey = 'priority';
const initialSortOrder: SortOrder = 'desc';

export function TasksPageClient() {
  // API検索実行用のstate（useTasksQueryに渡す）
  const [apiFilters, setApiFilters] = useState<TaskFilterValues>(initialFilterState);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(1);

  // react-hook-form のセットアップ
  const { handleSubmit, reset, watch, setValue } = useForm<TaskFilterValues>({
    defaultValues: initialFilterState,
  });

  // フォームの現在値を監視
  const watchedFilters = watch();

  // データ取得（サーバーサイドフィルタリング）
  const { tasks, totalCount, isLoading, isError } = useTasksQuery({
    page: currentPage,
    limit: TASKS_FETCH_LIMIT,
    sortKey,
    sortOrder,
    title: apiFilters.title,
    dateFrom: apiFilters.dateFrom,
    dateTo: apiFilters.dateTo,
    priorities: apiFilters.priorities,
    statuses: apiFilters.statuses,
  });

  // ページネーション計算（APIから返されたtotalCountを使用）
  const totalPages = Math.ceil(totalCount / TASKS_FETCH_LIMIT);

  const handleFilterChange = useCallback(
    (field: keyof TaskFilterValues, value: string | null | number[]) => {
      setValue(field, value as TaskFilterValues[typeof field], { shouldValidate: false });
    },
    [setValue]
  );

  // 「検索」ボタンが押された時の処理
  const onSearchSubmit: SubmitHandler<TaskFilterValues> = (formData) => {
    setApiFilters(formData);
    setCurrentPage(1); // 検索時は1ページ目に戻す
  };

  // 「クリア」ボタンが押された時の処理
  const handleClearFiltersClick = useCallback(() => {
    setApiFilters(initialFilterState);
    reset(initialFilterState);
    setCurrentPage(1);
  }, [reset]);

  const handleSortChange = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortOrder('asc');
      }
      setCurrentPage(1); // ソート変更時は1ページ目に戻す
    },
    [sortKey, sortOrder]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCalendarClick = useCallback((task: Task) => {
    if (!task.calendarLink) return;
    window.open(task.calendarLink, '_blank', 'noopener,noreferrer');
  }, []);

  // TaskList に渡すために props をグルーピングする
  const filterValues = watchedFilters;
  const filterHandlers: TaskFilterHandlers = {
    onFilterChange: handleFilterChange,
    onSearchClick: handleSubmit(onSearchSubmit),
    onClearClick: handleClearFiltersClick,
  };

  const sortProps: TaskSortProps = {
    sortKey,
    sortOrder,
    onSortChange: handleSortChange,
  };

  const paginationProps: TaskPaginationProps = {
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
  };

  return (
    <TaskList
      tasks={tasks}
      totalCount={totalCount}
      isLoading={isLoading}
      isError={isError}
      onCalendarClick={handleCalendarClick}
      filters={filterValues}
      filterHandlers={filterHandlers}
      sort={sortProps}
      pagination={paginationProps}
    />
  );
}
