import { Clock, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
import { cn } from '@/shared/lib/cn';
import { AssessmentStageShell } from './AssessmentStageShell';

export interface AssessmentIntroProps {
  /** Pill above the title (e.g. "Субтест 1 из 8" / "Диагностика"). */
  kicker: string;
  title: string;
  subtitle: string;
  /** Already localized, e.g. "20 заданий". */
  itemCountLabel: string;
  /** Already localized, e.g. "6 мин.". Omit / empty to hide the clock row. */
  durationLabel?: string;
  ctaLabel: string;
  onStart: () => void;
}

/**
 * Single reusable pre-test intro card (PRO-396) — journey-shell card with
 * kicker · title · instruction · meta · CTA. Used for phase intros
 * (diagnostic, motivation, Belbin, АСТУР block) and per-subtest АСТУР
 * screens alike, so every "about to start" moment shares one look.
 *
 * Composition (PRO-397): three blocks, not five stacked items — the naming
 * block (kicker · title · instruction), a hairline, then the commitment block
 * (what it costs · the button). The kicker is `.journey-kicker`, the same
 * status marker the journey cards on /results use, so a start gate reads as
 * part of the same journey rather than as a separate badge-topped card.
 */
export function AssessmentIntro({
  kicker,
  title,
  subtitle,
  itemCountLabel,
  durationLabel,
  ctaLabel,
  onStart,
}: AssessmentIntroProps) {
  const showDuration = Boolean(durationLabel && durationLabel.trim());

  return (
    <AssessmentStageShell
      centered
      animate
      contentClassName="flex flex-col items-center gap-8 text-center !p-8 sm:!p-10"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="journey-kicker">{kicker}</span>

        <Heading level="display-sm" as="h2" className="text-primary text-balance">
          {title}
        </Heading>

        <Text variant="body-lg" className="text-secondary max-w-[34rem] text-pretty whitespace-pre-wrap">
          {subtitle}
        </Text>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full h-px bg-[var(--border-faint)]" aria-hidden="true" />

        <div
          className={cn(
            typeClass.bodySm,
            'flex items-center justify-center gap-[18px] font-bold text-muted',
          )}
        >
          <span className="inline-flex items-center gap-[6px]">
            <FileText size={15} strokeWidth={1.75} aria-hidden="true" />
            {itemCountLabel}
          </span>
          {showDuration && (
            <>
              <span className="w-[4px] h-[4px] rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="inline-flex items-center gap-[6px]">
                <Clock size={15} strokeWidth={1.75} aria-hidden="true" />
                {durationLabel}
              </span>
            </>
          )}
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full max-w-[320px] rounded-pill text-body-lg font-extrabold"
          style={{ height: 56 }}
        >
          {ctaLabel}
        </Button>
      </div>
    </AssessmentStageShell>
  );
}
