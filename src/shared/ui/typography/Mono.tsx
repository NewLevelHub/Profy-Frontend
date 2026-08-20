import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { type as typeClass } from './tokens';

export type MonoVariant = 'md' | 'sm' | 'xs' | 'label';

const VARIANT_CLASS: Record<MonoVariant, string> = {
  md: typeClass.monoMd,
  sm: typeClass.monoSm,
  xs: typeClass.monoXs,
  label: typeClass.monoLabel,
};

interface MonoProps {
  variant?: MonoVariant;
  as?: 'span' | 'p' | 'div' | 'code' | 'time' | 'th' | 'td' | 'h2';
  className?: string;
  children: ReactNode;
}

/**
 * Data/mono role. IBM Plex Mono — only machine or system-authored content
 * (ids, dates, statuses, block codes, admin column headers). Never for
 * sentences a person wrote.
 */
export function Mono({
  variant = 'sm',
  as = 'span',
  className,
  children,
}: MonoProps) {
  const Tag = as as ElementType;
  return <Tag className={cn(VARIANT_CLASS[variant], className)}>{children}</Tag>;
}
