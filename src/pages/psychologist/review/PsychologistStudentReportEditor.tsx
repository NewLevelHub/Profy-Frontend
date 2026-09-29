import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { formatDate as formatLocaleDate } from '@/shared/i18n/format';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_RADIUS, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychologistResultDetail, PsychologistResultPatch } from '@/shared/types';
import { ReviewTextField } from './components/ReviewTextField';
import { ReviewCardsEditor } from './components/ReviewCardsEditor';
import { ReviewCareersEditor } from './components/ReviewCareersEditor';
import { ReviewPersonalityNotesEditor } from './components/ReviewPersonalityNotesEditor';
import { ReviewStringListEditor } from './components/ReviewStringListEditor';

const EDITABLE_KEYS = [
  'summary',
  'careers',
  'strength_cards',
  'personality_notes',
  'thinking_style_notes',
  'motivation_highlights',
  'final_analysis',
] as const;

type EditableKey = (typeof EDITABLE_KEYS)[number];
type Draft = Pick<PsychologistResultDetail, EditableKey>;

const BRAND_BUTTON =
  'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand';

function toDraft(detail: PsychologistResultDetail): Draft {
  return {
    summary: detail.summary,
    careers: detail.careers,
    strength_cards: detail.strength_cards,
    personality_notes: detail.personality_notes,
    thinking_style_notes: detail.thinking_style_notes,
    motivation_highlights: detail.motivation_highlights,
    final_analysis: detail.final_analysis,
  };
}

function buildPatch(detail: PsychologistResultDetail, draft: Draft): PsychologistResultPatch {
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE_KEYS) {
    if (JSON.stringify(draft[key]) !== JSON.stringify(detail[key])) patch[key] = draft[key];
  }
  return patch as PsychologistResultPatch;
}

function validateDraft(draft: Draft, t: TFunction<'psychologist'>): string | null {
  if (!draft.summary.trim()) return t('reportEditor.validate.summaryEmpty');
  if (!draft.final_analysis.trim()) return t('reportEditor.validate.finalEmpty');
  const sections: [string, typeof draft.strength_cards][] = [
    [t('reportEditor.sections.strengths'), draft.strength_cards],
    [t('reportEditor.sections.thinking'), draft.thinking_style_notes],
  ];
  for (const [name, cards] of sections) {
    if (cards.some((card) => !card.title.trim() || !card.description.trim())) {
      return t('reportEditor.validate.cardIncomplete', { section: name });
    }
  }
  if (draft.motivation_highlights.some((item) => !item.trim())) {
    return t('reportEditor.validate.emptyMotivation');
  }
  return null;
}

function formatDate(value: string) {
  return formatLocaleDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function errorMessage(err: unknown, fallback: string, t: TFunction<'psychologist'>): string {
  if (!axios.isAxiosError(err)) return fallback;
  const status = err.response?.status;
  if (status === 409) return t('reportEditor.errors.published');
  if (status === 404) return t('reportEditor.errors.notFound');
  if (status === 422) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    return typeof detail === 'string'
      ? t('reportEditor.errors.rejectedDetail', { detail })
      : t('reportEditor.errors.rejected');
  }
  return fallback;
}

export interface PsychologistStudentReportEditorProps {
  studentId: string;
  assessmentId: string;
  onPublished?: (published: PsychologistResultDetail) => void;
}

