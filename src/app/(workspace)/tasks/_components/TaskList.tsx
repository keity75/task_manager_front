import { CheckSquare, Calendar } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from '@/components/atoms';
import {
  Task,
  TaskFilterValues,
  TaskFilterHandlers,
  TaskSortProps,
  TaskPaginationProps,
} from '../types';
import { formatUtcToJst } from '@/lib/domains/date';
import {
  getTaskStatusLabel,
  getTaskPriorityLabel,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '@/lib/domains/tasks';
import { t } from '@/lib/locales/i18n';
import { TaskFilter } from './TaskFilter';
import { SortHeader } from './SortHeader';
import { Pagination } from '@/components/molecules/Pagination';

interface TaskListProps {
  tasks: Task[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  onCalendarClick: (task: Task) => void;
  filters: TaskFilterValues;
  filterHandlers: TaskFilterHandlers;
  sort: TaskSortProps;
  pagination: TaskPaginationProps;
}

export function TaskList({
  tasks,
  totalCount,
  isLoading,
  isError,
  onCalendarClick,
  filters,
  filterHandlers,
  sort,
  pagination,
}: TaskListProps) {
  const isSearching = isLoading;

  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      {/* ヘッダー */}
      <div className='border-b border-border px-4 sm:px-6 py-4'>
        <div className='flex items-center gap-2'>
          <CheckSquare className='h-5 w-5 text-muted-foreground' />
          <span className='font-semibold text-foreground text-sm sm:text-base'>
            {t.task.ui.list_title} ({totalCount})
          </span>
        </div>
      </div>

      {/* フィルターセクション */}
      <TaskFilter filters={filters} filterHandlers={filterHandlers} isSearching={isSearching} />

      {/* タスク一覧 */}
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='w-[40%] min-w-[200px]'>
                <SortHeader
                  label={t.task.fields.title}
                  sortKey='title'
                  currentSortKey={sort.sortKey}
                  sortOrder={sort.sortOrder}
                  onSort={sort.onSortChange}
                />
              </TableHead>
              <TableHead className='w-[20%] min-w-[120px]'>
                <SortHeader
                  label={t.task.fields.dueAt_label}
                  sortKey='dueAt'
                  currentSortKey={sort.sortKey}
                  sortOrder={sort.sortOrder}
                  onSort={sort.onSortChange}
                />
              </TableHead>
              <TableHead className='w-[15%] min-w-[100px] text-center'>
                <SortHeader
                  label={t.task.fields.priority}
                  sortKey='priority'
                  currentSortKey={sort.sortKey}
                  sortOrder={sort.sortOrder}
                  onSort={sort.onSortChange}
                />
              </TableHead>
              <TableHead className='w-[15%] min-w-[100px] text-center'>
                <SortHeader
                  label={t.task.fields.status}
                  sortKey='status'
                  currentSortKey={sort.sortKey}
                  sortOrder={sort.sortOrder}
                  onSort={sort.onSortChange}
                />
              </TableHead>
              <TableHead className='w-[10%] min-w-[80px] text-center'>
                <span className='font-semibold text-foreground text-xs sm:text-sm'>
                  {t.ui.action}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  <p className='text-muted-foreground'>{t.ui.loading}</p>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  <p className='text-destructive'>{t.ui.error_loading(t.task.name)}</p>
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  <p className='text-muted-foreground text-sm'>{t.ui.no_items(t.task.name)}</p>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <p
                      className='font-medium text-foreground text-xs sm:text-sm max-w-[150px] sm:max-w-[250px] truncate'
                      title={task.title}
                    >
                      {task.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      {task.dueAt ? formatUtcToJst(task.dueAt, 'yyyy/MM/dd') : t.ui.not_set}
                    </p>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      className={`pointer-events-none ${getPriorityBadgeClass(task.priority)}`}
                      variant='outline'
                    >
                      {getTaskPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      className={`pointer-events-none ${getStatusBadgeClass(task.status)}`}
                      variant='outline'
                    >
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      {task.calendarLink ? (
                        <Button
                          onClick={() => onCalendarClick(task)}
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          aria-label='カレンダーを表示'
                        >
                          <Calendar className='h-4 w-4' />
                        </Button>
                      ) : (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground'
                          disabled
                          aria-label='カレンダーを表示'
                        >
                          <Calendar className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
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
    </div>
  );
}
