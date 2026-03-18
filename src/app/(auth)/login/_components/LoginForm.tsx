'use client';

import { useState, useTransition, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { t } from '@/lib/locales/i18n';
import { ROUTES } from '@/lib/constants/routes';
import { AUTH_PROVIDERS } from '@/lib/constants/auth';

/**
 * NextAuth.jsのエラーコードを日本語メッセージに変換
 *
 * @param errorCode - NextAuthのエラーコード
 * @returns ユーザー向けのエラーメッセージ
 */
function getErrorMessage(errorCode: string | null): string {
  if (!errorCode) {
    return t.auth.login.error_auth_failed;
  }

  switch (errorCode) {
    case 'callback':
      // ユーザーが認証をキャンセルした場合
      return t.auth.login.error_access_denied;

    default:
      // その他全てのエラー
      return t.auth.login.error_auth_failed;
  }
}

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータからエラーコードを取得
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessage = getErrorMessage(errorParam.toLowerCase());
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn(AUTH_PROVIDERS.GOOGLE.PROVIDER_ID, {
          callbackUrl: ROUTES.DASHBOARD,
          redirect: false,
        });

        if (result?.error) {
          // 認証エラー - エラーコードに応じたメッセージを表示
          const errorMessage = getErrorMessage(result.error.toLowerCase());
          setError(errorMessage);
        } else if (result?.ok) {
          // 認証成功
          router.push(ROUTES.DASHBOARD);
        }
      } catch (err) {
        console.error('Login error:', err);
        setError(t.auth.login.error_unexpected);
      }
    });
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader className='flex items-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg'>
              TM
            </div>
            <CardTitle className='mt-4 text-center w-full'>{t.ui.app_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {error && (
                <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}
              <Button
                onClick={handleGoogleLogin}
                disabled={isPending}
                className='w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium'
              >
                {isPending ? t.auth.login.logging_in : t.auth.login.button}
              </Button>

              <div className='space-y-3 text-center'>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {t.auth.login.terms_message}
                </p>
                <div className='flex justify-center gap-4 text-xs'>
                  <a href='#' className='text-primary hover:underline'>
                    {t.auth.login.terms_of_service}
                  </a>
                  <span className='text-muted-foreground'>/</span>
                  <a href='#' className='text-primary hover:underline'>
                    {t.auth.login.privacy_policy}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
