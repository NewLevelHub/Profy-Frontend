import type { PsychologistResultDetail } from '@/shared/types';

export const EDITABLE_KEYS = [
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

export function toDraft(detail: PsychologistResultDetail): ReviewDraft {
  return Object.fromEntries(EDITABLE_KEYS.map((key) => [key, detail[key]])) as ReviewDraft;
}

export function dirtyKeys(baseline: ReviewDraft, draft: ReviewDraft): EditableKey[] {
  return EDITABLE_KEYS.filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(baseline[key]));
}

interface DraftState {
  reportId: string | null;
  baseline: ReviewDraft | null;
  draft: ReviewDraft | null;
}

type DraftAction =
  | { type: 'receive'; reportId: string; draft: ReviewDraft; published?: boolean }
  | { type: 'saved'; reportId: string; submitted: ReviewDraft; draft: ReviewDraft }
  | { type: 'change'; reportId: string; patch: Partial<ReviewDraft> };

export const EMPTY_DRAFT: DraftState = { reportId: null, baseline: null, draft: null };

/** Accept server values only for fields the user has not edited since the
 * comparison snapshot. A save compares against what was sent, a refetch
 * against the last server copy. Neither can erase newer typing. */
function reconcile(current: ReviewDraft, compared: ReviewDraft, incoming: ReviewDraft): ReviewDraft {
  const localChanges = dirtyKeys(compared, current);
  return {
    ...incoming,
    ...Object.fromEntries(localChanges.map((key) => [key, current[key]])),
  };
}

export function reportDraftReducer(state: DraftState, action: DraftAction): DraftState {
  if (action.type === 'receive') {
    // A published report is immutable. Its read-only view must show exactly
    // what the student received, including publication from another tab.
    if (action.published || state.reportId !== action.reportId || !state.draft || !state.baseline) {
      return { reportId: action.reportId, baseline: action.draft, draft: action.draft };
    }
    if (dirtyKeys(state.baseline, action.draft).length === 0) return state;
    return {
      ...state,
      baseline: action.draft,
      draft: reconcile(state.draft, state.baseline, action.draft),
    };
  }

  // A response to an old report must not modify the newly opened report.
  if (state.reportId !== action.reportId || !state.draft) return state;
  if (action.type === 'change') return { ...state, draft: { ...state.draft, ...action.patch } };
  return {
    ...state,
    baseline: action.draft,
    draft: reconcile(state.draft, action.submitted, action.draft),
  };
}
