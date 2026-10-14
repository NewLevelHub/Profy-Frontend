import type { ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

export interface JourneyEmptyStateProps {
  /** Image URL, normally one of MASCOT from shared/ui/redesign/mascotArt. */
  illustration: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Illustrated empty / soft-error composition — same language as Welcome and
 * AssessmentNotStarted (journey shell + well + one CTA), not icon+emoji stubs.
 */
export function JourneyEmptyState({
  illustration,
  title,
  body,
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
      <div className="rd-empty-art">
        <img src={illustration} alt="" width={150} height={150} />
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
