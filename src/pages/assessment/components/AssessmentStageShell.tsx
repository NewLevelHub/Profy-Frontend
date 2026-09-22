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
  /** Entrance fade. Default off — a card that moves on entry reads as a resize. */
  animate?: boolean;
}

/**
 * Shared journey-shell card chrome for assessment "stage" moments —
 * intro gates (PRO-396) and early psycho steps (PRO-397) so every start
 * lands in the same card, not a bare page.
 *
 * Geometry of the `centered` variant lives in `.assessment-stage--centered`
 * (styles/index.css), because it depends on window height: the card is
 * centred on the viewport rather than on the strip under AssessmentRail, it
 * holds one height across the steps of a stage, and on short windows both
 * give way so the start card never needs scrolling. `min-height` there
 * (rather than `flex-1` alone) also makes it work on pages whose root isn't
 * a flex column (Belbin, АСТУР).
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
        centered && 'assessment-stage--centered flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6',
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
            centered && 'justify-center',
            animate && 'assessment-stage__enter',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
