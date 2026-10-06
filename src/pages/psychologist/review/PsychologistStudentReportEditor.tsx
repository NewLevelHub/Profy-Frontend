import { useState } from 'react';
import { History, LockKeyhole, PencilLine } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Mono, Text } from '@/shared/ui/typography';
import type { ReportReview } from '../hooks/useReportReview';
import { ReviewBlock } from './components/ReviewBlock';
import { ReviewCardsEditor } from './components/ReviewCardsEditor';
import { ReviewCareersEditor } from './components/ReviewCareersEditor';
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
  const [rebuildOpen, setRebuildOpen] = useState(false);
  if (!detail || !draft) return null;

  const locked = review.isPublished || review.publishing;
  const edited = (key: Parameters<typeof editedKeys.has>[0]) => editedKeys.has(key);
  // The AI's text belongs to its pick and reaches the student only while that career is first.
  const topCareer = draft.careers[0];
  const showTopCareerWhy =
    draft.top_career_why !== null && !!topCareer && topCareer.slug === detail.top_career_why_slug;

  return (
    <div className="rd-psych-report-editor">
      <div className="rd-review-intro">
        <div className="rd-psych-report-notice">
          {review.isPublished ? <LockKeyhole size={19} aria-hidden="true" /> : <PencilLine size={19} aria-hidden="true" />}
          <Text variant="body-sm">{review.isPublished ? t('review.introPublished') : t('review.intro')}</Text>
        </div>
        <Link to={historyPath} className="rd-psych-report-history-link">
          <History size={17} aria-hidden="true" />
          {review.editsLoading || review.editsError
            ? t('history.title')
            : t('review.historyLink', { count: review.edits.length })}
        </Link>
      </div>
      <nav className="rd-review-contents" aria-label={t('review.contents')}>
        {(['summary', 'careers', 'strengths', 'motivation', 'final'] as const).map((block, index) => (
          <button key={block} type="button" onClick={() => {
            const section = document.getElementById(`review-block-${index + 1}`);
            section?.focus({ preventScroll: true });
            section?.scrollIntoView({ block: 'start' });
          }}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {t(`review.blocks.${block}.title`)}
          </button>
        ))}
      </nav>

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
        edited={edited('careers') || edited('top_career_why')}
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
          aiRecommendedSlug={detail.ai_recommended_slug}
        />
        {showTopCareerWhy && (
          <div className="mt-5 flex flex-col gap-2">
            <Text as="span" variant="caption" className="text-muted">
              {t('review.blocks.careers.topWhyLabel', { name: topCareer.name })}
            </Text>
            <ReviewTextField
              label={t('review.blocks.careers.topWhyLabel', { name: topCareer.name })}
              value={draft.top_career_why ?? ''}
              onChange={(value) => update('top_career_why', value)}
              disabled={locked}
              rows={4}
            />
          </div>
        )}
      </ReviewBlock>

      <ReviewBlock
        number={3}
        title={t('review.blocks.strengths.title')}
        hint={review.isPublished ? undefined : t('review.blocks.strengths.hint')}
        edited={edited('strength_cards')}
      >
        {detail.strengths_stale && !review.isPublished && (
          <div
            role="status"
            className="rd-review-rebuild mb-5 rounded-[8px] border border-default border-l-[3px] px-4 py-3"
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

      <ReviewBlock number={4} title={t('review.blocks.motivation.title')} edited={edited('motivation_highlights')}>
        <ReviewStringListEditor
          items={draft.motivation_highlights}
          onChange={(value) => update('motivation_highlights', value)}
          disabled={locked}
          addLabel={t('review.blocks.motivation.add')}
        />
      </ReviewBlock>

      <ReviewBlock number={5} title={t('review.blocks.final.title')} edited={edited('final_analysis')}>
        <ReviewTextField
          label={t('review.blocks.final.title')}
          value={draft.final_analysis}
          onChange={(value) => update('final_analysis', value)}
          disabled={locked}
          rows={4}
        />
      </ReviewBlock>

      <ConfirmDialog
        className="rd-psych-report-dialog"
        portalTarget={document.getElementById('psychologist-overlays')}
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
