import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { AxisComparisonItem } from '@/shared/types';

interface ResultAxisComparisonProps {
  matches: AxisComparisonItem[];
  growthAreas: AxisComparisonItem[];
  isDirectionSpecific: boolean;
}

function GrowthChip({ label }: { label: string }) {
  return (
    <span
      className="font-bold rounded-pill px-3 py-1.5"
      style={{ fontSize: 13, background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
    >
      {label}
    </span>
  );
}

// Compares the child's own answers against the direction's actual needs
// (see result_service._axis_comparison_for). Neither side is ever hidden or
// faked: an empty side gets a short honest line instead of chips, and if the
// session never happened to touch any axis this direction needs at all,
// isDirectionSpecific flips to false and the numbers shown are the child's
// whole-session signal instead — the intro line below says so.
export function ResultAxisComparison({ matches, growthAreas, isDirectionSpecific }: ResultAxisComparisonProps) {
  if (matches.length === 0 && growthAreas.length === 0) return null;

  return (
    <section aria-label="Ты и профессия">
      <SectionHeading emoji="🧭" title="Ты и профессия" />
      <Card className="flex flex-col gap-4">
        {!isDirectionSpecific && (
          <p className="text-secondary" style={{ fontSize: 13 }}>
            По этой профессии тест пока не набрал достаточно точных совпадений — зато вот что вообще ярче
            всего проявилось в твоих ответах:
          </p>
        )}

        <div className="flex flex-col gap-2">
          <p className="font-bold text-primary" style={{ fontSize: 14 }}>Сильные стороны:</p>
          {matches.length > 0 ? (
            <div className="flex flex-col gap-2">
              {matches.map(axis => (
                <p key={axis.code} className="font-semibold" style={{ fontSize: 13.5, color: 'var(--brand)' }}>
                  {axis.strength_phrase ?? axis.label_ru}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-secondary" style={{ fontSize: 13 }}>
              Пока среди важного для этой профессии нет однозначно твоих сильных сторон — но ниже видно,
              куда расти, чтобы приблизиться.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold text-primary" style={{ fontSize: 14 }}>Точки роста:</p>
          {growthAreas.length > 0 ? (
            <div className="flex flex-col gap-3">
              {growthAreas.map(axis => (
                <div key={axis.code} className="flex flex-col gap-1.5">
                  <div>
                    <GrowthChip label={axis.label_ru} />
                  </div>
                  {axis.explanation && (
                    <p className="text-secondary" style={{ fontSize: 12.5, lineHeight: 1.5, paddingLeft: 2 }}>
                      {axis.explanation.meaning} {axis.explanation.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary" style={{ fontSize: 13 }}>
              Явных точек роста нет — хороший знак. Просто продолжай развивать эти качества дальше.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
