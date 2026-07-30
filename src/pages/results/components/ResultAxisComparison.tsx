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

// Two side-by-side cards, ported from ResultsScreen.dc.html's "Сильные
// стороны" / "Точки роста" pair. Compares the child's own answers against
// the direction's actual needs (see result_service._axis_comparison_for),
// plus — where taken — the subject readiness quiz's per-subject verdicts.
// Neither side is ever hidden or faked: an empty side gets a short honest
// line instead of chips, and if the session never happened to touch any axis
// this direction needs at all, isDirectionSpecific flips to false and the
// numbers shown are the child's whole-session signal instead — flagged by
// the caveat line above the cards.
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
    <section aria-label="Ты и профессия" className="flex flex-col gap-3">
      {!isDirectionSpecific && (
        <p className="text-secondary" style={{ fontSize: 13 }}>
          По этой профессии тест пока не набрал достаточно точных совпадений — зато вот что вообще ярче
          всего проявилось в твоих ответах:
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-surface border-2 border-strong border-b-4 rounded-[22px] p-5 sm:p-6">
          <p className="font-extrabold text-primary text-[18px] mb-3.5">💪 Сильные стороны</p>
          {hasStrengths ? (
            <div className="flex flex-col gap-3">
              {matches.map(axis => (
                <div key={axis.code} className="flex gap-2.5 items-start">
                  <span className="text-[18px] leading-none flex-none" aria-hidden="true">✅</span>
                  <span className="font-semibold text-secondary text-[15px] leading-snug">
                    {axis.strength_phrase ?? axis.label_ru}
                  </span>
                </div>
              ))}
              {subjectStrengths.map(subject => (
                <div key={subject.subject} className="flex gap-2.5 items-start">
                  <span className="text-[18px] leading-none flex-none" aria-hidden="true">✅</span>
                  <span className="font-semibold text-secondary text-[15px] leading-snug">
                    {subject.subject} — даётся легко и по-настоящему интересен тебе
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary" style={{ fontSize: 13 }}>
              Пока среди важного для этой профессии нет однозначно твоих сильных сторон — но справа видно,
              куда расти, чтобы приблизиться.
            </p>
          )}
        </div>

        <div
          className="rounded-[22px] p-5 sm:p-6"
          style={{ background: 'var(--accent-soft)', border: '2px solid #FED7AA', borderBottom: '4px solid var(--accent-text)' }}
        >
          <p className="font-extrabold text-[18px] mb-3.5" style={{ color: 'var(--accent-text)' }}>
            🌱 Точки роста
          </p>
          {hasGrowth ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2.5">
                {growthAreas.map(axis => (
                  <span
                    key={axis.code}
                    className="font-extrabold rounded-pill px-4 py-2"
                    style={{ fontSize: 14, color: 'var(--accent-text)', background: '#FFEDD5', border: '2px solid #FED7AA' }}
                  >
                    {axis.label_ru}
                  </span>
                ))}
                {subjectGrowth.map(subject => (
                  <span
                    key={subject.subject}
                    className="font-extrabold rounded-pill px-4 py-2"
                    style={{ fontSize: 14, color: 'var(--accent-text)', background: '#FFEDD5', border: '2px solid #FED7AA' }}
                  >
                    {subject.subject}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {growthAreas.filter(a => a.explanation).map(axis => (
                  <p key={axis.code} className="font-semibold" style={{ fontSize: 13.5, color: 'var(--accent-text)' }}>
                    {axis.explanation!.meaning} {axis.explanation!.suggestion}
                  </p>
                ))}
                {subjectGrowth.length > 0 && (
                  <p className="font-semibold" style={{ fontSize: 13.5, color: 'var(--accent-text)' }}>
                    {SUBJECT_GROWTH_EXPLANATION}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="font-semibold" style={{ fontSize: 13, color: 'var(--accent-text)' }}>
              Явных точек роста нет — хороший знак. Просто продолжай развивать эти качества дальше.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
