import { memo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
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
 * Shared "direction + match ladder" list — glass rows, no arrow/cap chrome.
 * Every row is a real `<Link>` to the direction detail page.
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
    <div className="flex flex-col gap-2.5">
      {careers.map((career, i) => {
        const isTop = i === 0;
        return (
          <Link
            key={career.slug}
            to={`/results/directions/${encodeURIComponent(career.slug)}`}
            className={cn(
              'group panel-glass flex flex-col gap-3 text-left !p-4 sm:!p-5',
              'transition-[border-color,box-shadow,transform] duration-200 press-scale',
              'hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--pine)_28%,var(--border))]',
              isTop && 'bg-[color-mix(in_srgb,var(--pine)_4%,var(--paper))]',
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex flex-col gap-1">
                {isTop && (
                  <span className="journey-kicker !mb-0" style={{ color: 'var(--pine)' }}>
                    {t('directionMatch.topPick')}
                  </span>
                )}
                <p
                  className={cn(
                    'font-semibold text-[color:var(--text-heading)] leading-snug truncate m-0',
                    isTop ? 'text-display-sm font-medium tracking-tight' : 'text-body-md',
                  )}
                  style={isTop ? { fontFamily: 'var(--font-display)' } : undefined}
                >
                  {career.name}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <CareerMatchLadder tier={career.tier} showLabel={isTop} />
                <span className="text-caption font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                  {t('directionMatch.open')}
                </span>
              </div>
            </div>

            {isTop && career.why && (
              <div
                className="rounded-[14px] px-3.5 py-3"
                style={{
                  border: '1px solid color-mix(in srgb, var(--lake) 35%, var(--border))',
                  background: 'color-mix(in srgb, var(--lake) 7%, transparent)',
                }}
              >
                <p className="journey-kicker !mb-1.5" style={{ color: 'var(--lake)' }}>
                  {t('directionMatch.whyFit')}
                </p>
                <p className="text-body-sm leading-relaxed m-0" style={{ color: 'var(--ink)' }}>
                  {career.why}
                </p>
                {showUniversitiesHint && (
                  <p
                    className="text-caption font-semibold mt-2.5 pt-2.5 m-0"
                    style={{
                      color: 'var(--lake)',
                      borderTop: '1px solid color-mix(in srgb, var(--lake) 25%, transparent)',
                    }}
                  >
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
