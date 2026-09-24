import { TimerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { type as typeClass } from '@/shared/ui/typography/tokens';

export interface AssessmentTimerProps {
  remainingMs: number;
  durationMs: number;
  /** Pre-formatted clock string (e.g. "5:41" or "2.4 с"). */
  timeLabel: string;
  /** Optional left-side meta (e.g. "Команда 3 из 8"). */
  meta?: string;
  /** Soft deadline passed — the chip turns clay and carries the message. */
  expired?: boolean;
  expiredMessage?: string;
  /** Switch ring + digits to dawn once remaining drops below this (ms). */
  urgentBelowMs?: number;
  /** Pin the chip under the assessment rail while the questions scroll. */
  sticky?: boolean;
  className?: string;
}

const RING_R = 8.5;
const RING_C = 2 * Math.PI * RING_R;

/**
 * Countdown chrome for timed assessment screens (АСТУР). A single chip —
 * draining ring · "Осталось" · digits — rather than a second full-width bar:
 * the page header already owns the bar (battery progress), and two stacked
 * bars read as one broken one. Urgency shifts pine → dawn; expiry → clay.
 */
export function AssessmentTimer({
  remainingMs,
  durationMs,
  timeLabel,
  meta,
  expired = false,
  expiredMessage,
  urgentBelowMs = 15_000,
  sticky = false,
  className,
}: AssessmentTimerProps) {
  const { t } = useTranslation('assessment');
  const ratio = durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;
  const urgent = !expired && remainingMs > 0 && remainingMs < urgentBelowMs;
  const tone = expired ? 'expired' : urgent ? 'urgent' : 'calm';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        sticky && 'assessment-timer--sticky',
        className,
      )}
    >
      {meta ? (
        <span className={cn(typeClass.caption, 'font-semibold text-muted')}>{meta}</span>
      ) : null}

      <div
        className={cn('assessment-timer ml-auto', `assessment-timer--${tone}`)}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={expired ? expiredMessage : `${t('timer.remaining')}: ${timeLabel}`}
      >
        {expired ? (
          <>
            <TimerOff size={18} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            <span className={cn(typeClass.bodySm, 'font-semibold')}>{expiredMessage}</span>
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 20 20"
              className="assessment-timer__ring size-5 shrink-0 -rotate-90"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r={RING_R} className="assessment-timer__ring-track" />
              <circle
                cx="10"
                cy="10"
                r={RING_R}
                className="assessment-timer__ring-fill"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - ratio)}
              />
            </svg>
            <span className={cn(typeClass.caption, 'assessment-timer__label')}>
              {t('timer.remaining')}
            </span>
            <time className="assessment-timer__digits">{timeLabel}</time>
          </>
        )}
      </div>
    </div>
  );
}

/** Format remaining ms as m:ss (ceil — a visible second shouldn't vanish early). */
export function formatCountdownMmSs(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
