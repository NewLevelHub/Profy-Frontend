import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import type { FeedbackAspectKey } from '../hooks/useResultFeedback';

interface AspectsCardProps {
  aspects: readonly { key: FeedbackAspectKey; title: string; hint: string }[];
  scores: Partial<Record<FeedbackAspectKey, number>>;
  onChange: (key: FeedbackAspectKey, score: number) => void;
}

export function AspectsCard({ aspects, scores, onChange }: AspectsCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="font-extrabold text-primary text-[20px] m-0">Что понравилось, а что нет</h2>
        <p className="text-secondary font-semibold text-[15px] mt-1 m-0">Оцени каждую часть от 1 до 5</p>
      </div>
      {aspects.map(aspect => (
        <div
          key={aspect.key}
          className="flex items-center justify-between gap-4 flex-wrap bg-raised rounded-2xl p-4"
        >
          <div className="min-w-0">
            <p className="font-extrabold text-primary text-[17px] m-0">{aspect.title}</p>
            <p className="text-secondary font-semibold text-[14px] m-0 text-pretty">{aspect.hint}</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => {
              const active = scores[aspect.key] === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(aspect.key, n)}
                  aria-pressed={active}
                  className={cn(
                    'w-11 h-11 rounded-xl font-extrabold text-[16px] border-2 transition-colors',
                    active
                      ? 'border-brand bg-brand text-on-brand'
                      : 'border-default text-secondary hover:border-brand hover:text-brand',
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Card>
  );
}
