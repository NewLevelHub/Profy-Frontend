import { Card } from '@/shared/ui/Card';
import type { InterestMapItem } from '@/shared/types';
import { pickSpheres } from './sphereContent';
import { RoadmapHorizons } from './RoadmapHorizons';

interface ScenarioAProps {
  interestMap: InterestMapItem[];
}

const EXPLORE_HORIZONS = [
  { id: 'h1', label: '1 МЕСЯЦ', title: 'Попробовать все 4 сферы', description: 'По одному маленькому делу в каждой — без выбора «лучшей».' },
  { id: 'h2', label: '3 МЕСЯЦА', title: 'Понаблюдать за собой', description: 'Что было интересно продолжать, а что забросил через день.' },
  { id: 'h3', label: '6 МЕСЯЦЕВ', title: 'Накопить опыт', description: 'Несколько занятий в разных сферах — материал для будущего выбора.' },
];

/**
 * Scenario A (explore) — same structure for junior AND for middle/senior
 * students who chose "explore" as their goal. Deliberately no professions,
 * no universities, no admission language — see sphereContent.ts for the
 * data-source note on where the 4 spheres come from.
 */
export function ScenarioA({ interestMap }: ScenarioAProps) {
  const spheres = pickSpheres(interestMap);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-title font-extrabold text-primary leading-snug mb-1.5">
          Четыре сферы, где стоит попробовать себя в ближайший месяц
        </h2>
        <p className="text-caption text-secondary leading-snug max-w-2xl">
          Профессий и вузов в этом сценарии нет: пока задача не выбрать, а набрать опыт, на который потом можно опереться.
        </p>
      </div>

      {spheres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spheres.map((sphere, i) => (
            <Card key={sphere.code} className="flex flex-col gap-3">
              <div>
                <p className="text-tiny font-mono font-bold uppercase tracking-[.06em] text-muted mb-1">
                  СФЕРА {String(i + 1).padStart(2, '0')}
                </p>
                <p className="font-extrabold text-primary" style={{ fontSize: 17 }}>{sphere.title}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span
                    className="text-tiny font-mono font-bold uppercase tracking-[.04em] flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--pine)' }}
                  >
                    ПОПРОБОВАТЬ
                  </span>
                  <span className="text-caption text-primary leading-snug">{sphere.tryNow}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className="text-tiny font-mono font-bold uppercase tracking-[.04em] flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--lake)' }}
                  >
                    ПОНАБЛЮДАТЬ
                  </span>
                  <span className="text-caption text-primary leading-snug">{sphere.observe}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoadmapHorizons
        title="ИССЛЕДОВАТЕЛЬСКИЙ ROADMAP"
        horizons={EXPLORE_HORIZONS}
        ariaLabel="Исследовательский roadmap: 1 месяц, 3 месяца, 6 месяцев — без фиксированной цели"
        lastNodeStyle="open"
      />
    </div>
  );
}
