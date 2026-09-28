import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import type { PsychologistResultDetail, PsychologistResultPatch } from '@/shared/types';

/** Report fields the psychologist edits, in the order the student reads them. */
const EDITABLE_KEYS = [
  'summary',
  'careers',
  'strength_cards',
  'personality_notes',
  'thinking_style_notes',
  'motivation_highlights',
  'final_analysis',
] as const;

export type EditableKey = (typeof EDITABLE_KEYS)[number];
export type ReviewDraft = Pick<PsychologistResultDetail, EditableKey>;

function toDraft(detail: PsychologistResultDetail): ReviewDraft {
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

function dirtyKeys(detail: PsychologistResultDetail, draft: ReviewDraft): EditableKey[] {
  return EDITABLE_KEYS.filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(detail[key]));
}

function validateDraft(t: TFunction, draft: ReviewDraft): string | null {
  if (!draft.summary.trim()) return t('psychologist:review.validation.summaryEmpty');
  if (!draft.final_analysis.trim()) return t('psychologist:review.validation.finalEmpty');
  const cardSections: [string, ReviewDraft['strength_cards']][] = [
    [t('psychologist:review.blocks.strengths.title'), draft.strength_cards],
    [t('psychologist:review.blocks.thinking.title'), draft.thinking_style_notes],
  ];
  for (const [section, cards] of cardSections) {
    if (cards.some((card) => !card.title.trim() || !card.description.trim())) {
      return t('psychologist:review.validation.cardEmpty', { section });
    }
  }
  if (draft.motivation_highlights.some((item) => !item.trim())) {
    return t('psychologist:review.validation.motivationEmpty');
  }
  if (Object.values(draft.personality_notes).some((text) => !text.trim())) {
    return t('psychologist:review.validation.traitEmpty');
  }
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
  const resultKey = psychologistKeys.result(studentId, assessmentId);

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
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // A fresh server copy (first load, after save) resets the draft to it.
  useEffect(() => {
    if (detail) setDraft(toDraft(detail));
  }, [detail]);

  const dirty = useMemo(() => (detail && draft ? dirtyKeys(detail, draft) : []), [detail, draft]);
  const isDirty = dirty.length > 0;
  const isPublished = detail?.review_status === 'published';

  const savedEdited = useMemo(() => {
    const keys = new Set<string>();
    for (const edit of edits.data ?? []) for (const field of Object.keys(edit.changed_fields)) keys.add(field);
    return keys;
  }, [edits.data]);

  /** Blocks that will not reach the student the way the system wrote them. */
  const editedKeys = useMemo(
    () => new Set<EditableKey>(EDITABLE_KEYS.filter((key) => savedEdited.has(key) || dirty.includes(key))),
    [savedEdited, dirty],
  );

  useUnsavedGuard(isDirty);

  function afterWrite(updated: PsychologistResultDetail) {
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
    mutationFn: (patch: PsychologistResultPatch) =>
      psychologistApi.updateResultContent(studentId, assessmentId, patch),
    onSuccess: afterWrite,
  });

  const publish = useMutation({
    mutationFn: async () => {
      // Unsaved edits go out with the publication, not get lost behind it.
      const patch = buildPatch();
      if (patch && Object.keys(patch).length > 0) {
        afterWrite(await psychologistApi.updateResultContent(studentId, assessmentId, patch));
      }
      return psychologistApi.publishResult(studentId, assessmentId);
    },
    onSuccess: afterWrite,
  });

  function reportConflict(err: unknown, fallbackKey: string) {
    setActionError(errorMessage(t, err, fallbackKey));
    if (axios.isAxiosError(err) && err.response?.status === 409) void result.refetch();
  }

  /** Returns false when the draft is invalid (the message is in `actionError`). */
  function validate(): boolean {
    if (!draft) return false;
    const invalid = validateDraft(t, draft);
    setActionError(invalid);
    return invalid === null;
  }

  async function saveDraft(): Promise<void> {
    const patch = buildPatch();
    if (!patch || !isDirty || !validate()) return;
    try {
      await save.mutateAsync(patch);
    } catch (err) {
      reportConflict(err, 'psychologist:review.errors.save');
    }
  }

  async function publishReport(): Promise<boolean> {
    if (!validate()) return false;
    try {
      await publish.mutateAsync();
      return true;
    } catch (err) {
      reportConflict(err, 'psychologist:review.errors.publish');
      return false;
    }
  }

  function update<K extends EditableKey>(key: K, value: ReviewDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setActionError(null);
  }

  return {
    detail,
    draft,
    isLoading: result.isLoading,
    loadError: result.isError ? errorMessage(t, result.error, 'psychologist:review.errors.load') : null,
    reload: () => void result.refetch(),
    edits: edits.data ?? [],
    editedKeys,
    isDirty,
    isPublished,
    saving: save.isPending,
    publishing: publish.isPending,
    actionError,
    update,
    saveDraft,
    publishReport,
    validate,
  };
}

export type ReportReview = ReturnType<typeof useReportReview>;
