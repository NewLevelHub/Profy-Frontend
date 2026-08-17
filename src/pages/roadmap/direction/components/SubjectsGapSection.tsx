import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';

interface SubjectsGapSectionProps {
  /** Subjects relevant to this direction, as returned by the roadmap. */
  subjects: string[];
  /** Subjects the student self-marked as coming easily during onboarding. */
  subjectsEasy: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * A subject counts as "already fine" only if the student self-marked it as a
 * strength (came up easy) on the onboarding questionnaire — never a calculation.
 * Matching is fuzzy (substring, case-insensitive) because the roadmap's subject
 * names are freeform text and may not be a byte-for-byte match for the fixed
 * onboarding subject list.
 */
function isAlreadyFine(subject: string, subjectsEasy: string[]): boolean {
  const target = normalize(subject);
  if (!target) return false;
  return subjectsEasy.some((easy) => {
    const normalizedEasy = normalize(easy);
    if (!normalizedEasy) return false;
    return (
      normalizedEasy === target ||
      normalizedEasy.includes(target) ||
      target.includes(normalizedEasy)
    );
  });
}

/**
 * Qualitative gap analysis — per spec, deliberately not numeric. Every subject
 * relevant to the direction gets exactly one of two states:
 *   - "уже нормально": self-marked as a strength on onboarding.
 *   - "нужно улучшать": not marked (this is a growth area, not an error — no
 *     danger/clay color, no score, no percentage, no progress bar).
 * Source of truth is the onboarding self-assessment, not a calculation.
 */
export function SubjectsGapSection({ subjects, subjectsEasy }: SubjectsGapSectionProps) {
  if (subjects.length === 0) return null;

  const uniqueSubjects = Array.from(new Set(subjects));

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-label font-bold text-primary flex items-center gap-2">
          <span aria-hidden="true">📚</span>
          Где ты сейчас по предметам
        </h2>
        <p className="text-caption text-muted mt-1">
          По твоей самооценке из анкеты — без баллов и расчётов.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {uniqueSubjects.map((subject) => {
          const alreadyFine = isAlreadyFine(subject, subjectsEasy);
          return (
            <li
              key={subject}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-[var(--radius)] border px-4 py-3',
                alreadyFine ? 'border-default bg-success-subtle' : 'border-default bg-surface',
              )}
            >
              <span className="flex items-center gap-3 min-w-0 flex-1">
                {alreadyFine ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="w-5 h-5 text-muted flex-shrink-0" aria-hidden="true" />
                )}
                <span className="text-body font-semibold text-primary min-w-0 break-words">{subject}</span>
              </span>
              <span
                className={cn(
                  'text-caption font-semibold whitespace-nowrap pl-8 sm:pl-0 flex-shrink-0',
                  alreadyFine ? 'text-success' : 'text-secondary',
                )}
              >
                {alreadyFine ? 'Уже нормально' : 'Нужно улучшать'}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
