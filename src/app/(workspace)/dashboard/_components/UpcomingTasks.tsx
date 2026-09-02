import { useState } from 'react';
import { CheckCircle2, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components/atoms';
import { CreateTaskDialog } from '../../tasks/_components/CreateTaskDialog';
import { EditTaskDialog } from '../../tasks/_components/EditTaskDialog';
import { DeleteTaskDialog } from '../../tasks/_components/DeleteTaskDialog';
import { Task } from '../../tasks/types';
import { formatUtcToJst } from '@/lib/domains/date';
import {
  getTaskPriorityLabel,
  getPriorityBadgeClass,
  getTaskStatusLabel,
  getStatusBadgeClass,
} from '@/lib/domains/tasks';
import { t } from '@/lib/locales/i18n';

interface UpcomingTasksProps {
  tasks: Task[];
  onCalendarClick: (task: Task) => void;
}

export function UpcomingTasks({ tasks, onCalendarClick }: UpcomingTasksProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      <div className='border-b border-border px-4 sm:px-6 py-4'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground'>
            <CheckCircle2 className='h-5 w-5' />
            {t.task.ui.page_title}
          </h2>
          <CreateTaskDialog />
        </div>
      </div>

      <div className='divide-y divide-border'>
        {tasks.length === 0 ? (
          <div className='px-4 sm:px-6 py-8 text-center text-muted-foreground text-sm'>
            {t.ui.no_items(t.task.name)}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className='w-full px-4 sm:px-6 py-3 sm:py-4 text-left'>
              <div className='flex items-start gap-3 w-full'>
                <span
                  className={`mt-0.5 whitespace-nowrap rounded px-1.5 py-1 text-xs font-medium flex-shrink-0 w-[42px] text-center ${getPriorityBadgeClass(task.priority)}`}
                >
                  {getTaskPriorityLabel(task.priority)}
                </span>
                <div className='flex-1 space-y-1.5 min-w-0'>
                  <p className='font-medium text-foreground text-sm sm:text-base break-words'>
                    {task.title}
                  </p>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t.task.fields.dueAt_label}:{' '}
                    {task.dueAt ? formatUtcToJst(task.dueAt, 'yyyy/MM/dd HH:mm') : t.ui.not_set}
                  </p>
                  <div className='flex items-center justify-between gap-4 flex-wrap pt-1'>
                    <Badge className={`pointer-events-none ${getStatusBadgeClass(task.status)}`}>
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                    <div className='flex items-center gap-1'>
                      {task.calendarLink ? (
                        <Button
                          onClick={() => onCalendarClick(task)}
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          aria-label='Googleカレンダーで開く'
                        >
                          <Calendar className='h-4 w-4' />
                        </Button>
                      ) : (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground'
                          disabled
                          aria-label='Googleカレンダーで開く'
                        >
                          <Calendar className='h-4 w-4' />
                        </Button>
                      )}
                      <Button
                        onClick={() => setEditingTask(task)}
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        aria-label='タスクを編集'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        onClick={() => setDeletingTask(task)}
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-destructive'
                        aria-label='タスクを削除'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditTaskDialog
        task={editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
      <DeleteTaskDialog
        task={deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      />
    </div>
  );
}
