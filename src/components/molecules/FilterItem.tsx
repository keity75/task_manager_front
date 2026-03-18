import { ReactNode } from 'react';

interface FilterItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterItem({ label, children, className }: FilterItemProps) {
  return (
    <div className={className}>
      <label className='block'>
        <span className='block text-xs font-medium text-foreground mb-1'>{label}</span>
        {children}
      </label>
    </div>
  );
}
