import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';

export type FeedbackTag = 'agree' | 'off' | 'just_writing';

export interface FeedbackPayload {
  assessment_id: string;
  tags: FeedbackTag[];
  text: string;
}

/**
 * GAP: no feedback-submission endpoint exists on the backend as of this
 * investigation (see endpoints.ts). `API.results.feedback` is a proposed
 * path, not a confirmed one. This function makes a real request against it
 * rather than faking success — until the backend implements the route this
 * will reject (404/network error), and FeedbackSection surfaces that as a
 * normal retry-able error state, the same pattern used for every other
 * failed request in this app. Do not change this to a silent no-op.
 */
export const feedbackApi = {
  submit: (payload: FeedbackPayload) =>
    apiClient.post<void>(API.results.feedback, payload).then(() => undefined),
};
