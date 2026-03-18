'use client';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/lib/constants/routes';
import { t } from '@/lib/locales/i18n';
import Link from 'next/link';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      <h2 className='text-2xl font-semibold mb-4'>{t.ui.error.title}</h2>
      <p className='text-muted-foreground mb-6'>{error.message || t.ui.error.default_message}</p>
      <Button asChild>
        <Link href={ROUTES.DASHBOARD}>{t.ui.error.dashboard_button}</Link>
      </Button>
    </div>
  );
}
