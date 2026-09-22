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
 * Two things the `centered` variant guarantees (PRO-397 follow-up):
 *
 * 1. The card is centered against the **viewport**, not against the strip
 *    below AssessmentRail. The rail is in flow, so plain `justify-center`
 *    parked every start card half a rail (~56px) below the middle of the
 *    screen. The rail publishes its measured height as
 *    `--assessment-rail-h`; padding that much off the bottom puts the card's
 *    centre exactly on 50dvh. The fallback keeps it sane if a stage card is
 *    ever rendered without a rail.
 * 2. The card holds one height across the steps of a stage (`sm:min-h-*`),
 *    so moving intro → check-in → colour circle doesn't visibly resize and
 *    re-centre the surface under the learner's cursor. Below `sm` the height
 *    is free — a phone has no room to spare.
 *
 * `min-h` on the wrapper (rather than `flex-1` alone) means the centering
 * also works on pages whose root isn't a flex column (Belbin, АСТУР).
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
        centered && [
          'flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6',
          'min-h-[calc(100dvh-var(--assessment-rail-h,7rem))]',
          'pt-8 pb-[calc(2rem+var(--assessment-rail-h,7rem))]',
        ],
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
            centered && 'sm:min-h-[29rem] justify-center',
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
