import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Mono, Text } from '@/shared/ui/typography';

interface ReviewBlockProps {
  number: number;
  title: string;
  hint?: string;
  /** The psychologist changed this block (saved or not yet). */
  edited: boolean;
  /** Right of the title — e.g. the student's leading RIASEC codes. */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * One block of the student's report in the editor. An edited block gets a
 * dawn edge and says so in words — the psychologist can see at a glance
 * what will not reach the student the way the system wrote it.
 */
export function ReviewBlock({ number, title, hint, edited, aside, children }: ReviewBlockProps) {
  const { t } = useTranslation('psychologist');
  return (
    <section
      className={cn('bg-surface border border-strong rounded-[10px] px-5 py-5 sm:px-6', edited && 'border-l-[3px]')}
      // Inline: `.border-strong` (theme.css) comes later in the cascade than
      // Tailwind's side-colour utilities and would repaint the edge grey.
      style={edited ? { borderLeftColor: 'var(--dawn)' } : undefined}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-3.5 min-w-0">
          <Mono variant="sm" className="text-muted">
            {String(number).padStart(2, '0')}
          </Mono>
          <Text as="h3" variant="body-lg" className="font-semibold text-heading m-0">
            {title}
          </Text>
        </div>
        <div className="flex items-center gap-3">
          {aside}
          {edited && (
            <Text as="span" variant="caption" className="text-[color:var(--dawn-deep)]">
              {t('review.markEdited')}
            </Text>
          )}
        </div>
      </header>
      {hint && (
        <Text variant="body-sm" className="text-muted mt-1.5 mb-0 max-w-[72ch]">
          {hint}
        </Text>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}
