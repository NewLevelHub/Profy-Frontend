import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';

// Frontend-owned list, not a backend enum — the backend stores whatever
// strings are sent (see app/models/product_feedback.py comment), so this
// list can gain/rename sections without a migration. Keep in sync with the
// sections actually shown on /results.
//
// `labelKey` is the i18n key the user-facing form resolves via `t()`
// (results/feedbackSection.*). `label` is a plain ru string kept only for
// the ru-only admin feedback view (src/pages/admin/AdminFeedbackPage, which
// by policy never calls `t()`); both must stay in sync with the ru catalog.
export const REPORT_SECTIONS: { value: string; label: string; labelKey: string }[] = [
  { value: 'interests', label: 'Карта интересов', labelKey: 'results:feedbackSection.interests' },
  { value: 'personality', label: 'Характер', labelKey: 'results:feedbackSection.personality' },
  { value: 'careers', label: 'Профессии и направления', labelKey: 'results:feedbackSection.careers' },
  { value: 'thinking_style', label: 'Стиль мышления', labelKey: 'results:feedbackSection.thinking_style' },
  { value: 'motivation', label: 'Мотивация', labelKey: 'results:feedbackSection.motivation' },
  // 'roadmap' ("План действий") hidden for now — that section isn't shown
  // on /results yet, so it shouldn't be pickable as "useful" here either.
];

export interface FeedbackPayload {
  assessment_id: string;
  /** "Насколько это про тебя?" — 1-5. */
  relevance_score: number;
  /** "Что оказалось самым полезным?" — multi-pick from REPORT_SECTIONS. */
  helpful_sections: string[];
  /** "Что было непонятно или не подошло?" — optional. */
  comment: string | null;
}

export interface FeedbackSubmitResponse {
  id: string;
  assessment_id: string | null;
  relevance_score: number;
  helpful_sections: string[];
  comment: string | null;
  created_at: string;
}

export const feedbackApi = {
  submit: (payload: FeedbackPayload) =>
    apiClient.post<FeedbackSubmitResponse>(API.result.feedback, payload).then((r) => r.data),
};
