import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface AssessmentStageShellProps {
  children: ReactNode;
  className?: string;
  /** Classes on the journey-shell card (padding, gap, alignment). */
  contentClassName?: string;
  /** Intro cards stay narrower; in-test content can go wider. */
  maxWidth?: 'intro' | 'content';
  /** Vertically center the card in the viewport (intro / psycho steps). */
  centered?: boolean;
  /** Entrance motion. Default off — transform animations read as card resize. */
  animate?: boolean;
}

/**
 * Shared journey-shell card chrome for assessment "stage" moments —
 * intro gates (PRO-396) and early psycho steps (PRO-397) so every start
 * lands in the same card, not a bare page.
 */
export function AssessmentStageShell({
  children,
  className,
  contentClassName,
  maxWidth = 'intro',
  centered = false,
  animate = false,
}: AssessmentStageShellProps) {
  return (
    <div
      className={cn(
        centered && 'flex-1 flex flex-col items-center justify-center w-full px-4 py-8 sm:px-6',
        className,
      )}
    >
      <div
        className={cn(
          'assessment-stage mx-auto w-full',
          maxWidth === 'content' ? 'max-w-[720px]' : 'max-w-[640px]',
        )}
      >
        <div
          className={cn(
            'assessment-stage__shell journey-shell w-full',
            contentClassName,
          )}
          style={animate ? { animation: 'fade-in-up 0.45s ease both' } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
