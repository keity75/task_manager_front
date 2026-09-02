'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/atoms';
import { taskFormSchema, TaskFormInput } from '@/lib/schema/task.schema';
import { taskStatusOptions, taskPriorityOptions, mapTaskToFormInput } from '@/lib/domains/tasks';
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/constants/tasks';
import { t } from '@/lib/locales/i18n';
import { toast } from '@/hooks/use-toast';
import { useUpdateTaskMutation } from '../_hooks/useTasks';
import { Task } from '../types';

const emptyValues: TaskFormInput = {
  title: '',
  description: null,
  dueAt: null,
  priority: TASK_PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
};

interface EditTaskDialogProps {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, onOpenChange }: EditTaskDialogProps) {
  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyValues,
  });
  const { mutateAsync, isPending } = useUpdateTaskMutation();

  // taskが選択されたときのみフォームをプリフィルする
  // （閉じるアニメーション中にtaskがnullになっても表示中の値を維持するため、nullのときはresetしない）
  useEffect(() => {
    if (task) {
      form.reset(mapTaskToFormInput(task));
    }
  }, [task, form]);

  const onSubmit = async (data: TaskFormInput) => {
    if (!task) return;

    try {
      await mutateAsync({ id: task.id, input: data });
      toast({
        title: t.task.ui.toast.update_success_title,
        description: t.task.ui.toast.update_success_description,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: t.task.ui.toast.update_error_title,
        description: t.task.ui.toast.update_error_description,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t.task.ui.edit_title}</DialogTitle>
          <DialogDescription>{t.task.ui.edit_description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.task.fields.title}
                    <span className='text-destructive ml-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t.task.ui.placeholder.title} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.task.fields.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.task.ui.placeholder.description}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-4'>
              <FormField
                control={form.control}
                name='dueAt'
                render={({ field }) => (
                  <FormItem className='w-72'>
                    <FormLabel>{t.task.fields.dueAt_label}</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem className='w-24'>
                    <FormLabel>{t.task.fields.priority}</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskPriorityOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='w-40'>
                  <FormLabel>{t.task.fields.status}</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  {t.ui.button.cancel}
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isPending}>
                {isPending ? t.ui.button.updating : t.ui.button.update}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
