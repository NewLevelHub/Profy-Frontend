import { useMemo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { CareerMatchLadder, careerTierToLevel } from '@/shared/ui/MatchLadder';
import type { AgeGroup, StudentCareer } from '@/shared/types';
import { DirectionMatchList } from './DirectionMatchList';
import { RoadmapHorizons } from './RoadmapHorizons';

interface ScenarioProfessionalProps {
  careers: StudentCareer[];
  /** 'middle' | 'senior' only — junior never reaches this scenario. */
  ageGroup: AgeGroup;
}

/**
 * Merged "профессия + университет" scenario — `profession` and
 * `university` used to be two separate assessment goals with two separate
 * scenario trees (ScenarioB/ScenarioC/ScenarioCDowngrade); they're one goal
 * now (GoalSelectionPage only offers "Выбрать профессию"), so this is one
 * component. What used to be goal-gated (admission year, roadmap flavor) is
 * now purely age-gated: senior gets the full admission-oriented roadmap,
 * middle gets the lighter exploration one — same reasoning
 * ScenarioCDowngrade already had (subject profile isn't locked in yet at
 * 12–14), just no longer tied to a second goal choice. University/program
 * access itself lives inline on the direction detail page (gated by
 * `canSeeUniversities` via `useUniversityList`), not duplicated here.
 *
 * Which direction is treated as "the goal" is a judgment call: the
 * result-v2 contract has no field for a specific stated-target
 * profession/university, only the assessment goal category — so the
 * top-ranked entry in `report.careers` (rank 1, already the backend's own
 * best match) stands in for "the goal direction". Load-bearing for every
 * headline/copy string below.
 */
export function ScenarioProfessional({ careers, ageGroup }: ScenarioProfessionalProps) {
  const { t } = useTranslation('results');
  const isMiddle = ageGroup === 'middle';
  const sorted = useMemo(() => [...careers].sort((a, b) => a.rank - b.rank), [careers]);
  const top = sorted[0];

  // "ROADMAP ВЫБОРА" — middle tier: still narrowing down a direction, not yet
  // admission-specific (the subject profile isn't locked in at 12–14).
  const choiceHorizons = (['h1', 'h2', 'h3'] as const).map((id) => ({
    id,
    label: t(`choiceHorizons.${id}.label`),
    title: t(`choiceHorizons.${id}.title`),
    description: t(`choiceHorizons.${id}.description`),
  }));

  if (!top) {
    return <p className="text-body text-secondary">{t('scenarioProfessional.notEnoughData')}</p>;
  }

  const level = careerTierToLevel(top.tier);
  const isBridge = level <= 2;

  // "Adjacent directions that share the same strength" — real data: other
  // careers in the list whose matched_strengths overlap with the top
  // direction's, not a fabricated relation.
  const adjacent = sorted
    .slice(1)
    .filter((c) => c.matched_strengths.some((s) => top.matched_strengths.includes(s)))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {isBridge && (
        <Card style={{ borderColor: 'var(--lake)', background: 'color-mix(in srgb, var(--lake) 6%, transparent)' }}>
          <div className="mb-4">
            <p className="text-label font-bold text-primary flex items-center gap-2">
              <span aria-hidden="true">🌉</span>
              {t('scenarioProfessional.bridgeLabel')}
            </p>
            <p className="text-caption text-secondary leading-snug mt-1">
              {t('scenarioProfessional.bridgeSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--pine)' }}
              >
                {t('scenarioProfessional.alreadyWorksLabel')}
              </p>
              <ul className="flex flex-col gap-1.5">
                {(top.matched_strengths.length > 0 ? top.matched_strengths.slice(0, 3) : [t('scenarioProfessional.baseForStart')]).map((s, i) => (
                  <li key={i} className="text-caption text-primary leading-snug">— {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--dawn)' }}
              >
                {t('scenarioProfessional.checkByActionLabel')}
              </p>
              <ul className="flex flex-col gap-1.5">
                <li className="text-caption text-primary leading-snug">— {top.try_now}</li>
                <li className="text-caption text-primary leading-snug">— {t('scenarioProfessional.talkToSomeone')}</li>
              </ul>
            </div>
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--lake)' }}
              >
                {t('scenarioProfessional.nearGoalLabel')}
              </p>
              {adjacent.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {adjacent.map((c) => (
                    <li key={c.slug} className="flex items-center justify-between gap-2">
                      <Link
                        to={`/results/directions/${encodeURIComponent(c.slug)}`}
                        className="text-caption font-semibold text-primary hover:text-brand text-left"
                      >
                        {c.name}
                      </Link>
                      <CareerMatchLadder tier={c.tier} showLabel={false} size="sm" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-caption text-muted">{t('scenarioProfessional.noAdjacent')}</p>
              )}
              <p className="text-tiny text-muted leading-snug mt-2">{t('scenarioProfessional.notReplacement')}</p>
            </div>
          </div>
        </Card>
      )}

      <section aria-label={t('scenarioProfessional.directionsAria')} className="flex flex-col gap-3">
        <div>
          <p className="text-label font-bold text-primary font-mono uppercase tracking-label">
            {isMiddle ? t('scenarioProfessional.directionsTitleMiddle') : t('scenarioProfessional.directionsTitleSenior')}
          </p>
          <p className="text-caption leading-snug mt-1" style={{ color: 'var(--ink)' }}>
            {isMiddle
              ? t('scenarioProfessional.directionsSubtitleMiddle')
              : t('scenarioProfessional.directionsSubtitleSenior')}
          </p>
        </div>
        <DirectionMatchList careers={sorted} showUniversitiesHint={!isMiddle} />
      </section>

      {isMiddle && (
        <RoadmapHorizons
          title={t('scenarioProfessional.roadmapTitle')}
          horizons={choiceHorizons}
          ariaLabel={t('scenarioProfessional.roadmapAria')}
          lastNodeStyle="filled"
        />
      )}
    </div>
  );
}
