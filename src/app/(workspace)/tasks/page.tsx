import { Metadata } from 'next';
import { TasksPageClient } from './_components/TasksPageClient';
import { t } from '@/lib/locales/i18n';

export const metadata: Metadata = {
  title: `${t.metadata.pages.tasks.title} | ${t.metadata.app.name}`,
  description: t.metadata.pages.tasks.description,
};

export default function TasksPage() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>{t.task.ui.page_title}</h1>
      </div>
      <TasksPageClient />
    </div>
  );
}
