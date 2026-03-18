import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { SessionMonitor } from '@/lib/auth/components/SessionMonitor';
import { Toaster } from '@/components/ui/toaster';
import { t } from '@/lib/locales/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: t.metadata.app.name,
  description: t.metadata.app.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <body className={inter.className}>
        <SessionProvider>
          <SessionMonitor />
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
