import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useProfileStore } from '@/shared/store/profile';
import type { InterestMapItem, ResultResponse, StrengthCard } from '@/shared/types';
import { cn } from '@/shared/lib/cn';

interface ResultsCoverBandProps {
  report: ResultResponse;
  isJunior: boolean;
  onDownloadPdf: () => void;
  onExploreDirections: () => void;
}

function topInterests(map: InterestMapItem[], limit = 2): InterestMapItem[] {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...map].sort((a, b) => rank[a.level] - rank[b.level]).slice(0, limit);
}

function CoverChip({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="results-cover-chip">
      <span className="results-cover-chip__label" style={{ '--chip-dot': dot } as CSSProperties}>
        {label}
      </span>
      <span className="results-cover-chip__value">{value}</span>
    </div>
  );
}

/**
 * First viewport of a finished report — “твоя карта” cover with glass chips
 * (Jinaq-style product preview, Profy Тропа language). One primary CTA.
 */
export function ResultsCoverBand({
  report,
  isJunior,
  onDownloadPdf,
  onExploreDirections,
}: ResultsCoverBandProps) {
  const { t } = useTranslation('results');
  const profile = useProfileStore((s) => s.profile);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const key = `profy-results-celebrate:${report.assessment_id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      setCelebrate(true);
    } catch {
      setCelebrate(true);
    }
  }, [report.assessment_id]);

  const interests = topInterests(report.interest_map, 2);
  const strength: StrengthCard | undefined = report.strength_cards[0];
  const topCareer = report.interest_instrument === 'riasec' ? report.careers[0] : undefined;

  const nameLine = profile?.name
    ? profile.age
      ? t('cover.identity', { name: profile.name, age: profile.age })
      : profile.name
    : null;

  return (
    <section
      className={cn('journey-shell results-cover flex flex-col gap-6 !p-6 sm:!p-8')}
      aria-label={t('cover.aria')}
    >
      <PageHeader
        kicker={t('cover.kicker')}
        title={t('page.title')}
        subtitle={isJunior ? t('page.subtitleJunior') : t('page.subtitleAdult')}
        aside={
          <div className="journey-mascot-well">
            <Mascot state="completion" size={88} celebrate={celebrate} interactive />
          </div>
        }
        actions={
          <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={onDownloadPdf}>
            <Download size={16} aria-hidden="true" />
            {t('page.downloadPdf')}
          </Button>
        }
      />

      {nameLine && (
        <p className="text-caption font-semibold text-muted m-0 -mt-2">{nameLine}</p>
      )}

      <div className="flex flex-wrap gap-2.5">
        {interests.map((item) => (
          <CoverChip
            key={item.code}
            label={t('cover.chipInterest')}
            value={item.sphere}
            dot="var(--pine)"
          />
        ))}
        {strength && (
          <CoverChip
            label={t('cover.chipStrength')}
            value={strength.title}
            dot="var(--dawn)"
          />
        )}
        {topCareer && (
          <CoverChip
            label={t('cover.chipDirection')}
            value={topCareer.name}
            dot="var(--lake)"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="lg" className="rounded-pill" onClick={onExploreDirections}>
          {isJunior ? t('cover.ctaExploreJunior') : t('cover.ctaExplore')}
        </Button>
      </div>
    </section>
  );
}
