import { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-raised', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
