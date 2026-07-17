import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { ResultAxisHighlight } from '@/shared/types';

interface ResultAxisHighlightsProps {
  axes: ResultAxisHighlight[];
}

function AxisChip({ label, strong }: { label: string; strong: boolean }) {
  return (
    <span
      className="font-bold rounded-pill px-3 py-1.5"
      style={{
        fontSize: 13,
        background: strong ? 'var(--brand-subtle)' : 'var(--bg-raised)',
        color: strong ? 'var(--brand)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </span>
  );
}

// matched_axes describes what defines the direction itself (direction_value,
// -2..2), not "how well you scored" — positive axes are what the profession
// leans into, negative are what it doesn't require much of.
export function ResultAxisHighlights({ axes }: ResultAxisHighlightsProps) {
  if (axes.length === 0) return null;

  const positive = axes.filter(a => a.direction_value > 0);
  const negative = axes.filter(a => a.direction_value < 0);

  return (
    <section aria-label="Что важно для этой профессии">
      <SectionHeading emoji="✨" title="Что важно для этой профессии" />
      <Card className="flex flex-col gap-4">
        {positive.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold text-primary" style={{ fontSize: 14 }}>Тебе близко:</p>
            <div className="flex flex-wrap gap-2">
              {positive.map(axis => (
                <AxisChip key={axis.code} label={axis.label_ru} strong={Math.abs(axis.direction_value) >= 2} />
              ))}
            </div>
          </div>
        )}
        {negative.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold text-primary" style={{ fontSize: 14 }}>Необязательно:</p>
            <div className="flex flex-wrap gap-2">
              {negative.map(axis => (
                <AxisChip key={axis.code} label={axis.label_ru} strong={Math.abs(axis.direction_value) >= 2} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
