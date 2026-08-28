import { FileText, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
import { cn } from '@/shared/lib/cn';

interface AssessmentIntroProps {
  kicker: string;
  title: string;
  subtitle: string;
  itemCountLabel: string;
  durationLabel: string;
  ctaLabel: string;
  onStart: () => void;
}

/** One-time phase intro — the single display heading on this screen. */
export function AssessmentIntro({
  kicker,
  title,
  subtitle,
  itemCountLabel,
  durationLabel,
  ctaLabel,
  onStart,
}: AssessmentIntroProps) {
  return (
    <>
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-[130px] lg:pb-8"
        style={{ animation: 'fade-in-up 0.5s ease both' }}
      >
        <div className="mb-[18px]" style={{ animation: 'pf-float 3s ease-in-out infinite' }}>
          <Mascot state="transition" size={132} />
        </div>
        <span className={cn(typeClass.caption, 'inline-block bg-brand-subtle text-brand font-extrabold px-[18px] py-[7px] rounded-pill mb-[22px]')}>
          {kicker}
        </span>
        <Heading level="display-lg" as="h2" className="text-primary mb-[14px]">
          {title}
        </Heading>
        <Text variant="body-lg" className="font-semibold text-secondary mb-[30px]">
          {subtitle}
        </Text>
        <div className={cn(typeClass.bodySm, 'flex items-center justify-center gap-[18px] font-bold text-subtle')}>
          <span className="inline-flex items-center gap-[6px]">
            <FileText size={15} strokeWidth={1.75} aria-hidden="true" />
            {itemCountLabel}
          </span>
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--hairline)]" />
          <span className="inline-flex items-center gap-[6px]">
            <Clock size={15} strokeWidth={1.75} aria-hidden="true" />
            {durationLabel}
          </span>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-6 pb-[22px] pt-[18px] flex justify-center lg:static lg:px-8 lg:pb-8">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full max-w-[560px] lg:max-w-md rounded-pill text-body-lg font-extrabold"
          style={{ height: 60, background: 'var(--brand)', animation: 'pf-pulse 2.4s infinite' }}
        >
          {ctaLabel}
        </Button>
      </div>
    </>
  );
}
