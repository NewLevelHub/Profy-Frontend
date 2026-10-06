import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import type { PsychologistResultDetail, PsychologistResultPatch } from '@/shared/types';
import { EDITABLE_KEYS, EMPTY_DRAFT, dirtyKeys, reportDraftReducer, toDraft, type EditableKey, type ReviewDraft } from './reportReviewDraft';

export type { EditableKey, ReviewDraft } from './reportReviewDraft';

function validateDraft(t: TFunction, draft: ReviewDraft): string | null {
  if (!draft.summary.trim()) return t('psychologist:review.validation.summaryEmpty');
  if (!draft.final_analysis.trim()) return t('psychologist:review.validation.finalEmpty');
  if (draft.strength_cards.some((card) => !card.title.trim() || !card.description.trim())) {
    return t('psychologist:review.validation.cardEmpty', { section: t('psychologist:review.blocks.strengths.title') });
  }
  if (draft.motivation_highlights.some((item) => !item.trim())) {
    return t('psychologist:review.validation.motivationEmpty');
  }
  if (draft.top_career_why !== null && !draft.top_career_why.trim()) {
    return t('psychologist:review.validation.topCareerWhyEmpty');
  }
  return null;
}

function validatePublication(t: TFunction, draft: ReviewDraft): string | null {
  const invalidDraft = validateDraft(t, draft);
  if (invalidDraft) return invalidDraft;
  if (draft.careers.length === 0) return t('psychologist:review.validation.careersRequired');
  if (draft.strength_cards.length === 0) return t('psychologist:review.validation.strengthCardsRequired');
  if (draft.motivation_highlights.length === 0) return t('psychologist:review.validation.motivationRequired');
  return null;
}

function errorMessage(t: TFunction, err: unknown, fallbackKey: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 409) return t('psychologist:review.errors.published');
    if (status === 404) return t('psychologist:review.errors.notFound');
    if (status === 422) return t('psychologist:review.errors.rejected');
  }
  return t(fallbackKey);
}

/**
 * All state of one report under review: the stored result, the local draft,
 * which blocks the psychologist changed (saved history + unsaved draft), and
 * save / publish. Lives above both report tabs because the bottom bar and the
 * publish dialog are shared by them.
 */
