import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';
import { motivationPairsApi } from '@/shared/api/motivationPairs';
import { pairsApi } from '@/shared/api/pairs';
import type { AgeGroup } from '@/shared/types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Dev-only helper: answers every remaining plain Likert question (RIASEC +
 * Big Five, minus whatever's been pulled into pairs — see
 * buildDisplaySequence.ts) with a random 1-5 value, every pair (middle's
 * Dilemma/Scenario subset, or junior's whole test if this profile somehow
 * still hits this page) by picking a random option, then the motivation
 * phase — Harter pairs for junior/middle, MOST/LEAST triplets for senior
 * (app/routers/motivation_pairs.py vs motivation.py) — so the whole test
 * completes in three requests instead of up to ~278 clicks. */
export async function autofillAssessment(assessmentId: string, ageGroup: AgeGroup | undefined): Promise<void> {
  const [questions, pairs] = await Promise.all([
    assessmentApi.getQuestions(assessmentId),
    pairsApi.getPairs(assessmentId),
  ]);

  const pairedQuestionIds = new Set(pairs.flatMap(p => [p.option_a.id, p.option_b.id]));
  const likertOnly = questions.filter(q => !pairedQuestionIds.has(q.id));
  if (likertOnly.length > 0) {
    await assessmentApi.saveAnswers(assessmentId, {
      answers: likertOnly.map(q => ({ question_id: q.id, value: randomInt(1, 5) })),
    });
  }

  if (pairs.length > 0) {
    await pairsApi.submitAnswers(assessmentId, {
      answers: pairs.map(p => ({
        pair_index: p.pair_index,
        picked_question_id: shuffled([p.option_a.id, p.option_b.id])[0],
      })),
    });
  }

  if (ageGroup === 'senior') {
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
  } else {
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
}
