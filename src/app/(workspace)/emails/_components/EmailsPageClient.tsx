'use client';

import { useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useEmailsQuery } from '../_hooks/useEmails';
import { Email, EmailFilterValues, EmailFilterHandlers, EmailPaginationProps } from '../types';
import { EmailList } from './EmailList';

const EMAILS_FETCH_LIMIT = 10;

// フォームの初期値
const initialFilterState: EmailFilterValues = {
  subject: '',
  from: '',
  dateFrom: null,
  dateTo: null,
};

export function EmailsPageClient() {
  // API検索実行用のstate（useEmailsQueryに渡す）
  const [apiFilters, setApiFilters] = useState<EmailFilterValues>(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // react-hook-form のセットアップ
  const { handleSubmit, reset, watch, setValue } = useForm<EmailFilterValues>({
    defaultValues: initialFilterState,
  });

  // フォームの現在値を監視
  const watchedFilters = watch();

  // データ取得（サーバーサイドフィルタリング）
  const { emails, totalCount, isLoading, isFetching, isError, refetch } = useEmailsQuery({
    page: currentPage,
    limit: EMAILS_FETCH_LIMIT,
    subject: apiFilters.subject,
    from: apiFilters.from,
    dateFrom: apiFilters.dateFrom,
    dateTo: apiFilters.dateTo,
  });

  // ページネーション計算（APIから返されたtotalCountを使用）
  const totalPages = Math.ceil(totalCount / EMAILS_FETCH_LIMIT);

  const handleFilterChange = useCallback(
    (field: keyof EmailFilterValues, value: string | null) => {
      setValue(field, value as EmailFilterValues[typeof field], { shouldValidate: false });
    },
    [setValue]
  );

  // 「検索」ボタンが押された時の処理
  const onSearchSubmit: SubmitHandler<EmailFilterValues> = (formData) => {
    setApiFilters(formData);
    setCurrentPage(1); // 検索時は1ページ目に戻す
  };

  // 「クリア」ボタンが押された時の処理
  const handleClearFiltersClick = useCallback(() => {
    setApiFilters(initialFilterState);
    reset(initialFilterState);
    setCurrentPage(1);
  }, [reset]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 「更新」ボタンが押された時の処理（現在の条件のままメール一覧を最新化する）
  const handleRefreshClick = useCallback(() => {
    refetch();
  }, [refetch]);

  // EmailList に渡すために props をグルーピングする
  const filterValues = watchedFilters;
  const filterHandlers: EmailFilterHandlers = {
    onFilterChange: handleFilterChange,
    onSearchClick: handleSubmit(onSearchSubmit),
    onClearClick: handleClearFiltersClick,
  };

  const paginationProps: EmailPaginationProps = {
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
  };

  return (
    <EmailList
      emails={emails}
      totalCount={totalCount}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      filters={filterValues}
      filterHandlers={filterHandlers}
      pagination={paginationProps}
      selectedEmail={selectedEmail}
      onSelectEmail={setSelectedEmail}
      onRefreshClick={handleRefreshClick}
    />
  );
}
