'use client';

import { usePathname } from 'next/navigation';
import { Header, type HeaderProps } from '@/components/organisms';
import { NAV_ITEMS } from '@/lib/constants/navigation';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentNavItem = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const currentPage: HeaderProps['currentPage'] = currentNavItem?.id;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Header currentPage={currentPage} />
      <main className='flex-1 overflow-y-auto p-6'>{children}</main>
    </div>
  );
}
