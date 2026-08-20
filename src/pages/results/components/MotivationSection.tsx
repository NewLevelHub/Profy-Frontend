import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface MotivationSectionProps {
  highlights: string[];
}

export function MotivationSection({ highlights }: MotivationSectionProps) {
  if (highlights.length === 0) return null;

  return (
    <section aria-label="Что тебя мотивирует">
      <SectionHeading emoji="🔥" title="Что тебя мотивирует" />
      <div className="flex flex-col gap-2.5">
        {highlights.map((phrase, i) => (
          <Card key={i} className="flex flex-row items-center gap-2.5">
            <span className="text-lg select-none flex-shrink-0" aria-hidden="true">🔥</span>
            <p className="text-body font-semibold text-primary">{phrase}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
