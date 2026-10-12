import type { TFunction } from 'i18next';
import type { ProfileResponse, RiasecResultResponse, StrengthCard, ThinkingStyleNote } from '@/shared/types';
import { RIASEC_LABELS } from '@/shared/config/constants';

/** Fictional design fixtures. Never stored in the application or sent to APIs. */
export function studentFixtures(t: TFunction) {
  const text = (key: string) => t(`results:redesign.preview.data.${key}`);
  const report: RiasecResultResponse = {
    report_version: 2, assessment_id: 'design-preview-only', interest_instrument: 'riasec',
    summary: text('summary'), disclaimer: text('disclaimer'),
    strength_cards: t('results:redesign.preview.data.strengths', { returnObjects: true }) as StrengthCard[],
    interest_map: ['R', 'I', 'A', 'S', 'E', 'C'].map((code, i) => ({
      code, sphere: t(RIASEC_LABELS[code]), level: i === 1 || i === 2 ? 'high' : i === 3 ? 'medium' : 'low',
      details: { answered: 24, distribution: [[1, 3, 8, 7, 5], [11, 8, 3, 1, 1], [12, 8, 2, 1, 1], [5, 6, 6, 4, 3], [2, 4, 8, 6, 4], [1, 4, 6, 7, 6]][i],
        likes: [4, 19, 20, 11, 6, 5][i], dislikes: [12, 2, 2, 7, 10, 13][i], score: [35, 82, 85, 58, 40, 36][i],
        means: text('means'), follows: text('follows'), quotes: [{ text: text('quote'), answer: 'like' }],
      },
    })),
    interest_map_note: text('interestNote'), interest_combination: { codes: ['A', 'I'], relation: 'adjacent', text: text('combination') },
    thinking_style_notes: t('results:redesign.preview.data.thinking', { returnObjects: true }) as ThinkingStyleNote[],
    personality_notes: [], personality_note: '', motivation_highlights: [text('motivation1'), text('motivation2')],
    is_flat_profile: false, exploration_note: '', exploration_activities: [], final_analysis: text('analysis'),
    careers: ['design', 'research', 'communications'].map((slug, i) => ({
      slug, name: text(`careers.${slug}`), rank: i + 1, tier: i === 0 ? 'strong' : 'good',
      why: text('why'), try_now: text('tryNow'), description: text('why'), skills_needed: [], subjects_to_develop: [],
      fit_reasons: [{ kind: 'fact', fact: text('fact'), text: text('why') }], fit_keys: ['strength:ideas'], why_by_ai: true,
    })), created_at: '2026-10-05T09:00:00Z',
  };
  const profile: ProfileResponse = {
    id: 'design-profile', user_id: 'design-user', name: text('name'), age: 16, grade: 10,
    city: text('city'), country: text('country'), language: 'ru', age_group: 'senior',
    subjects_liked: [text('subject1'), text('subject2')], subjects_easy: [text('subject1')],
    subjects_disliked: [], subjects_hard: [text('subject3')],
    artifacts: [{ type: 'hobby', value: text('hobby') }, { type: 'club', value: text('club') }, { type: 'goal', value: text('dream') }],
    certificates: [{ type: 'ielts', score: 6.5 }, { type: 'unt', score: 112 }],
  };
  return { report, profile };
}
