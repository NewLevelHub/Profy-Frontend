import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type PageContainerSize = 'wide' | 'narrow' | 'content';

interface PageContainerProps {
  children: ReactNode;
  size?: PageContainerSize;
  className?: string;
  as?: ElementType;
}

const SIZE_CLASS: Record<PageContainerSize, string> = {
  wide: 'max-w-[1260px]',
  narrow: 'max-w-3xl',
  content: 'max-w-2xl',
};

export function PageContainer({
  children,
  size = 'wide',
  className,
  as: Tag = 'div',
}: PageContainerProps) {
  return (
    <Tag className={cn(SIZE_CLASS[size], 'mx-auto w-full', className)}>
      {children}
    </Tag>
  );
}
