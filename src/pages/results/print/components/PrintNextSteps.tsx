import { useTranslation } from 'react-i18next';
import { CAREER_TIER_LABELS } from '@/shared/config/constants';
import type { StudentCareer } from '@/shared/types';
import type { SphereCardData } from '../../components/scenarios/sphereContent';
import { PrintSection } from './PrintSection';

/**
 * "Что делать дальше" — the printed counterpart of GoalBranchSection. Same
 * split as on screen (explore/junior gets four spheres to try, everyone
 * else gets matched directions), because the PDF has to say the same thing
 * the student was shown, not a third variant. What is deliberately dropped:
 * the roadmap horizons and the university/program links — both are
 * navigation into the live app, and neither survives being printed.
 */

export function PrintSpheres({ spheres }: { spheres: SphereCardData[] }) {
  const { t } = useTranslation('results');
  if (spheres.length === 0) return null;

  return (
    <PrintSection
      kicker={t('print.nextSteps.kicker')}
      title={t('print.nextSteps.spheresTitle')}
    >
      <p className="text-caption leading-snug mb-1" style={{ color: 'var(--ink)' }}>
        {t('print.nextSteps.spheresIntro')}
      </p>
      <ul className="space-y-2.5">
        {spheres.map((sphere, i) => (
          <li
            key={sphere.code}
            className="print-block print-card border border-[var(--hairline)] rounded-[var(--radius)] p-3"
          >
            <p className="font-mono text-tiny font-bold uppercase tracking-label text-muted mb-1">
              {t('print.nextSteps.sphereNo', { n: String(i + 1).padStart(2, '0') })}
            </p>
            <p className="text-body-sm font-semibold text-[color:var(--midnight)] leading-snug">
              {sphere.title}
            </p>
            <p className="text-caption leading-snug mt-1.5" style={{ color: 'var(--ink)' }}>
              <span className="font-semibold">{t('print.nextSteps.tryLabel')} </span>
              {sphere.tryNow}
            </p>
            <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
              <span className="font-semibold">{t('print.nextSteps.observeLabel')} </span>
              {sphere.observe}
            </p>
          </li>
        ))}
      </ul>
    </PrintSection>
  );
}

export function PrintCareers({ careers }: { careers: StudentCareer[] }) {
  const { t } = useTranslation('results');
  // Same wording as ScenarioProfessional's no-data branch — an empty
  // "что дальше" block would otherwise read as a rendering bug in the PDF.
  if (careers.length === 0) {
    return (
      <PrintSection kicker={t('print.nextSteps.kicker')}>
        <p className="text-body-sm" style={{ color: 'var(--ink)' }}>
          {t('print.nextSteps.careersEmpty')}
        </p>
      </PrintSection>
    );
  }

  const sorted = [...careers].sort((a, b) => a.rank - b.rank);

  return (
    <PrintSection kicker={t('print.nextSteps.careersKicker')} title={t('print.nextSteps.careersTitle')}>
      <ul className="space-y-2.5">
        {sorted.map((career) => (
          <li
            key={career.slug}
            className="print-block print-card border border-[var(--hairline)] rounded-[var(--radius)] p-3"
          >
            {/* `flex-wrap` + `min-w-0` on the title: without both, a long
                profession name sitting next to the tier badge on one line
                can force this row wider than the card itself, pushing its
                right border/rounded corner off the printed page — the tier
                badge just drops to its own line instead once that happens. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="min-w-0 text-body-sm font-semibold text-[color:var(--midnight)] leading-snug">
                {career.name}
              </p>
              <p className="font-mono text-tiny uppercase tracking-label text-muted flex-shrink-0">
                {t(CAREER_TIER_LABELS[career.tier])}
              </p>
            </div>
            <p className="text-caption leading-snug mt-1" style={{ color: 'var(--ink)' }}>
              {career.why}
            </p>
            {career.matched_strengths.length > 0 && (
              <p className="text-caption leading-snug mt-1" style={{ color: 'var(--ink)' }}>
                <span className="font-semibold">{t('print.nextSteps.matchesLabel')} </span>
                {career.matched_strengths.join(', ')}
              </p>
            )}
            {career.try_now && (
              <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
                <span className="font-semibold">{t('print.nextSteps.tryNowLabel')} </span>
                {career.try_now}
              </p>
            )}
          </li>
        ))}
      </ul>
    </PrintSection>
  );
}
