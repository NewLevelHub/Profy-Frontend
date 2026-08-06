import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';

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

/** Dev-only helper: answers every remaining Likert question (RIASEC + Big
 * Five) with a random 1-5 value, then every motivation triplet with a random
 * MOST/LEAST pair — so the whole test (both phases, submit endpoints already
 * accept batched answers) completes in two requests instead of ~278 clicks. */
export async function autofillAssessment(assessmentId: string): Promise<void> {
  const questions = await assessmentApi.getQuestions(assessmentId);
  if (questions.length > 0) {
    await assessmentApi.saveAnswers(assessmentId, {
      answers: questions.map(q => ({ question_id: q.id, value: randomInt(1, 5) })),
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
