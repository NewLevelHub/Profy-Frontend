import { memo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
import type { StudentCareer } from '@/shared/types';

interface DirectionMatchListProps {
  careers: StudentCareer[];
  emptyText?: string;
  /** Senior + profession/university goal only (matches `canSeeUniversities`)
   *  — every row here leads to the direction detail page, and only for this
   *  group does that page also surface a university/program list. Middle
   *  tier's detail page has nothing university-shaped to point at yet, so
   *  the hint would be a promise the click doesn't keep. */
  showUniversitiesHint?: boolean;
}

/**
 * Shared "direction + match ladder" table — used by scenario B's
 * "НАПРАВЛЕНИЯ И ПРОФЕССИИ ПОД ЦЕЛЬ" and scenario C's step 01 "Направления
 * под цель". A single hairline-bordered list, not individually-bordered
 * cards — every row is a real ссылка `<Link>` (настоящий `<a href>`:
 * клавиатура, «открыть в новой вкладке», копирование адреса), ведущая на
 * страницу направления.
 * Always the complete list, including the top-ranked direction already
 * headlined above it — this table is meant to be the full reference, not
 * "everything except the one already shown." Deeper follow-through beyond
 * the detail page (comparison, filtering, "show more") is intentionally
 * out of scope here — this is the table itself, not the next step after it.
 */
export const DirectionMatchList = memo(function DirectionMatchList({
  careers,
  emptyText,
  showUniversitiesHint = false,
}: DirectionMatchListProps) {
  const { t } = useTranslation('results');

  if (careers.length === 0) {
    return <p className="text-caption text-muted">{emptyText ?? t('directionMatch.empty')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden">
      {careers.map((career, i) => {
        const isTop = i === 0;
        return (
          <Link
            key={career.slug}
            to={`/results/directions/${encodeURIComponent(career.slug)}`}
            className={cn(
              'w-full flex flex-col gap-3 text-left bg-surface hover:bg-hover transition-colors',
              isTop ? 'px-5 py-5' : 'px-5 py-4',
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-semibold text-[color:var(--midnight)] leading-snug truncate',
                    isTop ? 'text-body-lg' : 'text-body-md',
                  )}
                >
                  {career.name}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <CareerMatchLadder tier={career.tier} showLabel={isTop} />
                <span className="flex items-center gap-1 text-muted">
                  {showUniversitiesHint && <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>

            {/* Top-ranked direction only — same tinted-card language as
                ScenarioProfessional's "МОСТ К ЦЕЛИ" (Lake border/tint), just
                surfacing `why` instead: this row is the one already
                headlined above the table, so it earns the extra context the
                rest of the plain list doesn't need. */}
            {isTop && career.why && (
              <div
                className="rounded-[var(--radius-sm)] px-3.5 py-3"
                style={{ border: '1px solid var(--lake)', background: 'color-mix(in srgb, var(--lake) 6%, transparent)' }}
              >
                <p
                  className="font-mono text-tiny font-bold uppercase tracking-label mb-1"
                  style={{ color: 'var(--lake)' }}
                >
                  {t('directionMatch.whyFit')}
                </p>
                <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
                  {career.why}
                </p>
                {showUniversitiesHint && (
                  <p
                    className="flex items-center gap-1.5 text-caption font-semibold mt-2.5 pt-2.5"
                    style={{ color: 'var(--lake)', borderTop: '1px solid color-mix(in srgb, var(--lake) 25%, transparent)' }}
                  >
                    <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {t('directionMatch.openForUniversities')}
                  </p>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
});
