'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
} from '@/components/atoms';
import { formatUtcToJst } from '@/lib/domains/date';
import { t } from '@/lib/locales/i18n';
import { useEmailQuery } from '../_hooks/useEmails';

interface EmailDetailModalProps {
  emailId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function EmailDetailModal({ emailId, onOpenChange }: EmailDetailModalProps) {
  const { email, isLoading, isError } = useEmailQuery(emailId);

  return (
    <Dialog open={emailId !== null} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t.email.ui.detail_title}</DialogTitle>
          <DialogDescription>{t.email.ui.detail_view_description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>{t.ui.loading}</p>
        ) : isError || !email ? (
          <p className='py-8 text-center text-sm text-destructive'>
            {t.ui.error_loading(t.email.name)}
          </p>
        ) : (
          <div className='space-y-4 text-sm'>
            <div>
              <p className='font-medium text-muted-foreground'>{t.email.fields.subject}</p>
              <p className='mt-1 break-words text-foreground'>{email.subject}</p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='font-medium text-muted-foreground'>{t.email.fields.from}</p>
                <p className='mt-1 break-all text-foreground'>{email.from}</p>
              </div>
              <div>
                <p className='font-medium text-muted-foreground'>
                  {t.email.fields.received_at}
                </p>
                <p className='mt-1 text-foreground'>
                  {formatUtcToJst(email.receivedAt, 'yyyy/MM/dd HH:mm')}
                </p>
              </div>
            </div>

            <div>
              <p className='font-medium text-muted-foreground'>{t.email.fields.body}</p>
              <div className='mt-1 rounded-md border border-border bg-muted/20 p-4'>
                <p className='whitespace-pre-wrap break-words text-foreground'>
                  {email.body || t.email.ui.body_unavailable}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              {t.ui.button.close}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
