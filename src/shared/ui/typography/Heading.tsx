import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { type as typeClass } from './tokens';

export type HeadingLevel = 'display-lg' | 'display-md' | 'display-sm';

const LEVEL_CLASS: Record<HeadingLevel, string> = {
  'display-lg': typeClass.displayLg,
  'display-md': typeClass.displayMd,
  'display-sm': typeClass.displaySm,
};

const LEVEL_TAG: Record<HeadingLevel, 'h1' | 'h2'> = {
  'display-lg': 'h1',
  'display-md': 'h1',
  'display-sm': 'h2',
};

interface HeadingProps {
  level?: HeadingLevel;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  children: ReactNode;
}

/**
 * Display-role heading. Onest at display size — use at most 1–2 times per
 * screen (page title, diagnostic step name, brand moment). Never for body
 * copy or repeating section/card titles; those go through <Text>.
 */
export function Heading({
  level = 'display-md',
  as,
  className,
  children,
}: HeadingProps) {
  const Tag = (as ?? LEVEL_TAG[level]) as ElementType;
  return <Tag className={cn(LEVEL_CLASS[level], className)}>{children}</Tag>;
}
