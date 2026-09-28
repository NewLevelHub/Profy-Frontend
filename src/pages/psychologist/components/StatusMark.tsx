import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Mono } from '@/shared/ui/typography';

export type StatusTone = 'pine' | 'dawn' | 'lake' | 'clay' | 'mute';

const TONE_TEXT: Record<StatusTone, string> = {
  pine: 'text-[color:var(--pine)]',
  dawn: 'text-[color:var(--dawn-deep)]',
  lake: 'text-[color:var(--lake)]',
  clay: 'text-[color:var(--clay)]',
  mute: 'text-muted',
};

const TONE_DOT: Record<StatusTone, string> = {
  pine: 'bg-[color:var(--pine)] border-[color:var(--pine)]',
  dawn: 'bg-[color:var(--dawn)] border-[color:var(--dawn)]',
  lake: 'bg-[color:var(--lake)] border-[color:var(--lake)]',
  clay: 'bg-[color:var(--clay)] border-[color:var(--clay)]',
  mute: 'bg-[color:var(--mute)] border-[color:var(--mute)]',
};

/**
 * Cabinet status: a dot and an uppercase machine label ("НА ПРОВЕРКЕ",
 * "ОПУБЛИКОВАН"). Hollow dot = nothing has happened yet (new, no edits),
 * filled = a state the psychologist should notice. Colour is never the only
 * signal — the label always says it.
 */
export function StatusMark({
  tone,
  hollow,
  children,
  className,
}: {
  tone: StatusTone;
  hollow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 min-w-0', className)}>
      <span
        aria-hidden="true"
        className={cn('w-2 h-2 rounded-full flex-none border-[1.5px]', TONE_DOT[tone], hollow && 'bg-transparent')}
      />
      <Mono variant="xs" className={cn('uppercase tracking-label truncate', TONE_TEXT[tone])}>
        {children}
      </Mono>
    </span>
  );
}
