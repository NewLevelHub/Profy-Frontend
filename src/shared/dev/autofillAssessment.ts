import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';
import { pairsApi } from '@/shared/api/pairs';
import { belbinApi } from '@/shared/api/belbin';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import { ABILITIES_LIKERT_SCALE, KONDASH_ANXIETY_SCALE, YES_NO_SCALE } from '@/shared/config/constants';
import type {
  AsturContentSubtest,
  AsturItemAnswer,
  AsturSubtestKey,
  Instrument,
  Question,
  SubmitAsturSubtestPayload,
} from '@/shared/types';

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
 * randomValueForInstrument above — RIASEC/Big Five/ДДО-pairs get 1-5,
 * everything else gets its own real range), then every ДДО pair by picking
 * a random option — the main battery only,
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

/** Dev-only helper: `autofillMainBattery` plus motivation plus Belbin —
 * everything ahead of АСТУР — so a caller can land the tester ON the
 * АСТУР flow itself (e.g. to test IT by hand, or after adding a new
 * subtest) instead of racing through it too. Split out of
 * `autofillAssessment` the same way `autofillMainBattery` was split out of
 * this originally (see its own comment). */
export async function autofillToAstur(assessmentId: string): Promise<void> {
  await autofillMainBattery(assessmentId);

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

/** Dev-only: a shape-valid (not necessarily correct) АСТУР answer per item. */
function asturAutofillAnswer(subtestKey: AsturSubtestKey, item: Record<string, unknown>): unknown {
  switch (subtestKey) {
    case 'logical_schemas':
      return item.concepts;
    case 'classification':
      return (item.words as string[]).slice(0, 2);
    case 'numeric_series':
      return [1, 2];
    case 'geometric_figures':
      return 'А';
    case 'generalization':
      return 'ответ';
    default:
      return (item.options as string[] | undefined)?.[0] ?? '1';
  }
}

/** Dev-only: a whole subtest answered with shape-valid values. */
export function asturAutofillPayload(subtest: AsturContentSubtest): Omit<SubmitAsturSubtestPayload, 'run_id'> {
  const answers: Record<string, AsturItemAnswer> = {};
  const elapsed: Record<string, number> = {};
  subtest.items.forEach((item, i) => {
    answers[String(i + 1)] = {
      status: 'answered',
      value: asturAutofillAnswer(subtest.key, item as unknown as Record<string, unknown>),
    };
    elapsed[String(i + 1)] = 300;
  });
  return subtest.key === 'lability' ? { answers, elapsed_ms: elapsed } : { answers };
}

/** Dev-only helper: `autofillToAstur` plus АСТУР itself — the whole test
 * completes in a handful of requests instead of up to ~278 clicks. */
export async function autofillAssessment(assessmentId: string): Promise<void> {
  await autofillToAstur(assessmentId);

  try {
    const { run, content } = await asturApi.openAttempt(assessmentId);
    for (const st of content.subtests.filter((s) => !run.submitted_subtests.includes(s.key))) {
      await asturApi.startSubtest(assessmentId, st.number, run.run_id);
      await asturApi.submitSubtest(assessmentId, st.number, { ...asturAutofillPayload(st), run_id: run.run_id });
    }
    useAssessmentStore.getState().setAsturCompleted(true);
  } catch {
    // Ignore if already submitted or error
  }
}
