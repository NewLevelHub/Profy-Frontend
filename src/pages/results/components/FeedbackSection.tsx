import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';
import { feedbackApi, REPORT_SECTIONS } from '@/shared/api/feedback';

interface FeedbackSectionProps {
  assessmentId: string | null;
}

const RELEVANCE_SCALE = [1, 2, 3, 4, 5];
const COMMENT_MAX_LENGTH = 2000;

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';

/**
 * Quiet, optional feedback block — renders after the goal-dependent section,
 * still part of /results. Explicitly does not promise a personal reply.
 */
export function FeedbackSection({ assessmentId }: FeedbackSectionProps) {
  const { t } = useTranslation('results');
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
      <section className="panel-glass flex flex-col gap-2 !p-6 sm:!p-7">
        <span className="journey-kicker" style={{ color: 'var(--pine)' }}>
          {t('feedback.sentKicker')}
        </span>
        <Text variant="body-md" className="text-secondary leading-relaxed">
          {t('feedback.sentBody')}
        </Text>
      </section>
    );
  }

  return (
    <section className="panel-glass flex flex-col gap-6 !p-6 sm:!p-7">
      <div className="flex flex-col gap-2">
        <span className="journey-kicker">{t('feedback.kicker')}</span>
        <Heading level="display-sm" as="h2" className="text-[color:var(--text-heading)] m-0">
          {t('feedback.heading')}
        </Heading>
        <Text variant="body-sm" className="text-secondary max-w-[52ch]">
          {t('feedback.subheading')}
        </Text>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">
          {t('feedback.relevanceQuestion')}
        </p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('feedback.relevanceAria')}>
          {RELEVANCE_SCALE.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={relevanceScore === value}
              onClick={() => setRelevanceScore(value)}
              className={cn(
                'w-11 h-11 rounded-[12px] text-body-sm font-bold border transition-colors cursor-pointer press-scale',
                relevanceScore === value
                  ? 'bg-brand text-on-brand border-transparent'
                  : 'field-tile text-secondary hover:border-[color:var(--pine)] hover:text-[color:var(--pine)]',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">
          {t('feedback.usefulQuestion')}
        </p>
        <div className="flex flex-wrap gap-2">
          {REPORT_SECTIONS.map((section) => (
            <button
              key={section.value}
              type="button"
              onClick={() => toggleSection(section.value)}
              aria-pressed={sections.has(section.value)}
              className={cn(
                'px-3.5 py-2 rounded-pill text-caption font-semibold border transition-colors cursor-pointer press-scale',
                sections.has(section.value)
                  ? 'bg-brand text-on-brand border-transparent'
                  : 'bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] text-secondary border-[color:color-mix(in_srgb,#fff_45%,var(--border))] hover:border-[color:var(--pine)] hover:text-[color:var(--pine)]',
              )}
            >
              {t(section.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">
          {t('feedback.commentQuestion')}{' '}
          <span className="font-normal text-muted">{t('feedback.commentOptional')}</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('feedback.commentPlaceholder')}
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          className={cn(
            'w-full field-tile !rounded-[14px] px-3.5 py-3',
            'text-body text-primary placeholder:text-placeholder resize-none transition-colors',
            'focus:outline-none focus:border-[color:var(--pine)]',
          )}
        />
        {comment.length > COMMENT_MAX_LENGTH * 0.9 && (
          <p className="text-caption text-muted self-end m-0">
            {comment.length} / {COMMENT_MAX_LENGTH}
          </p>
        )}
      </div>

      {state === 'error' && (
        <p className="text-caption text-danger m-0" role="alert">
          {t('error.feedbackSubmit')}
        </p>
      )}

      <div className="flex justify-end pt-1 border-t border-default">
        <Button
          onClick={handleSubmit}
          disabled={!assessmentId || relevanceScore === null}
          isLoading={state === 'submitting'}
          className="rounded-pill"
        >
          {t('feedback.submit')}
        </Button>
      </div>
    </section>
  );
}
