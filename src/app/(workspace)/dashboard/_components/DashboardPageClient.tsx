'use client';

import { useCallback } from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentEmails } from './RecentEmails';
import { UpcomingTasks } from './UpcomingTasks';
import { useTaskSummaryQuery, useTasksQuery } from '../../tasks/_hooks/useTasks';
import { SortKey, SortOrder, Task } from '../../tasks/types';
import { TASK_STATUS } from '@/lib/constants/tasks';
import { t } from '@/lib/locales/i18n';

const DASHBOARD_TASK_LIMIT = 20;
const DASHBOARD_TASK_PAGE = 1;
const DASHBOARD_TASK_SORT_KEY: SortKey = 'priority';
const DASHBOARD_TASK_SORT_ORDER: SortOrder = 'desc';

export function DashboardPageClient() {
  // --- データ取得 (Queries) ---
  const { tasks, isLoading: tasksLoading } = useTasksQuery({
    page: DASHBOARD_TASK_PAGE,
    limit: DASHBOARD_TASK_LIMIT,
    sortKey: DASHBOARD_TASK_SORT_KEY,
    sortOrder: DASHBOARD_TASK_SORT_ORDER,
    statuses: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS],
  });
  // タスク集計取得
  const { summary, isLoading: summaryLoading } = useTaskSummaryQuery();
  const handleCalendarClick = useCallback((task: Task) => {
    if (!task.calendarLink) return;
    window.open(task.calendarLink, '_blank', 'noopener,noreferrer');
  }, []);

  if (summaryLoading || tasksLoading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <p className='text-muted-foreground'>{t.ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8'>
      <DashboardStats summary={summary} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start'>
        <RecentEmails />
        <UpcomingTasks tasks={tasks} onCalendarClick={handleCalendarClick} />
      </div>
    </div>
  );
}
