import Link from 'next/link';
import { Button } from '@/components/atoms';
import { ROUTES } from '@/lib/constants/routes';
import { t } from '@/lib/locales/i18n';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h2 className='text-4xl font-bold mb-4'>{t.ui.not_found.title}</h2>
      <p className='text-gray-600 mb-8'>{t.ui.not_found.message}</p>
      <Button asChild>
        <Link href={ROUTES.DASHBOARD}>{t.ui.not_found.dashboard_button}</Link>
      </Button>
    </div>
  );
}
