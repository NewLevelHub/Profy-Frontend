import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading, type HeadingLevel } from './typography/Heading';
import { Text } from './typography/Text';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Mono uppercase eyebrow — journey language (ТРОПА · УНИВЕРСИТЕТЫ). */
  kicker?: ReactNode;
  /** Left of the title block (icon, avatar). Prefer `aside` for mascot wells. */
  leading?: ReactNode;
  /** Right-side visual (mascot well / mini illustration). */
  aside?: ReactNode;
  /** Actions aligned with the title row (PDF, primary CTA). */
  actions?: ReactNode;
  align?: 'left' | 'center';
  /** Title size — `display-lg` for a cabinet's front screens. */
  level?: HeadingLevel;
  /** Let `aside`/`actions` drop under the title when the row gets narrow
   *  (phones) instead of squeezing the title into a thin column. */
  wrap?: boolean;
  className?: string;
  titleClassName?: string;
}

/**
 * In-app page hero. Keeps first viewport lean: optional kicker + one headline
 * + one supporting line + optional aside/actions — same storytelling slots as
 * Welcome / AssessmentNotStarted, without becoming a dashboard.
 */
export function PageHeader({
  title,
  subtitle,
  kicker,
  leading,
  aside,
  actions,
  align = 'left',
  level = 'display-md',
  wrap = false,
  className,
  titleClassName,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex gap-4 sm:gap-5',
        centered ? 'flex-col items-center text-center' : 'items-start justify-between',
        wrap && !centered && 'flex-wrap items-end',
        className,
      )}
    >
      <div
        className={cn(
          'flex gap-4 min-w-0',
          centered ? 'flex-col items-center' : 'items-start flex-1',
          wrap && !centered && 'basis-md',
        )}
      >
        {leading}
        <div className={cn('min-w-0', centered && 'w-full')}>
          {kicker && (
            <span className="journey-kicker mb-2.5 block">{kicker}</span>
          )}
          <Heading
            level={level}
            className={cn('text-[color:var(--text-heading)] text-balance', titleClassName)}
          >
            {title}
          </Heading>
          {subtitle && (
            <Text variant="body-sm" className="text-secondary font-semibold mt-1.5 max-w-[54ch]">
              {subtitle}
            </Text>
          )}
        </div>
      </div>

      {(aside || actions) && (
        <div
          className={cn(
            'flex items-center gap-3 flex-shrink-0',
            centered && 'justify-center flex-wrap',
          )}
        >
          {actions}
          {aside}
        </div>
      )}
    </div>
  );
}
