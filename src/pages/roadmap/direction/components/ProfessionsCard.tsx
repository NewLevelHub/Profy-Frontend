import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import type { ProfessionOption } from '@/shared/types';

interface ProfessionsCardProps {
  professions: ProfessionOption[];
  directionName: string;
}

/**
 * Single role with a `why` only when the test data actually singles one out;
 * otherwise an honest list of real options — never a guess dressed as certainty.
 */
export function ProfessionsCard({ professions, directionName }: ProfessionsCardProps) {
  if (professions.length === 0) return null;
  const single = professions.length === 1 ? professions[0] : null;

  return (
    <Card elevated className="bg-brand-subtle flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl select-none" aria-hidden="true">🏁</span>
        <Badge variant="brand">{directionName}</Badge>
      </div>

      {single ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-caption font-semibold text-muted uppercase tracking-wide">
              Кем ты можешь стать
            </p>
            <h2 className="text-h1 font-extrabold text-primary leading-tight">{single.title}</h2>
          </div>
          {single.why && <p className="text-body text-primary leading-relaxed">{single.why}</p>}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-muted uppercase tracking-wide">
            Тебе подходит несколько ролей — рано выбирать одну
          </p>
          <div className="flex flex-wrap gap-2">
            {professions.map((profession) => (
              <span
                key={profession.title}
                className="px-3 py-1.5 rounded-pill text-body font-semibold bg-surface text-primary border border-default"
              >
                {profession.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
