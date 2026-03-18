'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Avatar, AvatarFallback } from '@/components/atoms/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, type NavId, NAV_IDS } from '@/lib/constants/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { t } from '@/lib/locales/i18n';

export interface HeaderProps {
  currentPage?: NavId;
}

export function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const userName = status === 'loading' ? '' : (session?.user?.name ?? t.header.user_fallback);
  const avatarFallback = userName ? userName[0].toUpperCase() : t.header.user_fallback_avatar;

  /**
   * モバイルメニューの開閉を切り替える
   */
  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  /**
   * モバイルメニューを閉じる
   */
  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  /**
   * ログアウト処理
   * NextAuth.jsのセッションを破棄し、ログインページにリダイレクト
   */
  const handleLogout = useCallback(async () => {
    try {
      // NextAuth.jsのセッションを破棄し、ログインページにリダイレクト
      await signOut({
        callbackUrl: ROUTES.LOGIN,
        redirect: true,
      });
    } catch (error) {
      // signOutが失敗した場合（通常は発生しない）
      console.error('Logout error:', error);
      // エラーが発生した場合でもログインページにリダイレクト（Next.jsのrouterを使用）
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-card'>
      <div className='flex h-16 items-center justify-between px-6 py-0'>
        <div className='flex items-center gap-2'>
          <Link
            href={NAV_ITEMS.find((item) => item.id === NAV_IDS.DASHBOARD)?.href || ROUTES.DASHBOARD}
            className='flex items-center gap-2'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-semibold'>
              TM
            </div>
            <span className='hidden font-semibold text-foreground sm:inline'>{t.ui.app_name}</span>
          </Link>
        </div>

        <nav className='hidden items-center gap-1 md:flex'>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                currentPage === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='gap-2 px-2 sm:px-3'>
                <Avatar className='h-8 w-8'>
                  {/* <AvatarImage src='/path/to/image.jpg' /> */}
                  <AvatarFallback className='bg-primary/20 text-primary font-medium text-sm'>
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                {status !== 'loading' && (
                  <span className='hidden text-sm sm:inline'>{userName}▼</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleLogout}>{t.header.logout}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleToggleMobileMenu}
            className='md:hidden text-muted-foreground'
          >
            {mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className='border-t border-border bg-card md:hidden'>
          <div className='flex flex-col gap-1 px-6 py-3'>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleCloseMobileMenu}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  currentPage === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
