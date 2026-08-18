import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading } from './typography/Heading';
import { Text } from './typography/Text';

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
        <Heading level="display-md" className={cn('text-[color:var(--midnight)]', titleClassName)}>
          {title}
        </Heading>
        {subtitle && (
          <Text variant="body-sm" className="text-secondary font-semibold mt-[3px]">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );
}
