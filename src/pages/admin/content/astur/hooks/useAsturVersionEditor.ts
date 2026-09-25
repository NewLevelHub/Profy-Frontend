import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAsturApi } from '@/shared/api/adminAstur';
import type { AsturBankDocument, AsturBankIssue, AsturBankItem, AsturBankVersionDetail } from '@/shared/types';
import { useContentOverrideDraft } from '../../useContentOverrideDraft';
import { ASTUR_VERSIONS_KEY, asturVersionPath } from './useAsturVersions';

type Lang = 'ru' | 'kk';

const versionKey = (id: string) => ['adminAsturVersion', id] as const;

/**
 * One АСТУР bank version (PRO-427). A draft is edited as a whole document
 * — text, options and keys together — saved as a draft, validated by the
 * server on every save, and published into an immutable version once its
 * issues are gone and every changed key is explicitly confirmed. A
 * published version is shown read-only.
 */
export function useAsturVersionEditor(versionId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSubtestIdx, setActiveSubtestIdx] = useState(0);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishIssues, setPublishIssues] = useState<AsturBankIssue[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: version, isLoading, isError } = useQuery({
    queryKey: versionKey(versionId),
    queryFn: () => adminAsturApi.getVersion(versionId),
  });
  const isDraft = version?.status === 'draft';

  const applyServerVersion = useCallback(
    (next: AsturBankVersionDetail) => {
      queryClient.setQueryData(versionKey(versionId), next);
      void queryClient.invalidateQueries({ queryKey: ASTUR_VERSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['adminAsturDiff', versionId] });
    },
    [queryClient, versionId],
  );

  const onSave = useCallback(
    async (document: AsturBankDocument) => {
      applyServerVersion(await adminAsturApi.updateDraft(versionId, document, notes ?? version?.notes ?? null));
    },
    [applyServerVersion, versionId, notes, version?.notes],
  );

  const { draft, setDraft, dirty, saving, state, reset, save } = useContentOverrideDraft<AsturBankDocument>({
    seed: version?.document ?? null,
    onSave,
  });
  const notesDirty = notes !== null && notes !== (version?.notes ?? '');

  const selectSubtest = (idx: number) => {
    setActiveSubtestIdx(idx);
    setSelectedItemIdx(null);
  };

  const selectItem = (subtestKey: string | null, itemId: string | null) => {
    if (!draft || !subtestKey) return;
    const sIdx = draft.subtests.findIndex((s) => s.key === subtestKey);
    if (sIdx === -1) return;
    setActiveSubtestIdx(sIdx);
    const iIdx = itemId ? draft.subtests[sIdx].items.findIndex((i) => i.item_id === itemId) : -1;
    setSelectedItemIdx(iIdx === -1 ? null : iIdx);
  };

  const setSubtestText = (lang: Lang, field: 'name' | 'instruction', value: string) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        subtests: prev.subtests.map((s, i) =>
          i === activeSubtestIdx ? { ...s, [field]: { ...s[field], [lang]: value } } : s,
        ),
      },
    );

  const setSubtestTimer = (seconds: number | null) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        subtests: prev.subtests.map((s, i) => (i === activeSubtestIdx ? { ...s, time_limit_sec: seconds } : s)),
      },
    );

  const updateItem = (itemIdx: number, next: AsturBankItem) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        subtests: prev.subtests.map((s, i) =>
          i === activeSubtestIdx ? { ...s, items: s.items.map((it, j) => (j === itemIdx ? next : it)) } : s,
        ),
      },
    );

  async function saveAll() {
    if (dirty) {
      await save();
    } else if (notesDirty && version && draft) {
      setActionError(null);
      try {
        applyServerVersion(await adminAsturApi.updateDraft(versionId, draft, notes));
      } catch {
        setActionError('Не удалось сохранить комментарий.');
      }
    }
  }

  async function publish(confirmedItemIds: string[]) {
    setPublishing(true);
    setPublishIssues([]);
    try {
      applyServerVersion(await adminAsturApi.publish(versionId, confirmedItemIds));
      setPublishOpen(false);
    } catch (error) {
      const detail = isAxiosError(error) ? error.response?.data?.detail : null;
      setPublishIssues(Array.isArray(detail?.issues) ? detail.issues : []);
      if (!Array.isArray(detail?.issues)) setActionError('Не удалось опубликовать версию.');
    } finally {
      setPublishing(false);
    }
  }

  async function discardDraft() {
    setActionError(null);
    try {
      await adminAsturApi.deleteDraft(versionId);
      await queryClient.invalidateQueries({ queryKey: ASTUR_VERSIONS_KEY });
      navigate('/admin/content/tests');
    } catch {
      setActionError('Не удалось удалить черновик.');
    }
  }

  async function branchNewDraft() {
    setActionError(null);
    try {
      const created = await adminAsturApi.createDraft();
      await queryClient.invalidateQueries({ queryKey: ASTUR_VERSIONS_KEY });
      navigate(asturVersionPath(created.id));
    } catch {
      setActionError('Не удалось создать черновик.');
    }
  }

  return {
    version,
    document: draft,
    isLoading: isLoading || (!!version && !draft),
    isError,
    isDraft,
    activeSubtestIdx,
    selectSubtest,
    selectedItemIdx,
    setSelectedItemIdx,
    selectItem,
    setSubtestText,
    setSubtestTimer,
    updateItem,
    notes: notes ?? version?.notes ?? '',
    setNotes,
    dirty: dirty || notesDirty,
    docDirty: dirty,
    saving,
    saveState: state,
    reset: () => {
      reset();
      setNotes(null);
    },
    saveAll,
    publishOpen,
    openPublish: () => {
      setPublishIssues([]);
      setPublishOpen(true);
    },
    closePublish: () => setPublishOpen(false),
    publish,
    publishing,
    publishIssues,
    discardDraft,
    branchNewDraft,
    actionError,
  };
}
