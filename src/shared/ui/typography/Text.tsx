import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { type as typeClass } from './tokens';

export type TextVariant = 'body-lg' | 'body-md' | 'body-sm' | 'caption';

const VARIANT_CLASS: Record<TextVariant, string> = {
  'body-lg': typeClass.bodyLg,
  'body-md': typeClass.bodyMd,
  'body-sm': typeClass.bodySm,
  caption: typeClass.caption,
};

interface TextProps {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div' | 'label' | 'li' | 'h2' | 'h3' | 'h4';
  className?: string;
  children: ReactNode;
}

/**
 * Body-role copy. Onest — questions, descriptions, names, buttons
 * labels, repeating section titles. Default for everything a person wrote.
 */
export function Text({
  variant = 'body-md',
  as = 'p',
  className,
  children,
}: TextProps) {
  const Tag = as as ElementType;
  return <Tag className={cn(VARIANT_CLASS[variant], className)}>{children}</Tag>;
}
