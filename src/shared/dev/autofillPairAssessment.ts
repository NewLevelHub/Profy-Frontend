import { pairsApi } from '@/shared/api/pairs';
import { motivationPairsApi } from '@/shared/api/motivationPairs';

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
 * motivation Harter pair with a random side + intensity (junior always uses
 * the Harter format now, never the triplets — see MotivationAssessmentPage.tsx)
 * — so the whole test completes in two requests instead of ~52 taps. */
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

  const motivationPairs = await motivationPairsApi.getPairs(assessmentId);
  if (motivationPairs.length > 0) {
    await motivationPairsApi.submitAnswers(assessmentId, {
      answers: motivationPairs.map(p => ({
        pair_index: p.pair_index,
        chosen_side: Math.random() < 0.5 ? 'a' : 'b',
        intensity: Math.random() < 0.5 ? 'high' : 'medium',
      })),
    });
  }
}
