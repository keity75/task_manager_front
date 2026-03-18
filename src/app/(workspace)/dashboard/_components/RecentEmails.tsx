import { Mail } from 'lucide-react';
import { formatUtcToJst } from '@/lib/domains/date';
import { t } from '@/lib/locales/i18n';

type MockRecentEmail = {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
};

const mockRecentEmails: MockRecentEmail[] = [
  {
    id: 'mock-email-1',
    from: 'tanaka@example.com',
    subject: '来週の打ち合わせ日程について',
    receivedAt: '2026-03-10T01:20:00Z',
  },
  {
    id: 'mock-email-2',
    from: 'hr@example.com',
    subject: '契約更新に関するご連絡',
    receivedAt: '2026-03-09T08:15:00Z',
  },
  {
    id: 'mock-email-3',
    from: 'project@example.com',
    subject: 'プロジェクト進捗共有',
    receivedAt: '2026-03-08T23:45:00Z',
  },
];

export function RecentEmails() {
  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      <div className='border-b border-border px-4 sm:px-6 py-4'>
        <h2 className='flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground'>
          <Mail className='h-5 w-5' />
          {t.email.ui.recent_list_title}
        </h2>
      </div>

      <div className='divide-y divide-border'>
        {mockRecentEmails.length === 0 ? (
          <div className='px-4 sm:px-6 py-8 text-center text-muted-foreground text-sm'>
            {t.ui.no_items(t.email.name)}
          </div>
        ) : (
          mockRecentEmails.map((email) => (
            <div
              key={email.id}
              className='px-4 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-muted/20'
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
