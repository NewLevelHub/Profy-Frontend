import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { ChildAxisSignal } from '@/shared/types';

interface ResultChildProfileProps {
  strengths: ChildAxisSignal[];
  growthAreas: ChildAxisSignal[];
}

function AxisChip({ label, muted }: { label: string; muted: boolean }) {
  return (
    <span
      className="font-bold rounded-pill px-3 py-1.5"
      style={{
        fontSize: 13,
        background: muted ? 'var(--bg-raised)' : 'var(--brand-subtle)',
        color: muted ? 'var(--text-secondary)' : 'var(--brand)',
      }}
    >
      {label}
    </span>
  );
}

// Unlike ResultAxisHighlights (the profession's own axis profile), this
// describes the child: strengths/growth_areas are summed from their actual
// answers across the whole session (result_service._child_axis_totals) —
// what they answered, not what the destination profession happens to need.
// "growth_areas" is deliberately framed softly ("Точки роста"), never
// "слабые стороны" — same hedged tone as the rest of the app's copy.
export function ResultChildProfile({ strengths, growthAreas }: ResultChildProfileProps) {
  if (strengths.length === 0 && growthAreas.length === 0) return null;

  return (
    <section aria-label="Твой профиль">
      <SectionHeading emoji="🧭" title="Твой профиль" />
      <Card className="flex flex-col gap-4">
        {strengths.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold text-primary" style={{ fontSize: 14 }}>Сильные стороны:</p>
            <div className="flex flex-wrap gap-2">
              {strengths.map(axis => (
                <AxisChip key={axis.code} label={axis.label_ru} muted={false} />
              ))}
            </div>
          </div>
        )}
        {growthAreas.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold text-primary" style={{ fontSize: 14 }}>Точки роста:</p>
            <p className="text-secondary" style={{ fontSize: 13 }}>Над чем интересно порасти</p>
            <div className="flex flex-wrap gap-2">
              {growthAreas.map(axis => (
                <AxisChip key={axis.code} label={axis.label_ru} muted />
              ))}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
