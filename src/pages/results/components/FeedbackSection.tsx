import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { feedbackApi, REPORT_SECTIONS } from '@/shared/api/feedback';

interface FeedbackSectionProps {
  assessmentId: string | null;
}

const RELEVANCE_SCALE = [1, 2, 3, 4, 5];

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';

/**
 * Quiet, optional feedback block — renders after the goal-dependent section,
 * still part of /results. Explicitly does not promise a personal reply.
 * 3-question shape per TZ_Profi.md §28.4: 1-5 relevance score (required),
 * multi-pick "what was useful" from the report's own sections, and an
 * optional free-text note — not the earlier tags+freetext shape this
 * component used before the backend existed.
 */
export function FeedbackSection({ assessmentId }: FeedbackSectionProps) {
  const [relevanceScore, setRelevanceScore] = useState<number | null>(null);
  const [sections, setSections] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  function toggleSection(value: string) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit() {
    if (!assessmentId || relevanceScore === null) return;
    setState('submitting');
    try {
      await feedbackApi.submit({
        assessment_id: assessmentId,
        relevance_score: relevanceScore,
        helpful_sections: Array.from(sections),
        comment: comment.trim() || null,
      });
      setState('sent');
      setTimeout(() => {
        setRelevanceScore(null);
        setSections(new Set());
        setComment('');
        setState('idle');
      }, 2000);
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <Card className="flex flex-col gap-1.5">
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-brand">
          ОТЗЫВ ПОЛУЧЕН
        </p>
        <p className="text-body text-secondary leading-relaxed">
          Спасибо — прочитаем. Ответа на это сообщение не будет, оно уходит команде без переписки.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted mb-1.5">
          ОТЗЫВ КОМАНДЕ · НЕОБЯЗАТЕЛЬНО
        </p>
        <p className="text-label font-bold text-primary">Что думаешь о результате?</p>
        <p className="text-caption text-secondary leading-snug mt-1">
          Отчёт уже сохранён — писать необязательно, это просто помогает нам делать продукт лучше.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold text-primary">Насколько это про тебя?</p>
        <div className="flex gap-2" role="radiogroup" aria-label="Насколько это про тебя, от 1 до 5">
          {RELEVANCE_SCALE.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={relevanceScore === value}
              onClick={() => setRelevanceScore(value)}
              className={cn(
                'w-10 h-10 rounded-full text-caption font-bold border-[1.5px] transition-colors cursor-pointer',
                relevanceScore === value
                  ? 'bg-brand text-on-brand border-brand'
                  : 'bg-surface text-secondary border-default hover:border-brand',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold text-primary">Что оказалось самым полезным?</p>
        <div className="flex flex-wrap gap-2">
          {REPORT_SECTIONS.map((section) => (
            <button
              key={section.value}
              type="button"
              onClick={() => toggleSection(section.value)}
              aria-pressed={sections.has(section.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-pill text-caption font-semibold border-[1.5px] transition-colors cursor-pointer',
                sections.has(section.value)
                  ? 'bg-brand text-on-brand border-brand'
                  : 'bg-surface text-secondary border-default hover:border-brand',
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold text-primary">
          Что было непонятно или не подошло? <span className="font-normal text-muted">— необязательно</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Необязательно — что угодно, коротко или подробно"
          rows={3}
          className={cn(
            'w-full bg-transparent border-[1.5px] border-default rounded-[var(--radius)] px-3 py-2.5',
            'text-body text-primary placeholder:text-placeholder resize-none transition-colors',
            'focus:outline-none focus:border-brand',
          )}
        />
      </div>

      {state === 'error' && (
        <p className="text-caption text-danger" role="alert">
          Не получилось отправить отзыв. Попробуй ещё раз.
        </p>
      )}

      <div>
        <Button
          variant="ghost"
          onClick={handleSubmit}
          disabled={!assessmentId || relevanceScore === null}
          isLoading={state === 'submitting'}
        >
          Отправить отзыв
        </Button>
      </div>
    </Card>
  );
}
