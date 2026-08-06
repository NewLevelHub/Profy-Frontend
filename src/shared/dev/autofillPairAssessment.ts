import { pairsApi } from '@/shared/api/pairs';
import { motivationApi } from '@/shared/api/motivation';

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Dev-only helper, junior's pairs equivalent of autofillAssessment.ts:
 * answers every remaining pair by picking one option at random, then every
 * motivation triplet with a random MOST/LEAST pair — so the whole test
 * completes in two requests instead of ~46 taps. */
export async function autofillPairAssessment(assessmentId: string): Promise<void> {
  const pairs = await pairsApi.getPairs(assessmentId);
  if (pairs.length > 0) {
    await pairsApi.submitAnswers(assessmentId, {
      answers: pairs.map(p => ({
        pair_index: p.pair_index,
        picked_question_id: shuffled([p.option_a.id, p.option_b.id])[0],
      })),
    });
  }

  const triplets = await motivationApi.getTriplets(assessmentId);
  if (triplets.length > 0) {
    await motivationApi.submitAnswers(assessmentId, {
      answers: triplets.map(t => {
        const [most, least] = shuffled(t.statements);
        return {
          triplet_index: t.triplet_index,
          most_statement_id: most.id,
          least_statement_id: least.id,
        };
      }),
    });
  }
}
