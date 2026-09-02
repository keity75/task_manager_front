'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { formatUtcToJst } from '@/lib/domains/date';
import { t } from '@/lib/locales/i18n';
import { Email } from '../../emails/types';
import { EmailDetailModal } from '../../emails/_components/EmailDetailModal';

interface RecentEmailsProps {
  emails: Email[];
}

export function RecentEmails({ emails }: RecentEmailsProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      <div className='border-b border-border px-4 sm:px-6 py-4'>
        <h2 className='flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground'>
          <Mail className='h-5 w-5' />
          {t.email.ui.recent_list_title}
        </h2>
      </div>

      <div className='divide-y divide-border'>
        {emails.length === 0 ? (
          <div className='px-4 sm:px-6 py-8 text-center text-muted-foreground text-sm'>
            {t.ui.no_items(t.email.name)}
          </div>
        ) : (
          emails.map((email) => (
            <button
              key={email.id}
              type='button'
              onClick={() => setSelectedEmailId(email.id)}
              className='w-full px-4 sm:px-6 py-3 sm:py-4 text-left transition-colors hover:bg-muted/20'
            >
              <div className='min-w-0'>
                <p className='font-medium text-foreground truncate text-sm sm:text-base'>
                  {email.from}
                </p>
                <p className='mt-1 text-xs sm:text-sm font-medium text-foreground truncate'>
                  {email.subject}
                </p>
                <p className='mt-1 text-xs sm:text-sm text-muted-foreground truncate'>
                  {formatUtcToJst(email.receivedAt, 'yyyy/MM/dd HH:mm')}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <EmailDetailModal
        emailId={selectedEmailId}
        onOpenChange={(open) => !open && setSelectedEmailId(null)}
      />
    </div>
  );
}
