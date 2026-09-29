import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mono, Text } from '@/shared/ui/typography';
import type { ReportReview } from '../hooks/useReportReview';
import { ReviewBlock } from './components/ReviewBlock';
import { ReviewCardsEditor } from './components/ReviewCardsEditor';
import { ReviewCareersEditor } from './components/ReviewCareersEditor';
import { ReviewPersonalityNotesEditor } from './components/ReviewPersonalityNotesEditor';
import { ReviewStringListEditor } from './components/ReviewStringListEditor';
import { ReviewTextField } from './components/ReviewTextField';

interface PsychologistStudentReportEditorProps {
  review: ReportReview;
  historyPath: string;
}

/**
 * "Отчёт для ученика" — exactly what the student will read, block by block,
 * in their order. State (draft, save, publish) lives in `useReportReview`,
 * one level up, because the bottom bar and the publish dialog serve both tabs.
 */
export function PsychologistStudentReportEditor({ review, historyPath }: PsychologistStudentReportEditorProps) {
  const { t } = useTranslation('psychologist');
  const { detail, draft, editedKeys, update } = review;
  if (!detail || !draft) return null;

  const locked = review.isPublished || review.publishing;
  const edited = (key: Parameters<typeof editedKeys.has>[0]) => editedKeys.has(key);

  return (
    <div className="flex flex-col gap-3">
      <Text variant="body-sm" className="text-muted mt-0 mb-3 max-w-[72ch]">
        {review.isPublished ? t('review.introPublished') : t('review.intro')}
      </Text>

      <ReviewBlock number={1} title={t('review.blocks.summary.title')} edited={edited('summary')}>
        <ReviewTextField
          label={t('review.blocks.summary.title')}
          value={draft.summary}
          onChange={(value) => update('summary', value)}
          disabled={locked}
          rows={5}
        />
      </ReviewBlock>

      <ReviewBlock
        number={2}
        title={t('review.blocks.careers.title')}
        hint={review.isPublished ? undefined : t('review.blocks.careers.hint')}
        edited={edited('careers')}
        aside={
          detail.strengths.length > 0 && (
            <span className="flex gap-1.5" title={t('review.blocks.careers.codesTitle')}>
              {detail.strengths.map((code) => (
                <Mono key={code} variant="sm" className="text-[color:var(--lake)]">
                  {code}
                </Mono>
              ))}
            </span>
          )
        }
      >
        <ReviewCareersEditor
          careers={draft.careers}
          onChange={(value) => update('careers', value)}
          disabled={locked}
        />
      </ReviewBlock>

      <ReviewBlock number={3} title={t('review.blocks.strengths.title')} edited={edited('strength_cards')}>
        <ReviewCardsEditor
          cards={draft.strength_cards}
          onChange={(value) => update('strength_cards', value)}
          disabled={locked}
          addLabel={t('review.blocks.strengths.add')}
          section={t('review.blocks.strengths.title')}
        />
      </ReviewBlock>

      <ReviewBlock
        number={4}
        title={t('review.blocks.traits.title')}
        hint={t('review.blocks.traits.hint')}
        edited={edited('personality_notes')}
      >
        <ReviewPersonalityNotesEditor
          notes={draft.personality_notes}
          bigFive={detail.big_five}
          onChange={(value) => update('personality_notes', value)}
          disabled={locked}
        />
      </ReviewBlock>

      <ReviewBlock number={5} title={t('review.blocks.thinking.title')} edited={edited('thinking_style_notes')}>
        <ReviewCardsEditor
          cards={draft.thinking_style_notes}
          onChange={(value) => update('thinking_style_notes', value)}
          disabled={locked}
          addLabel={t('review.blocks.thinking.add')}
          section={t('review.blocks.thinking.title')}
        />
      </ReviewBlock>

      <ReviewBlock number={6} title={t('review.blocks.motivation.title')} edited={edited('motivation_highlights')}>
        <ReviewStringListEditor
          items={draft.motivation_highlights}
          onChange={(value) => update('motivation_highlights', value)}
          disabled={locked}
          addLabel={t('review.blocks.motivation.add')}
        />
      </ReviewBlock>

      <ReviewBlock number={7} title={t('review.blocks.final.title')} edited={edited('final_analysis')}>
        <ReviewTextField
          label={t('review.blocks.final.title')}
          value={draft.final_analysis}
          onChange={(value) => update('final_analysis', value)}
          disabled={locked}
          rows={4}
        />
      </ReviewBlock>

      <Link
        to={historyPath}
        className="self-start mt-2 py-2 font-sans text-body-sm text-brand underline underline-offset-4 hover:opacity-70"
      >
        {review.editsLoading || review.editsError
          ? t('history.title')
          : t('review.historyLink', { count: review.edits.length })}
      </Link>
    </div>
  );
}
