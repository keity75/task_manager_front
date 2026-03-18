import { CheckCircle2, Clock, ListTodo, PlayCircle } from 'lucide-react';
import { t } from '@/lib/locales/i18n';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className='rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs sm:text-sm text-muted-foreground'>{title}</p>
          <p className='text-2xl sm:text-3xl font-bold text-foreground mt-2'>{value}</p>
        </div>
        <div className='text-muted-foreground text-lg sm:text-xl'>{icon}</div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  summary?: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  if (!summary) return null;

  return (
    <div className='mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      <SummaryCard
        title={t.dashboard.stats.total_tasks}
        value={summary.total}
        icon={<ListTodo className='h-5 w-5' />}
      />
      <SummaryCard
        title={t.dashboard.stats.todo_tasks}
        value={summary.todo}
        icon={<Clock className='h-5 w-5' />}
      />
      <SummaryCard
        title={t.dashboard.stats.in_progress_tasks}
        value={summary.inProgress}
        icon={<PlayCircle className='h-5 w-5' />}
      />
      <SummaryCard
        title={t.dashboard.stats.completed_tasks}
        value={summary.done}
        icon={<CheckCircle2 className='h-5 w-5' />}
      />
    </div>
  );
}
