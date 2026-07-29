import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { FEEDBACK_FIT_OPTIONS, type FeedbackFit } from '../hooks/useResultFeedback';

interface FitAndCommentCardProps {
  fit: FeedbackFit | null;
  onFitChange: (fit: FeedbackFit) => void;
  comment: string;
  onCommentChange: (value: string) => void;
}

export function FitAndCommentCard({ fit, onFitChange, comment, onCommentChange }: FitAndCommentCardProps) {
  return (
    <Card className="flex flex-col gap-3.5">
      <h2 className="font-extrabold text-primary text-[20px] m-0">Направление тебе подходит?</h2>
      <div className="flex gap-2.5 flex-wrap">
        {FEEDBACK_FIT_OPTIONS.map(option => {
          const active = fit === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onFitChange(option)}
              aria-pressed={active}
              className={cn(
                'font-extrabold text-[15px] px-5 py-3 rounded-pill border-2 transition-colors',
                active
                  ? 'border-brand bg-brand text-on-brand'
                  : 'border-default text-secondary hover:border-brand hover:bg-brand-subtle',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <p className="font-extrabold text-primary text-[15px] mt-1 m-0">
        Комментарий <span className="font-semibold text-muted">— по желанию</span>
      </p>
      <textarea
        value={comment}
        onChange={e => onCommentChange(e.target.value)}
        placeholder="Например: результат похож на меня, но хочется больше профессий в сфере IT"
        className="w-full min-h-[110px] rounded-2xl border-2 border-default bg-raised p-4 font-semibold text-primary resize-y focus:outline-none focus:border-brand"
      />
    </Card>
  );
}
