import type { Question, QuestionPair } from '@/shared/types';

export type DisplayItem =
  | { kind: 'likert'; question: Question }
  | { kind: 'pair'; pair: QuestionPair };

/**
 * Builds one ordered sequence for AssessmentPage to render: all Likert
 * questions first (sorted by `order`), then all pairs (sorted by
 * `display_order`). Questions claimed by a pair (as option_a/option_b) are
 * dropped from the flat list — the pair screen covers both of them.
 *
 * Likert is paginated 5-per-page (see buildPages), so it must form one
 * contiguous block up front rather than being interleaved with pairs.
 *
 * Senior has no pairs, so `pairs` is `[]` and this degrades to exactly the
 * plain Likert sequence.
 */
export function buildDisplaySequence(questions: Question[], pairs: QuestionPair[]): DisplayItem[] {
  const claimedQuestionIds = new Set<string>();
  for (const pair of pairs) {
    claimedQuestionIds.add(pair.option_a.id);
    claimedQuestionIds.add(pair.option_b.id);
  }

  const likertQuestions = questions
    .filter(question => !claimedQuestionIds.has(question.id))
    .sort((a, b) => a.order - b.order);
  const sortedPairs = [...pairs].sort((a, b) => a.display_order - b.display_order);

  return [
    ...likertQuestions.map(question => ({ kind: 'likert', question }) as DisplayItem),
    ...sortedPairs.map(pair => ({ kind: 'pair', pair }) as DisplayItem),
  ];
}
