import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';
import { motivationPairsApi } from '@/shared/api/motivationPairs';
import { pairsApi } from '@/shared/api/pairs';
import { belbinApi } from '@/shared/api/belbin';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import { ABILITIES_LIKERT_SCALE, KONDASH_ANXIETY_SCALE, YES_NO_SCALE } from '@/shared/config/constants';
import type { AgeGroup, Instrument, Question } from '@/shared/types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFromScale(scale: { value: number }[]): number {
  return scale[randomInt(0, scale.length - 1)].value;
}

// PRO-338 added 4 new instruments to the plain Likert battery, each with
// its OWN valid answer_value range, not the RIASEC/Big Five 1-5 (see
// shared/config/constants.ts's own comments): sending an out-of-range
// value 422s the save — this silently broke autofill the moment it reached
// any of these blocks, well before the motivation phase it's meant to
// unlock for e2e testing.
function randomValueForInstrument(instrument: Instrument): number {
  switch (instrument) {
    case 'eysenck':
    case 'elers':
    case 'boyko_empathy':
      return randomFromScale(YES_NO_SCALE);
    case 'professional_types_abilities':
      return randomFromScale(ABILITIES_LIKERT_SCALE);
    case 'kondash_anxiety':
      return randomFromScale(KONDASH_ANXIETY_SCALE);
    default:
      return randomInt(1, 5);
  }
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
 * Big Five + PRO-338's Eysenck/Elers/Boyko/Kondash/ДДО-abilities additions,
 * minus whatever's been pulled into pairs — see buildDisplaySequence.ts)
 * with a random value valid for THAT question's own instrument (see
 * randomValueForInstrument above — RIASEC/Big Five/MI/ДДО-pairs get 1-5,
 * everything else gets its own real range), then every pair (middle's
 * Dilemma/Scenario subset, or junior's whole test if this profile somehow
 * still hits this page) by picking a random option — the main battery only,
 * stopping right before motivation. Split out of `autofillAssessment` so a
 * caller can land the tester ON the motivation screen (e.g. to test THAT
 * screen by hand) instead of racing straight through it. */
export async function autofillMainBattery(assessmentId: string): Promise<void> {
  const [questions, pairs] = await Promise.all([
    assessmentApi.getQuestions(assessmentId),
    pairsApi.getPairs(assessmentId),
  ]);

  const pairedQuestionIds = new Set(pairs.flatMap(p => [p.option_a.id, p.option_b.id]));
  const likertOnly = questions.filter(q => !pairedQuestionIds.has(q.id));
  if (likertOnly.length > 0) {
    await assessmentApi.saveAnswers(assessmentId, {
      answers: likertOnly.map((q: Question) => ({ question_id: q.id, value: randomValueForInstrument(q.instrument) })),
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
}

/** Dev-only helper: fills every remaining Likert/pair question, then stops —
 * landing the caller right at /assessment/motivation ("Что тебя драйвит")
 * instead of racing through it, so that block can be tested by hand. */
export const autofillUntilMotivation = autofillMainBattery;

/** Dev-only helper: `autofillMainBattery` plus motivation plus Belbin —
 * everything ahead of АСТУР — so a caller can land the tester ON the
 * АСТУР flow itself (e.g. to test IT by hand, or after adding a new
 * subtest) instead of racing through it too. Split out of
 * `autofillAssessment` the same way `autofillMainBattery` was split out of
 * this originally (see its own comment). */
export async function autofillToAstur(assessmentId: string, ageGroup: AgeGroup | undefined): Promise<void> {
  await autofillMainBattery(assessmentId);

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

  try {
    const belbinContent = await belbinApi.getContent();
    if (belbinContent?.sections?.length > 0) {
      const allocations = belbinContent.sections.map((sec) => {
        const alloc: Record<string, number> = {};
        sec.items.forEach((it, idx) => {
          alloc[it.id] = idx === 0 ? belbinContent.block_total : 0;
        });
        return alloc;
      });
      await belbinApi.submit(assessmentId, { allocations });
      useAssessmentStore.getState().setBelbinCompleted(true);
    }
  } catch {
    // Ignore if already submitted or error
  }
}

/** Dev-only helper: `autofillToAstur` plus АСТУР itself — the whole test
 * completes in a handful of requests instead of up to ~278 clicks. */
export async function autofillAssessment(assessmentId: string, ageGroup: AgeGroup | undefined): Promise<void> {
  await autofillToAstur(assessmentId, ageGroup);

  try {
    const asturContent = await asturApi.getContent();
    if (asturContent?.subtests?.length > 0) {
      for (const st of asturContent.subtests) {
        const answers: Record<string, unknown> = {};
        const elapsed_ms: Record<string, number> = {};
        st.items.forEach((it: any, i: number) => {
          // 1-based position keys — same contract as useAsturAssessment.handleAutofill
          const key = String(i + 1);
          if (st.key === 'lability') {
            answers[key] = it.options?.[0] ?? '1';
            elapsed_ms[key] = 500;
          } else if (st.key === 'logical_schemas') {
            answers[key] = [...(it.concepts ?? [])];
          } else if (st.key === 'classification') {
            const words = it.words ?? [];
            answers[key] = [words[0] ?? '1', words[1] ?? '2'];
          } else if (st.key === 'numeric_series') {
            answers[key] = [1, 2];
          } else if (st.key === 'generalization') {
            answers[key] = 'тест';
          } else if (st.key === 'geometric_figures') {
            // No `options` on the wire (static image assets) — any letter is fine.
            answers[key] = 'А';
          } else {
            answers[key] = it.options?.[0] ?? '1';
          }
        });
        await asturApi.submitSubtest(
          assessmentId,
          st.number,
          st.key === 'lability' ? { answers, elapsed_ms } : { answers },
        );
      }
      useAssessmentStore.getState().setAsturCompleted(true);
    }
  } catch {
    // Ignore if already submitted or error
  }
}
