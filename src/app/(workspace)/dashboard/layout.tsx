import { Metadata } from 'next';
import { t } from '@/lib/locales/i18n';

export const metadata: Metadata = {
  title: `${t.metadata.pages.dashboard.title} | ${t.metadata.app.name}`,
  description: t.metadata.pages.dashboard.description,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
