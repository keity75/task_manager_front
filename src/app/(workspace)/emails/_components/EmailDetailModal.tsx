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
import { Email } from '../types';

interface EmailDetailModalProps {
  email: Email | null;
  onOpenChange: (open: boolean) => void;
}

export function EmailDetailModal({ email, onOpenChange }: EmailDetailModalProps) {
  return (
    <Dialog open={email !== null} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        {email && (
          <>
            <DialogHeader>
              <DialogTitle>{t.email.ui.detail_title}</DialogTitle>
              <DialogDescription>{t.email.ui.detail_view_description}</DialogDescription>
            </DialogHeader>

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
                  <p className='whitespace-pre-wrap text-foreground'>
                    {email.body || t.email.ui.body_unavailable}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  {t.ui.button.close}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
