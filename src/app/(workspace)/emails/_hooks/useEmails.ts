/**
 * @file
 * [Feature Custom Hooks (Email)]
 * メール機能のデータ取得系カスタムフックを定義する。
 * Server Action 呼び出しと、UIで扱いやすい取得結果の整形を担う。
 */

import { useQuery } from '@tanstack/react-query';
import { getEmails } from '../actions';
import { GetEmailsResponse } from '../types';

/**
 * メール一覧を取得するカスタムフック
 */
export const useEmailsQuery = ({
  page,
  limit,
  subject,
  from,
  dateFrom,
  dateTo,
}: {
  page: number;
  limit: number;
  subject?: string | null;
  from?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}) => {
  // hooks内で正規化（空文字列 → undefined）
  const normalizedFilters = {
    subject: subject || undefined,
    from: from || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery<GetEmailsResponse>({
    queryKey: ['emails', { page, limit, ...normalizedFilters }],
    queryFn: () => getEmails({ page, limit, ...normalizedFilters }),
  });

  return {
    emails: data?.emails ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    isError: !!error,
    error,
    refetch,
  };
};