export function PsychologistStudentReportEditor({
  studentId,
  assessmentId,
  onPublished,
}: PsychologistStudentReportEditorProps) {
  const { t } = useTranslation('psychologist');
  const [detail, setDetail] = useState<PsychologistResultDetail | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'publish' | 'rebuild' | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [rebuildConfirmOpen, setRebuildConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!studentId || !assessmentId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await psychologistApi.getResultForReview(studentId, assessmentId);
      setDetail(result);
      setDraft(toDraft(result));
    } catch (err) {
      setLoadError(errorMessage(err, t('reportEditor.errors.load'), t));
    } finally {
      setLoading(false);
    }
  }, [studentId, assessmentId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useMemo(() => (detail && draft ? buildPatch(detail, draft) : {}), [detail, draft]);
  const isDirty = Object.keys(patch).length > 0;
  const isPublished = detail?.review_status === 'published';

  useUnsavedGuard(isDirty);

  function update<K extends EditableKey>(key: K, value: Draft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setNotice(null);
  }

  async function handleSave() {
    if (!draft || !isDirty) return;
    const invalid = validateDraft(draft, t);
    if (invalid) {
      setActionError(invalid);
      return;
    }
    setBusy('save');
    setActionError(null);
    try {
      const updated = await psychologistApi.updateResultContent(studentId, assessmentId, patch);
      setDetail(updated);
      setDraft(toDraft(updated));
      setNotice(t('reportEditor.saved'));
    } catch (err) {
      setActionError(errorMessage(err, t('reportEditor.errors.save'), t));
      if (axios.isAxiosError(err) && err.response?.status === 409) void load();
    } finally {
      setBusy(null);
    }
  }

  function requestPublish() {
    if (isDirty || busy !== null) return;
    setPublishConfirmOpen(true);
  }

  async function handlePublishConfirm() {
    setBusy('publish');
    setActionError(null);
    try {
      const published = await psychologistApi.publishResult(studentId, assessmentId);
      setDetail(published);
      setDraft(toDraft(published));
      setNotice(t('reportEditor.publishedNotice'));
      setPublishConfirmOpen(false);
      onPublished?.(published);
    } catch (err) {
      setActionError(errorMessage(err, t('reportEditor.errors.publish'), t));
      if (axios.isAxiosError(err) && err.response?.status === 409) void load();
      setPublishConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  }

  function requestStrengthsRebuild() {
    if (isDirty || busy !== null) return;
    setRebuildConfirmOpen(true);
  }

  async function handleStrengthsRebuildConfirm() {
    setBusy('rebuild');
    setActionError(null);
    try {
      const rebuilt = await psychologistApi.rebuildStrengths(studentId, assessmentId);
      setDetail(rebuilt);
      setDraft(toDraft(rebuilt));
      setNotice(t('reportEditor.strengths.rebuiltNotice'));
      setRebuildConfirmOpen(false);
    } catch (err) {
      setActionError(errorMessage(err, t('reportEditor.strengths.error'), t));
      if (axios.isAxiosError(err) && err.response?.status === 409) void load();
      setRebuildConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <AdminLoading />;
  }

  if (loadError || !detail || !draft) {
    return <AdminError message={loadError ?? t('reportEditor.errors.load')} onRetry={() => void load()} />;
  }

  const locked = isPublished || busy !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[14px] bg-[color-mix(in_srgb,var(--paper)_75%,transparent)] border border-default">
        <div className="flex flex-wrap items-center gap-2.5">
          <AdminBadge tone={isPublished ? 'brand' : 'accent'}>
            {isPublished ? t('reportEditor.status.published') : t('reportEditor.status.pending')}
          </AdminBadge>
          <span className={cn(ADMIN_NUM, 'text-muted')}>
            {t('reportEditor.status.generated', { date: formatDate(detail.created_at) })}
          </span>
          {detail.reviewed_at && (
            <span className={cn(ADMIN_NUM, 'text-muted')}>
              {t('reportEditor.status.reviewed', { date: formatDate(detail.reviewed_at) })}
            </span>
          )}
          {detail.published_at && (
            <span className={cn(ADMIN_NUM, 'text-muted')}>
              {t('reportEditor.status.publishedAt', { date: formatDate(detail.published_at) })}
            </span>
          )}
        </div>

        <p className={cn(ADMIN_META, 'm-0')}>
          {isPublished
            ? t('reportEditor.status.publishedHint')
            : t('reportEditor.status.pendingHint')}
        </p>
      </div>

      <AdminCard title={t('reportEditor.sections.summary')} description={t('reportEditor.sections.summaryHint')}>
        <ReviewTextField
          value={draft.summary}
          onChange={(value) => update('summary', value)}
          disabled={locked}
          rows={5}
        />
      </AdminCard>

      <AdminCard
        title={t('reportEditor.sections.careers')}
        description={t('reportEditor.sections.careersHint')}
        aside={
          <div className="flex flex-wrap gap-1.5 justify-end">
            {detail.strengths.map((code) => (
              <AdminBadge key={`s-${code}`} tone="brand" title={t('reportEditor.sections.strongSphere')}>
                {code}
              </AdminBadge>
            ))}
            {detail.weaknesses.map((code) => (
              <AdminBadge key={`w-${code}`} tone="quiet" title={t('reportEditor.sections.weakSphere')}>
                {code}
              </AdminBadge>
            ))}
          </div>
        }
      >
        <ReviewCareersEditor
          careers={draft.careers}
          onChange={(value) => update('careers', value)}
          disabled={locked}
        />
      </AdminCard>

      {detail.strengths_stale && (
        <div className="rounded-[14px] border border-accent/30 bg-accent-subtle p-4">
          <p className={cn(ADMIN_TEXT, 'm-0 font-semibold')}>{t('reportEditor.strengths.staleTitle')}</p>
          <p className={cn(ADMIN_META, 'mt-1 mb-0')}>{t('reportEditor.strengths.staleBody')}</p>
          <button
            type="button"
            className={cn(ADMIN_BUTTON, 'mt-3')}
            disabled={isDirty || busy !== null}
            title={isDirty ? t('reportEditor.strengths.saveFirst') : undefined}
            onClick={requestStrengthsRebuild}
          >
            {busy === 'rebuild'
              ? t('reportEditor.strengths.rebuilding')
              : t('reportEditor.strengths.rebuild')}
          </button>
        </div>
      )}

      <AdminCard title={t('reportEditor.sections.strengths')} description={t('reportEditor.sections.strengthsHint')}>
        <ReviewCardsEditor
          cards={draft.strength_cards}
          onChange={(value) => update('strength_cards', value)}
          disabled={locked}
          addLabel={t('reportEditor.sections.addStrength')}
          itemName={t('reportEditor.sections.strengthItem')}
          withStrengthBasis
        />
      </AdminCard>

      <AdminCard
        title={t('reportEditor.sections.character')}
        description={t('reportEditor.sections.characterHint')}
      >
        <ReviewPersonalityNotesEditor
          notes={draft.personality_notes}
          onChange={(value) => update('personality_notes', value)}
          disabled={locked}
        />
      </AdminCard>

      <AdminCard title={t('reportEditor.sections.thinking')} description={t('reportEditor.sections.thinkingHint')}>
        <ReviewCardsEditor
          cards={draft.thinking_style_notes}
          onChange={(value) => update('thinking_style_notes', value)}
          disabled={locked}
          addLabel={t('reportEditor.sections.addNote')}
          itemName={t('reportEditor.sections.thinkingItem')}
        />
      </AdminCard>

      <AdminCard title={t('reportEditor.sections.drivers')} description={t('reportEditor.sections.driversHint')}>
        <ReviewStringListEditor
          items={draft.motivation_highlights}
          onChange={(value) => update('motivation_highlights', value)}
          disabled={locked}
          addLabel={t('reportEditor.sections.addItem')}
        />
      </AdminCard>

      <AdminCard title={t('reportEditor.sections.final')} description={t('reportEditor.sections.finalHint')}>
        <ReviewTextField
          value={draft.final_analysis}
          onChange={(value) => update('final_analysis', value)}
          disabled={locked}
          rows={5}
        />
      </AdminCard>

      {!isPublished && (
        <div
          className={cn(
            'sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 border border-default bg-surface p-4 shadow-xl backdrop-blur-md',
            ADMIN_RADIUS,
          )}
        >
          <div className="min-w-0" aria-live="polite">
            {actionError ? (
              <p className={cn(ADMIN_TEXT, 'text-danger font-medium m-0')} role="alert">
                {actionError}
              </p>
            ) : notice ? (
              <p className={cn(ADMIN_TEXT, 'text-brand font-medium m-0')}>{notice}</p>
            ) : (
              <p className={cn(ADMIN_META, 'm-0')}>
                {isDirty ? t('reportEditor.bar.unsaved') : t('reportEditor.bar.allSaved')}
              </p>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              className={ADMIN_BUTTON}
              disabled={!isDirty || busy !== null}
              onClick={() => void handleSave()}
            >
              {busy === 'save' ? t('reportEditor.bar.saving') : t('reportEditor.bar.saveDraft')}
            </button>
            <button
              type="button"
              className={cn(ADMIN_BUTTON, BRAND_BUTTON, 'shadow-sm font-semibold')}
              disabled={isDirty || busy !== null}
              title={isDirty ? t('reportEditor.bar.saveFirst') : undefined}
              onClick={requestPublish}
            >
              {busy === 'publish' ? t('reportEditor.bar.publishing') : t('reportEditor.bar.publish')}
            </button>
          </div>
        </div>
      )}

      {isPublished && notice && (
        <div className="p-3 rounded-[10px] bg-brand-subtle text-brand border border-brand/20">
          <p className={cn(ADMIN_TEXT, 'font-medium m-0')}>{notice}</p>
        </div>
      )}

      <ConfirmDialog
        open={publishConfirmOpen}
        title={t('reportEditor.publishConfirm.title')}
        body={t('reportEditor.publishConfirm.body')}
        confirmLabel={t('reportEditor.publishConfirm.confirm')}
        cancelLabel={t('reportEditor.publishConfirm.cancel')}
        confirming={busy === 'publish'}
        onConfirm={() => void handlePublishConfirm()}
        onCancel={() => {
          if (busy !== 'publish') setPublishConfirmOpen(false);
        }}
      />

      <ConfirmDialog
        open={rebuildConfirmOpen}
        title={t('reportEditor.strengths.confirm.title')}
        body={t('reportEditor.strengths.confirm.body')}
        confirmLabel={t('reportEditor.strengths.confirm.confirm')}
        cancelLabel={t('reportEditor.strengths.confirm.cancel')}
        confirming={busy === 'rebuild'}
        onConfirm={() => void handleStrengthsRebuildConfirm()}
        onCancel={() => {
          if (busy !== 'rebuild') setRebuildConfirmOpen(false);
        }}
      />
    </div>
  );
}
