'use client';

import { TriangleAlert } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/atoms';
import { t } from '@/lib/locales/i18n';
import { toast } from '@/hooks/use-toast';
import { useDeleteTaskMutation } from '../_hooks/useTasks';
import { Task } from '../types';

interface DeleteTaskDialogProps {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTaskDialog({ task, onOpenChange }: DeleteTaskDialogProps) {
  const { mutateAsync, isPending } = useDeleteTaskMutation();

  const handleDelete = async () => {
    if (!task) return;

    try {
      await mutateAsync(task.id);
      toast({
        title: t.task.ui.toast.delete_success_title,
        description: t.task.ui.toast.delete_success_description,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: t.task.ui.toast.delete_error_title,
        description: t.task.ui.toast.delete_error_description,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <TriangleAlert className='h-5 w-5 text-destructive' />
            {t.task.ui.delete_title}
          </DialogTitle>
          <DialogDescription>{t.task.ui.delete_confirm_message}</DialogDescription>
        </DialogHeader>

        <div className='space-y-2 text-sm'>
          {task && <p className='font-medium text-foreground'>「{task.title}」</p>}
          <p className='text-muted-foreground'>{t.task.ui.delete_warning}</p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              {t.ui.button.cancel}
            </Button>
          </DialogClose>
          <Button type='button' variant='destructive' disabled={isPending} onClick={handleDelete}>
            {isPending ? t.ui.button.deleting : t.ui.button.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
