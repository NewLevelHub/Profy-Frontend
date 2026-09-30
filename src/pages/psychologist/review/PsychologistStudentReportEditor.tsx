import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Mono, Text } from '@/shared/ui/typography';
import type { EditableKey, ReportReview } from '../hooks/useReportReview';
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
  const { detail, draft, editedKeys, visibleBlocks, update } = review;
  const [rebuildOpen, setRebuildOpen] = useState(false);
  if (!detail || !draft) return null;

  const locked = review.isPublished || review.publishing;
  const edited = (key: EditableKey) => editedKeys.has(key);
  const shown = (key: EditableKey) => visibleBlocks.includes(key);
  // Numbered by position among the shown blocks — no gap where a block is hidden.
  const numberOf = (key: EditableKey) => visibleBlocks.indexOf(key) + 1;

  return (
    <div className="flex flex-col gap-3">
      <Text variant="body-sm" className="text-muted mt-0 mb-3 max-w-[72ch]">
        {review.isPublished ? t('review.introPublished') : t('review.intro')}
      </Text>

      <ReviewBlock number={numberOf('summary')} title={t('review.blocks.summary.title')} edited={edited('summary')}>
        <ReviewTextField
          label={t('review.blocks.summary.title')}
          value={draft.summary}
          onChange={(value) => update('summary', value)}
          disabled={locked}
          rows={5}
        />
      </ReviewBlock>

      <ReviewBlock
        number={numberOf('careers')}
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

      <ReviewBlock
        number={numberOf('strength_cards')}
        title={t('review.blocks.strengths.title')}
        hint={review.isPublished ? undefined : t('review.blocks.strengths.hint')}
        edited={edited('strength_cards')}
      >
        {detail.strengths_stale && !review.isPublished && (
          <div
            role="status"
            className="mb-5 rounded-[8px] border border-default border-l-[3px] px-4 py-3"
            style={{ borderLeftColor: 'var(--dawn)' }}
          >
            <Text variant="body-sm" className="font-semibold text-heading m-0">
              {t('review.strengthsRebuild.staleTitle')}
            </Text>
            <Text variant="body-sm" className="text-muted mt-1 mb-0 max-w-[72ch]">
              {t('review.strengthsRebuild.staleBody')}
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              disabled={review.isDirty || review.rebuilding || review.saving}
              title={review.isDirty ? t('review.strengthsRebuild.saveFirst') : undefined}
              onClick={() => setRebuildOpen(true)}
            >
              {review.rebuilding ? t('review.strengthsRebuild.rebuilding') : t('review.strengthsRebuild.rebuild')}
            </Button>
          </div>
        )}
        <ReviewCardsEditor
          cards={draft.strength_cards}
          onChange={(value) => update('strength_cards', value)}
          disabled={locked}
          addLabel={t('review.blocks.strengths.add')}
          section={t('review.blocks.strengths.title')}
          withStrengthBasis
        />
      </ReviewBlock>

      {shown('personality_notes') && (
        <ReviewBlock
          number={numberOf('personality_notes')}
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
      )}

      {shown('thinking_style_notes') && (
        <ReviewBlock
          number={numberOf('thinking_style_notes')}
          title={t('review.blocks.thinking.title')}
          edited={edited('thinking_style_notes')}
        >
          <ReviewCardsEditor
            cards={draft.thinking_style_notes}
            onChange={(value) => update('thinking_style_notes', value)}
            disabled={locked}
            addLabel={t('review.blocks.thinking.add')}
            section={t('review.blocks.thinking.title')}
          />
        </ReviewBlock>
      )}

      <ReviewBlock
        number={numberOf('motivation_highlights')}
        title={t('review.blocks.motivation.title')}
        edited={edited('motivation_highlights')}
      >
        <ReviewStringListEditor
          items={draft.motivation_highlights}
          onChange={(value) => update('motivation_highlights', value)}
          disabled={locked}
          addLabel={t('review.blocks.motivation.add')}
        />
      </ReviewBlock>

      <ReviewBlock
        number={numberOf('final_analysis')}
        title={t('review.blocks.final.title')}
        edited={edited('final_analysis')}
      >
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

      <ConfirmDialog
        open={rebuildOpen}
        title={t('review.strengthsRebuild.confirm.title')}
        body={t('review.strengthsRebuild.confirm.body')}
        confirmLabel={t('review.strengthsRebuild.confirm.confirm')}
        cancelLabel={t('review.strengthsRebuild.confirm.cancel')}
        confirming={review.rebuilding}
        onConfirm={() => {
          void review.rebuildStrengths().finally(() => setRebuildOpen(false));
        }}
        onCancel={() => {
          if (!review.rebuilding) setRebuildOpen(false);
        }}
      />
    </div>
  );
}
