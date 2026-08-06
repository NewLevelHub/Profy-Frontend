import type { Question, QuestionPair } from '@/shared/types';

export type DisplayItem =
  | { kind: 'likert'; question: Question }
  | { kind: 'pair'; pair: QuestionPair };

/**
 * Merges the plain Likert question list with the (possibly empty) pair list
 * into one ordered sequence for AssessmentPage to render. Questions claimed
 * by a pair (as option_a/option_b) are dropped from the flat list — the pair
 * screen covers both of them — and each pair is spliced in at its
 * `display_order` position among the remaining Likert questions' `order`.
 *
 * Senior has no pairs, so `pairs` is `[]` and this degrades to exactly the
 * old plain Likert sequence — no behavior change for that age group.
 */
export function buildDisplaySequence(questions: Question[], pairs: QuestionPair[]): DisplayItem[] {
  if (pairs.length === 0) {
    return questions.map(question => ({ kind: 'likert', question }));
  }

  const claimedQuestionIds = new Set<string>();
  for (const pair of pairs) {
    claimedQuestionIds.add(pair.option_a.id);
    claimedQuestionIds.add(pair.option_b.id);
  }

  const items: { order: number; item: DisplayItem }[] = [];
  for (const question of questions) {
    if (claimedQuestionIds.has(question.id)) continue;
    items.push({ order: question.order, item: { kind: 'likert', question } });
  }
  for (const pair of pairs) {
    items.push({ order: pair.display_order, item: { kind: 'pair', pair } });
  }

  items.sort((a, b) => a.order - b.order);
  return items.map(({ item }) => item);
}
