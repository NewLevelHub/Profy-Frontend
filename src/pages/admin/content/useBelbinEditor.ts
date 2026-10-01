import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '@/shared/api/admin';
import type { BelbinBankSection } from '@/shared/types';
import { useContentOverrideDraft } from './useContentOverrideDraft';

const INSTRUMENT = 'belbin';

interface Drafts {
  ru: BelbinBankSection[];
  kk: BelbinBankSection[];
}

/** Server state + draft editing for the Belbin visual editor. Both drafts
 *  start as full clones of the bank schema (bilingual per section/item) so
 *  that whichever locale wasn't touched still round-trips its half of the
 *  bank's own text — only the edited locale's leaf actually changes. */
export function useBelbinEditor() {
  const queryClient = useQueryClient();
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const {
    data: schema,
    isLoading: isSchemaLoading,
    isError: isSchemaError,
  } = useQuery({
    queryKey: ['adminBelbinSchema'],
    queryFn: adminApi.getBelbinSchema,
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
    const overrideRu = (overrides.content_ru as { sections?: BelbinBankSection[] } | null)?.sections;
    const overrideKk = (overrides.content_kk as { sections?: BelbinBankSection[] } | null)?.sections;
    return { ru: overrideRu ?? schema.sections, kk: overrideKk ?? schema.sections };
  }, [schema, overrides]);

  const { draft, setDraft, dirty, saving, state, reset, save } = useContentOverrideDraft<Drafts>({
    seed,
    onSave: async (next) => {
      await adminApi.setContentOverride(INSTRUMENT, {
        content_ru: { sections: next.ru },
        content_kk: { sections: next.kk },
      });
      await queryClient.invalidateQueries({ queryKey: ['adminContentOverride', INSTRUMENT] });
    },
  });

  const setSectionTitle = (lang: 'ru' | 'kk', value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const sections = prev[lang].map((section, idx) =>
        idx === activeSectionIdx ? { ...section, title: { ...section.title, [lang]: value } } : section,
      );
      return { ...prev, [lang]: sections };
    });
  };

  const setItemText = (lang: 'ru' | 'kk', itemIdx: number, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const sections = prev[lang].map((section, idx) => {
        if (idx !== activeSectionIdx) return section;
        return {
          ...section,
          items: section.items.map((item, i) =>
            i === itemIdx ? { ...item, text: { ...item.text, [lang]: value } } : item,
          ),
        };
      });
      return { ...prev, [lang]: sections };
    });
  };

  return {
    isLoading: isSchemaLoading || isOverridesLoading || !draft,
    isLoadError: isSchemaError || isOverridesError,
    sectionsRu: draft?.ru ?? [],
    sectionsKk: draft?.kk ?? [],
    activeSectionIdx,
    setActiveSectionIdx,
    setSectionTitle,
    setItemText,
    dirty,
    saving,
    state,
    reset,
    save,
  };
}
