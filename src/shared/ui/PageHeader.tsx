import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  leading,
  align = 'left',
  className,
  titleClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex gap-4',
        align === 'center' ? 'flex-col items-center text-center' : 'items-center',
        className,
      )}
    >
      {leading}
      <div className={cn(align === 'center' && 'w-full')}>
        <h1
          className={cn(
            'font-black text-primary leading-tight tracking-[-0.01em] text-[30px]',
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-secondary font-semibold text-[15px] mt-[3px]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
