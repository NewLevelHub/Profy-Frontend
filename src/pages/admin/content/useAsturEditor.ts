import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '@/shared/api/admin';
import type { AsturBankItem, AsturBankSubtest } from '@/shared/types';
import { useContentOverrideDraft } from './useContentOverrideDraft';

const INSTRUMENT = 'astur';

type Lang = 'ru' | 'kk';
type LocalizedItemField = 'text' | 'instruction' | 'third';
type LocalizedListField = 'options' | 'pair' | 'words' | 'concepts';

interface Drafts {
  ru: AsturBankSubtest[];
  kk: AsturBankSubtest[];
}

function mapSubtest(
  subtests: AsturBankSubtest[],
  subtestIdx: number,
  update: (subtest: AsturBankSubtest) => AsturBankSubtest,
): AsturBankSubtest[] {
  return subtests.map((subtest, idx) => (idx === subtestIdx ? update(subtest) : subtest));
}

function mapItem(
  subtest: AsturBankSubtest,
  itemIdx: number,
  update: (item: AsturBankItem) => AsturBankItem,
): AsturBankSubtest {
  return { ...subtest, items: subtest.items.map((item, idx) => (idx === itemIdx ? update(item) : item)) };
}

/** Server state + draft editing for the ASTUR field-by-field editor —
 *  same bilingual-full-clone pattern as `useBelbinEditor` (PRO-424): both
 *  drafts start as complete copies of the bank/override, only the touched
 *  locale's leaf actually changes on an edit. Replaces the earlier raw-JSON
 *  textarea editor, which required the admin to hand-author a JSON blob
 *  matching an undocumented shape. */
export function useAsturEditor() {
  const queryClient = useQueryClient();
  const [activeSubtestIdx, setActiveSubtestIdx] = useState(0);

  const {
    data: schema,
    isLoading: isSchemaLoading,
    isError: isSchemaError,
  } = useQuery({
    queryKey: ['adminAsturSchema'],
    queryFn: adminApi.getAsturSchema,
  });

  const {
    data: overrides,
    isLoading: isOverridesLoading,
    isError: isOverridesError,
  } = useQuery({
    queryKey: ['adminContentOverride', INSTRUMENT],
    queryFn: () => adminApi.getContentOverride(INSTRUMENT),
  });

  const seed = useMemo<Drafts | null>(() => {
    if (!schema || !overrides) return null;
    const overrideRu = (overrides.content_ru as { subtests?: AsturBankSubtest[] } | null)?.subtests;
    const overrideKk = (overrides.content_kk as { subtests?: AsturBankSubtest[] } | null)?.subtests;
    return { ru: overrideRu ?? schema.subtests, kk: overrideKk ?? schema.subtests };
  }, [schema, overrides]);

  const { draft, setDraft, dirty, saving, state, reset, save } = useContentOverrideDraft<Drafts>({
    seed,
    onSave: async (next) => {
      await adminApi.setContentOverride(INSTRUMENT, {
        content_ru: { subtests: next.ru },
        content_kk: { subtests: next.kk },
      });
      await queryClient.invalidateQueries({ queryKey: ['adminContentOverride', INSTRUMENT] });
    },
  });

  const setSubtestField = (lang: Lang, field: 'name' | 'instruction', value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const subtests = mapSubtest(prev[lang], activeSubtestIdx, (subtest) => ({
        ...subtest,
        [field]: { ...subtest[field], [lang]: value },
      }));
      return { ...prev, [lang]: subtests };
    });
  };

  const setItemLocalizedField = (lang: Lang, itemIdx: number, field: LocalizedItemField, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const subtests = mapSubtest(prev[lang], activeSubtestIdx, (subtest) =>
        mapItem(subtest, itemIdx, (item) => ({
          ...item,
          [field]: { ...(item[field] as { ru: string; kk: string } | undefined), [lang]: value },
        })),
      );
      return { ...prev, [lang]: subtests };
    });
  };

  const setItemListField = (lang: Lang, itemIdx: number, field: LocalizedListField, values: string[]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const subtests = mapSubtest(prev[lang], activeSubtestIdx, (subtest) =>
        mapItem(subtest, itemIdx, (item) => ({
          ...item,
          [field]: { ...(item[field] as { ru: string[]; kk: string[] } | undefined), [lang]: values },
        })),
      );
      return { ...prev, [lang]: subtests };
    });
  };

  // `sequence` is locale-independent (plain numbers, PRO-338 Ф4.4) — both
  // drafts hold their own copy of the subtests tree, so the same edit is
  // applied to both to keep them from silently diverging.
  const setItemSequence = (itemIdx: number, values: number[]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const apply = (subtests: AsturBankSubtest[]) =>
        mapSubtest(subtests, activeSubtestIdx, (subtest) =>
          mapItem(subtest, itemIdx, (item) => ({ ...item, sequence: values })),
        );
      return { ru: apply(prev.ru), kk: apply(prev.kk) };
    });
  };

  return {
    isLoading: isSchemaLoading || isOverridesLoading || !draft,
    isLoadError: isSchemaError || isOverridesError,
    subtestsRu: draft?.ru ?? [],
    subtestsKk: draft?.kk ?? [],
    activeSubtestIdx,
    setActiveSubtestIdx,
    setSubtestField,
    setItemLocalizedField,
    setItemListField,
    setItemSequence,
    dirty,
    saving,
    state,
    reset,
    save,
  };
}
