import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { feedbackApi, type FeedbackTag } from '@/shared/api/feedback';

interface FeedbackSectionProps {
  assessmentId: string | null;
}

const TAGS: { value: FeedbackTag; label: string }[] = [
  { value: 'agree', label: 'скорее согласен' },
  { value: 'off', label: 'что-то не так' },
  { value: 'just_writing', label: 'просто хочу написать' },
];

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';

/**
 * Quiet, optional feedback block — renders after the goal-dependent section,
 * still part of /results. Explicitly does not promise a personal reply.
 * See src/shared/api/feedback.ts for the backend-endpoint gap this is built
 * against: this component attempts a real submit and shows a real error
 * state on failure rather than faking a "sent" confirmation.
 */
export function FeedbackSection({ assessmentId }: FeedbackSectionProps) {
  const [tags, setTags] = useState<Set<FeedbackTag>>(new Set());
  const [text, setText] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  function toggleTag(tag: FeedbackTag) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function handleSubmit() {
    if (!assessmentId) return;
    setState('submitting');
    try {
      await feedbackApi.submit({ assessment_id: assessmentId, tags: Array.from(tags), text });
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <Card className="flex flex-col gap-1.5">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[.06em] text-brand">
          ОТЗЫВ ПОЛУЧЕН
        </p>
        <p className="text-body text-secondary leading-relaxed">
          Спасибо — прочитаем. Ответа на это сообщение не будет, оно уходит команде без переписки.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[.06em] text-muted mb-1.5">
          ОТЗЫВ КОМАНДЕ · НЕОБЯЗАТЕЛЬНО
        </p>
        <p className="text-label font-bold text-primary">Что думаешь о результате?</p>
        <p className="text-caption text-secondary leading-snug mt-1">
          Отчёт уже сохранён — писать необязательно, это просто помогает нам делать продукт лучше.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag.value}
            type="button"
            onClick={() => toggleTag(tag.value)}
            aria-pressed={tags.has(tag.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-pill text-caption font-semibold border-[1.5px] transition-colors cursor-pointer',
              tags.has(tag.value)
                ? 'bg-brand text-on-brand border-brand'
                : 'bg-surface text-secondary border-default hover:border-brand',
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Необязательно — что угодно, коротко или подробно"
        rows={3}
        className={cn(
          'w-full bg-transparent border-[1.5px] border-default rounded-[var(--radius)] px-3 py-2.5',
          'text-body text-primary placeholder:text-placeholder resize-none transition-colors',
          'focus:outline-none focus:border-brand',
        )}
      />

      {state === 'error' && (
        <p className="text-caption text-danger" role="alert">
          Не получилось отправить отзыв. Попробуй ещё раз.
        </p>
      )}

      <div>
        <Button
          variant="ghost"
          onClick={handleSubmit}
          disabled={!assessmentId || (tags.size === 0 && text.trim().length === 0)}
          isLoading={state === 'submitting'}
        >
          Отправить отзыв
        </Button>
      </div>
    </Card>
  );
}
