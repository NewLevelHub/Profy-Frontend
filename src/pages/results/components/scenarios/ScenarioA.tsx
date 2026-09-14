import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import type { InterestMapItem } from '@/shared/types';
import { pickSpheres } from './sphereContent';

interface ScenarioAProps {
  interestMap: InterestMapItem[];
}

/**
 * Scenario A (explore) — same structure for junior AND for middle/senior
 * students who chose "explore" as their goal. Deliberately no professions,
 * no universities, no admission language — see sphereContent.ts for the
 * data-source note on where the 4 spheres come from.
 */
export function ScenarioA({ interestMap }: ScenarioAProps) {
  const { t } = useTranslation('results');
  const spheres = pickSpheres(interestMap, t);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-title font-extrabold text-primary leading-snug mb-1.5">
          {t('scenarioExplore.title')}
        </h2>
        <p className="text-caption text-secondary leading-snug max-w-2xl">
          {t('scenarioExplore.subtitle')}
        </p>
      </div>

      {spheres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spheres.map((sphere, i) => (
            <Card key={sphere.code} className="flex flex-col gap-3">
              <div>
                <p className="text-tiny font-mono font-bold uppercase tracking-label text-muted mb-1">
                  {t('scenarioExplore.sphereLabel', { n: String(i + 1).padStart(2, '0') })}
                </p>
                <p className="font-extrabold text-primary text-body-md">{sphere.title}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span
                    className="text-tiny font-mono font-bold uppercase tracking-label flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--pine)' }}
                  >
                    {t('scenarioExplore.tryLabel')}
                  </span>
                  <span className="text-caption text-primary leading-snug">{sphere.tryNow}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className="text-tiny font-mono font-bold uppercase tracking-label flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--lake)' }}
                  >
                    {t('scenarioExplore.observeLabel')}
                  </span>
                  <span className="text-caption text-primary leading-snug">{sphere.observe}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
