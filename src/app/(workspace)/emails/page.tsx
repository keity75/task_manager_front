import { Metadata } from 'next';
import { EmailsPageClient } from './_components/EmailsPageClient';
import { t } from '@/lib/locales/i18n';

export const metadata: Metadata = {
  title: `${t.metadata.pages.emails.title} | ${t.metadata.app.name}`,
  description: t.metadata.pages.emails.description,
};

export default function EmailsPage() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
          {t.email.ui.page_title}
        </h1>
      </div>
      <EmailsPageClient />
    </div>
  );
}
