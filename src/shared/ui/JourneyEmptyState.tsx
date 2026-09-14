import type { ReactNode } from 'react';
import { Mascot, type MascotState } from '@/shared/ui/Mascot';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

export interface JourneyEmptyStateProps {
  title: string;
  body: string;
  /** Mascot pose — waiting for empty, pause for soft errors. */
  mascotState?: MascotState;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Mascot-led empty / soft-error composition — same language as Welcome and
 * AssessmentNotStarted (journey shell + well + one CTA), not icon+emoji stubs.
 */
export function JourneyEmptyState({
  title,
  body,
  mascotState = 'waiting',
  actionLabel,
  onAction,
  className,
  children,
}: JourneyEmptyStateProps) {
  return (
    <div
      className={cn(
        'journey-shell flex flex-col items-center text-center gap-5 !bg-transparent border-0 p-8 sm:p-10',
        className,
      )}
    >
      <div className="journey-mascot-well">
        <Mascot state={mascotState} size={88} interactive={mascotState === 'welcome'} />
      </div>
      <div className="flex flex-col gap-2 max-w-[40ch]">
        <p className="text-label font-bold text-[color:var(--text-heading)] m-0">{title}</p>
        <p className="text-body text-secondary m-0">{body}</p>
      </div>
      {children}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" className="rounded-pill" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
