import type { Question, QuestionPair } from '@/shared/types';

export type DisplayItem =
  | { kind: 'likert'; question: Question }
  | { kind: 'pair'; pair: QuestionPair };

function normalizedPosition(value: number, min: number, max: number): number {
  return max === min ? 0 : (value - min) / (max - min);
}

/**
 * Merges the plain Likert question list with the (possibly empty) pair list
 * into one ordered sequence for AssessmentPage to render. Questions claimed
 * by a pair (as option_a/option_b) are dropped from the flat list — the pair
 * screen covers both of them.
 *
 * The two lists are merged by NORMALIZED position (each list's own `order`/
 * `display_order` rescaled to its own [0,1] span), not raw order value.
 * For middle, the Likert and pair `order` ranges overlap (pairs are built
 * from items living inside the same bank), so this behaves like a plain
 * order merge. But junior's MI (Likert) and Big Five (pairs) banks sit in
 * entirely disjoint `order` ranges — merging by raw order would front-load
 * one instrument's whole block before the other instead of interleaving
 * them, which is what actually happened before this fix.
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

  const likertQuestions = questions
    .filter(question => !claimedQuestionIds.has(question.id))
    .sort((a, b) => a.order - b.order);
  const sortedPairs = [...pairs].sort((a, b) => a.display_order - b.display_order);

  if (likertQuestions.length === 0) {
    return sortedPairs.map(pair => ({ kind: 'pair', pair }));
  }

  const likertMin = likertQuestions[0].order;
  const likertMax = likertQuestions[likertQuestions.length - 1].order;
  const pairMin = sortedPairs[0].display_order;
  const pairMax = sortedPairs[sortedPairs.length - 1].display_order;

  const items: { position: number; item: DisplayItem }[] = [
    ...likertQuestions.map(question => ({
      position: normalizedPosition(question.order, likertMin, likertMax),
      item: { kind: 'likert', question } as DisplayItem,
    })),
    ...sortedPairs.map(pair => ({
      position: normalizedPosition(pair.display_order, pairMin, pairMax),
      item: { kind: 'pair', pair } as DisplayItem,
    })),
  ];

  items.sort((a, b) => a.position - b.position);
  return items.map(({ item }) => item);
}
