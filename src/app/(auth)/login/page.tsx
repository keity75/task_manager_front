import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './_components/LoginForm';
import { t } from '@/lib/locales/i18n';

export const metadata: Metadata = {
  title: `${t.metadata.pages.auth.login.title} | ${t.metadata.app.name}`,
  description: t.metadata.pages.auth.login.description,
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>{t.ui.loading}</div>}>
      <LoginForm />
    </Suspense>
  );
}
