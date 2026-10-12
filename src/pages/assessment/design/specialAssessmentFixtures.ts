import type { TFunction } from 'i18next';
import type { AsturContentItem, AsturContentSubtest, AsturSubtestKey, BelbinContentSection } from '@/shared/types';

export const ASTUR_PREVIEW_KEYS: AsturSubtestKey[] = [
  'awareness', 'analogies', 'classification', 'generalization', 'numeric_series',
  'logical_schemas', 'geometric_figures', 'lability',
];

/** Illustrative fixtures only: no scored content is fetched or submitted. */
export function specialAssessmentFixtures(t: TFunction<'assessment'>, key: AsturSubtestKey) {
  const words = (name: string, count: number) => Array.from({ length: count }, (_, i) => t(`redesign.specialPreview.${name}.${i}`));
  const belbin: BelbinContentSection = {
    section: 'I', title: t('redesign.specialPreview.belbinTitle'),
    items: words('belbinItems', 8).map((text, i) => ({ id: `preview-${i}`, text })),
  };
  const items: Record<AsturSubtestKey, AsturContentItem[]> = {
    awareness: Array.from({ length: 6 }, (_, i) => ({
      text: t(`redesign.specialPreview.awareness.questions.${i % 2}`),
      options: words(`awareness.options${i % 2}`, 4),
    })),
    analogies: [{ pair: [t('redesign.specialPreview.analogies.first'), t('redesign.specialPreview.analogies.second')],
      third: t('redesign.specialPreview.analogies.third'), options: words('analogies.options', 4) }],
    classification: [{ words: words('classification.words', 6) }],
    generalization: [{ pair: [t('redesign.specialPreview.generalization.first'), t('redesign.specialPreview.generalization.second')] }],
    numeric_series: [{ sequence: [2, 4, 6, 8] }, { sequence: [3, 6, 12, 24] }],
    logical_schemas: [{ concepts: words('logical_schemas.concepts', 4) }],
    geometric_figures: [1, 2].map(i => {
      const path = `astur-figures/v1/geometric_figures-0${i}`;
      return { stimulus: { target: `${path}-target.png`, options: {
        A: `${path}-a.png`, B: `${path}-b.png`, C: `${path}-v.png`, D: `${path}-g.png`,
      } } };
    }),
    lability: [0, 1, 2].map(i => ({ instruction: t(`redesign.specialPreview.lability.commands.${i}`), answer_format: 'digit', options: ['2', '7'] })),
  };
  const subtest: AsturContentSubtest = {
    number: ASTUR_PREVIEW_KEYS.indexOf(key) + 1, key,
    name: t(`redesign.specialPreview.${key}.name`),
    instruction: t(`redesign.specialPreview.${key}.instruction`),
    item_count: items[key].length, time_limit_sec: key === 'lability' ? null : 600,
    items: items[key].map((item, i) => ({ ...item, item_id: `preview-${key}-${i}` })),
  };
  return { belbin, subtest };
}