export function useReportReview(studentId: string, assessmentId: string) {
  const { t } = useTranslation('psychologist');
  const queryClient = useQueryClient();
  const enabled = !!studentId && !!assessmentId;
  const reportId = `${studentId}/${assessmentId}`;
  const resultKey = psychologistKeys.result(studentId, assessmentId);
  const writing = useRef(false);

  const result = useQuery({
    queryKey: resultKey,
    queryFn: () => psychologistApi.getResultForReview(studentId, assessmentId),
    enabled,
    retry: false,
  });
  const edits = useQuery({
    queryKey: psychologistKeys.resultEdits(studentId, assessmentId),
    queryFn: () => psychologistApi.listResultEdits(studentId, assessmentId),
    enabled,
    retry: false,
  });

  const detail = result.data ?? null;
  const [draftState, dispatch] = useReducer(reportDraftReducer, EMPTY_DRAFT);
  const draft = draftState.reportId === reportId ? draftState.draft : null;
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (detail) dispatch({ type: 'receive', reportId, draft: toDraft(detail), published: detail.review_status === 'published' });
  }, [detail, reportId]);

  useEffect(() => setActionError(null), [reportId]);

  const dirty = useMemo(() => (detail && draft ? dirtyKeys(detail, draft) : []), [detail, draft]);
  const isDirty = dirty.length > 0;
  const isPublished = detail?.review_status === 'published';

  const savedEdited = useMemo(() => {
    const keys = new Set<string>();
    for (const edit of edits.data ?? []) {
      // The AI pick moved to the top is the system's default, not a correction.
      if (edit.source === 'ai_recommendation') continue;
      for (const field of Object.keys(edit.changed_fields)) keys.add(field);
    }
    return keys;
  }, [edits.data]);

  /** Blocks that will not reach the student the way the system wrote them. */
  const editedKeys = useMemo(
    () => new Set<EditableKey>(EDITABLE_KEYS.filter((key) => savedEdited.has(key) || dirty.includes(key))),
    [savedEdited, dirty],
  );

  useUnsavedGuard(isDirty);

  function afterWrite(updated: PsychologistResultDetail, submitted: ReviewDraft) {
    dispatch({ type: 'saved', reportId, submitted, draft: toDraft(updated) });
    queryClient.setQueryData(resultKey, updated);
    void queryClient.invalidateQueries({ queryKey: psychologistKeys.resultEdits(studentId, assessmentId) });
    void queryClient.invalidateQueries({ queryKey: psychologistKeys.reviews() });
    void queryClient.invalidateQueries({ queryKey: psychologistKeys.students() });
    void queryClient.invalidateQueries({ queryKey: psychologistKeys.student(studentId) });
  }

  function buildPatch(): PsychologistResultPatch | null {
    if (!detail || !draft) return null;
    const patch: Record<string, unknown> = {};
    for (const key of dirty) patch[key] = draft[key];
    return patch as PsychologistResultPatch;
  }

  const save = useMutation({
    mutationFn: async ({ patch }: { patch: PsychologistResultPatch; submitted: ReviewDraft }) => {
      await queryClient.cancelQueries({ queryKey: resultKey, exact: true });
      return psychologistApi.updateResultContent(studentId, assessmentId, patch);
    },
    onSuccess: (updated, { submitted }) => afterWrite(updated, submitted),
  });

  const publish = useMutation({
    mutationFn: async (submitted: ReviewDraft) => {
      await queryClient.cancelQueries({ queryKey: resultKey, exact: true });
      // Unsaved edits go out with the publication, not get lost behind it.
      const patch = buildPatch();
      if (patch && Object.keys(patch).length > 0) {
        afterWrite(await psychologistApi.updateResultContent(studentId, assessmentId, patch), submitted);
      }
      return psychologistApi.publishResult(studentId, assessmentId);
    },
    onSuccess: (updated, submitted) => afterWrite(updated, submitted),
  });

  // PRO-432: cards built under an older strength rules version are flagged
  // stale; rebuilding replaces them under the current rules.
  const rebuild = useMutation({
    mutationFn: async (_submitted: ReviewDraft) => {
      await queryClient.cancelQueries({ queryKey: resultKey, exact: true });
      return psychologistApi.rebuildStrengths(studentId, assessmentId);
    },
    onSuccess: (updated, submitted) => afterWrite(updated, submitted),
  });

  function reportConflict(err: unknown, fallbackKey: string) {
    setActionError(errorMessage(t, err, fallbackKey));
    if (axios.isAxiosError(err) && err.response?.status === 409) void result.refetch();
  }

  /** Returns false when the draft is invalid (the message is in `actionError`). */
  function validate(): boolean {
    if (!draft) return false;
    const invalid = validatePublication(t, draft);
    setActionError(invalid);
    return invalid === null;
  }

  async function saveDraft(): Promise<void> {
    const patch = buildPatch();
    if (writing.current || !patch || !draft || !isDirty || isPublished) return;
    const invalid = validateDraft(t, draft);
    setActionError(invalid);
    if (invalid) return;
    writing.current = true;
    try {
      await save.mutateAsync({ patch, submitted: draft });
    } catch (err) {
      reportConflict(err, 'psychologist:review.errors.save');
    } finally {
      writing.current = false;
    }
  }

  async function publishReport(): Promise<boolean> {
    if (writing.current || !draft || isPublished || !validate()) return false;
    writing.current = true;
    try {
      await publish.mutateAsync(draft);
      return true;
    } catch (err) {
      reportConflict(err, 'psychologist:review.errors.publish');
      return false;
    } finally {
      writing.current = false;
    }
  }

  /** Only from a saved state — the rebuild would overwrite unsaved edits. */
  async function rebuildStrengths(): Promise<boolean> {
    if (writing.current || !draft || isDirty || isPublished) return false;
    writing.current = true;
    try {
      await rebuild.mutateAsync(draft);
      return true;
    } catch (err) {
      reportConflict(err, 'psychologist:review.strengthsRebuild.error');
      return false;
    } finally {
      writing.current = false;
    }
  }

  function update<K extends EditableKey>(key: K, value: ReviewDraft[K]) {
    dispatch({ type: 'change', reportId, patch: { [key]: value } });
    setActionError(null);
  }

  return {
    detail,
    draft,
    isLoading: result.isLoading,
    loadError: result.isError ? errorMessage(t, result.error, 'psychologist:review.errors.load') : null,
    reload: () => void result.refetch(),
    edits: edits.data ?? [],
    editsLoading: edits.isLoading,
    editsError: edits.isError,
    reloadEdits: () => void edits.refetch(),
    editedKeys,
    isDirty,
    isPublished,
    saving: save.isPending,
    publishing: publish.isPending,
    rebuilding: rebuild.isPending,
    actionError,
    update,
    saveDraft,
    publishReport,
    rebuildStrengths,
    validate,
  };
}

export type ReportReview = ReturnType<typeof useReportReview>;
