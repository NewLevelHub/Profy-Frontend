import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { AxisComparisonItem, SubjectScoreItem } from '@/shared/types';

interface ResultAxisComparisonProps {
  matches: AxisComparisonItem[];
  growthAreas: AxisComparisonItem[];
  isDirectionSpecific: boolean;
  /** From the subject readiness quiz (see useResults.subjectReadiness) — folded
   * into the same two lists below rather than shown as a separate block, so
   * "what you're good at" reads as one metric instead of two data sources. */
  subjectScores?: SubjectScoreItem[];
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

const SUBJECT_GROWTH_EXPLANATION =
  'Понадобится в этом направлении — стоит подтянуть, чтобы чувствовать себя увереннее.';

// Axis codes whose copy names a real school subject outright (see
// core/axes.py AXIS_STRENGTH_COPY["Math"] — "математика и алгоритмы"). When
// the subject quiz has its own verdict for that subject, the axis (a coarse,
// whole-session trait) is dropped in favor of it — the quiz is the more
// direct, specific signal, and showing both risked flatly contradicting each
// other (e.g. "Math" as a strength next to "Математика" as a growth area).
const AXIS_CODE_TO_SUBJECT: Record<string, string> = { Math: 'Математика' };

function dropSubjectAliasedAxes(items: AxisComparisonItem[], subjectScores: SubjectScoreItem[]) {
  const coveredSubjects = new Set(subjectScores.map(s => s.subject));
  return items.filter(item => {
    const aliasedSubject = AXIS_CODE_TO_SUBJECT[item.code];
    return !aliasedSubject || !coveredSubjects.has(aliasedSubject);
  });
}

// Compares the child's own answers against the direction's actual needs
// (see result_service._axis_comparison_for), plus — where taken — the subject
// readiness quiz's per-subject verdicts (see subject_readiness_service). Both
// sources render as plain entries in the same two lists rather than separate
// blocks, so the page reads as one "Сильные стороны" / "Точки роста" verdict.
// Neither side is ever hidden or faked: an empty side gets a short honest
// line instead of chips, and if the session never happened to touch any axis
// this direction needs at all, isDirectionSpecific flips to false and the
// numbers shown are the child's whole-session signal instead — the intro
// line below says so.
export function ResultAxisComparison({
  matches: rawMatches, growthAreas: rawGrowthAreas, isDirectionSpecific, subjectScores = [],
}: ResultAxisComparisonProps) {
  const matches = dropSubjectAliasedAxes(rawMatches, subjectScores);
  const growthAreas = dropSubjectAliasedAxes(rawGrowthAreas, subjectScores);
  const subjectStrengths = subjectScores.filter(s => s.is_strength);
  const subjectGrowth = subjectScores.filter(s => !s.is_strength);

  const hasStrengths = matches.length > 0 || subjectStrengths.length > 0;
  const hasGrowth = growthAreas.length > 0 || subjectGrowth.length > 0;

  if (!hasStrengths && !hasGrowth) return null;

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
          {hasStrengths ? (
            <div className="flex flex-col gap-2">
              {matches.map(axis => (
                <p key={axis.code} className="font-semibold" style={{ fontSize: 13.5, color: 'var(--brand)' }}>
                  {axis.strength_phrase ?? axis.label_ru}
                </p>
              ))}
              {subjectStrengths.map(subject => (
                <p
                  key={subject.subject}
                  className="font-semibold"
                  style={{ fontSize: 13.5, color: 'var(--brand)' }}
                >
                  {subject.subject} — даётся легко и по-настоящему интересен тебе
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
          {hasGrowth ? (
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
              {subjectGrowth.map(subject => (
                <div key={subject.subject} className="flex flex-col gap-1.5">
                  <div>
                    <GrowthChip label={subject.subject} />
                  </div>
                  <p className="text-secondary" style={{ fontSize: 12.5, lineHeight: 1.5, paddingLeft: 2 }}>
                    {SUBJECT_GROWTH_EXPLANATION}
                  </p>
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
