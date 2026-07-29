import { cn } from '@/shared/lib/cn';
import type { SubjectPriority, SubjectScoreItem } from '@/shared/types';
import { roadmapSurfaceCard, roadmapType } from '../roadmapTypography';

interface EntReadinessSectionProps {
  subjects: SubjectPriority[];
  subjectScores: SubjectScoreItem[];
}

type BarColor = 'success' | 'accent' | 'brand';

function readinessPercent(level: number, interest: number): number {
  return Math.round(((level + interest) / 6) * 100);
}

function barColor(percent: number): BarColor {
  if (percent >= 70) return 'success';
  if (percent >= 55) return 'brand';
  return 'accent';
}

const BAR_FILL: Record<BarColor, string> = {
  success: 'bg-[#22C55E]',
  accent: 'bg-[#EA580C]',
  brand: 'bg-[#7C3AED]',
};

const PERCENT_TEXT: Record<BarColor, string> = {
  success: 'text-[#22C55E]',
  accent: 'text-[#EA580C]',
  brand: 'text-[#7C3AED]',
};

function scoreForSubject(subject: string, scores: SubjectScoreItem[]): SubjectScoreItem | undefined {
  return scores.find(s => s.subject === subject);
}

export function EntReadinessSection({ subjects, subjectScores }: EntReadinessSectionProps) {
  if (subjects.length === 0) return null;

  const items = subjects.map(subject => {
    const score = scoreForSubject(subject.subject, subjectScores);
    const percent = score ? readinessPercent(score.level, score.interest) : null;
    return { name: subject.subject, percent };
  });

  const hasAnyScore = items.some(item => item.percent != null);
  if (!hasAnyScore) return null;

  return (
    <section className={roadmapSurfaceCard}>
      <h2 className={cn(roadmapType.sectionTitle, 'mb-[18px]')}>📚 Готовность к ЕНТ</h2>

      <ul className="flex flex-col gap-[18px]">
        {items.map(item => {
          const percent = item.percent ?? 0;
          const color = barColor(percent);
          return (
            <li key={item.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={roadmapType.progressLabel}>{item.name}</span>
                <span className={cn(roadmapType.progressPercent, PERCENT_TEXT[color])}>
                  {percent}%
                </span>
              </div>
              <div
                className="h-3 rounded-full bg-[#EDE9FE] overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.name}: ${percent}%`}
              >
                <div
                  className={cn('h-full rounded-full', BAR_FILL[color])}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
