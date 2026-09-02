import { Mail, RefreshCw } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/atoms';
import { Email, EmailFilterValues, EmailFilterHandlers, EmailPaginationProps } from '../types';
import { formatUtcToJst } from '@/lib/domains/date';
import { t } from '@/lib/locales/i18n';
import { cn } from '@/lib/utils';
import { EmailFilter } from './EmailFilter';
import { EmailDetailModal } from './EmailDetailModal';
import { Pagination } from '@/components/molecules/Pagination';

interface EmailListProps {
  emails: Email[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  filters: EmailFilterValues;
  filterHandlers: EmailFilterHandlers;
  pagination: EmailPaginationProps;
  selectedEmailId: string | null;
  onSelectEmail: (id: string | null) => void;
  onRefreshClick: () => void;
}

export function EmailList({
  emails,
  totalCount,
  isLoading,
  isFetching,
  isError,
  filters,
  filterHandlers,
  pagination,
  selectedEmailId,
  onSelectEmail,
  onRefreshClick,
}: EmailListProps) {
  const isSearching = isLoading;

  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      {/* ヘッダー */}
      <div className='border-b border-border px-4 sm:px-6 py-4'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Mail className='h-5 w-5 text-muted-foreground' />
            <span className='font-semibold text-foreground text-sm sm:text-base'>
              {t.email.ui.list_title} ({totalCount})
            </span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={onRefreshClick}
            disabled={isFetching}
            className='gap-2'
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            {isFetching ? t.ui.button.refreshing : t.ui.button.refresh}
          </Button>
        </div>
      </div>

      {/* フィルターセクション */}
      <EmailFilter filters={filters} filterHandlers={filterHandlers} isSearching={isSearching} />

      {/* メール一覧 */}
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='w-[45%] min-w-[200px]'>
                <span className='font-semibold text-foreground text-xs sm:text-sm'>
                  {t.email.fields.subject}
                </span>
              </TableHead>
              <TableHead className='w-[30%] min-w-[160px]'>
                <span className='font-semibold text-foreground text-xs sm:text-sm'>
                  {t.email.fields.from}
                </span>
              </TableHead>
              <TableHead className='w-[25%] min-w-[140px]'>
                <span className='font-semibold text-foreground text-xs sm:text-sm'>
                  {t.email.fields.received_at}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className='h-24 text-center'>
                  <p className='text-muted-foreground'>{t.ui.loading}</p>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} className='h-24 text-center'>
                  <p className='text-destructive'>{t.ui.error_loading(t.email.name)}</p>
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className='h-24 text-center'>
                  <p className='text-muted-foreground text-sm'>{t.ui.no_items(t.email.name)}</p>
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow
                  key={email.id}
                  onClick={() => onSelectEmail(email.id)}
                  className='cursor-pointer'
                >
                  <TableCell>
                    <p
                      className='font-medium text-foreground text-xs sm:text-sm max-w-[200px] sm:max-w-[320px] truncate'
                      title={email.subject}
                    >
                      {email.subject}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p
                      className='text-xs sm:text-sm text-muted-foreground truncate max-w-[180px]'
                      title={email.from}
                    >
                      {email.from}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      {formatUtcToJst(email.receivedAt, 'yyyy/MM/dd HH:mm')}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      {!isLoading && !isError && pagination.totalPages > 0 && (
        <div className='border-t border-border px-4 sm:px-6 py-4'>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}

      <EmailDetailModal
        emailId={selectedEmailId}
        onOpenChange={(open) => !open && onSelectEmail(null)}
      />
    </div>
  );
}
