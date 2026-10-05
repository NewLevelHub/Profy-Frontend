import { ASSESSMENT_PHASE_MINUTES } from '@/shared/config/constants';

/**
 * Overall assessment progress across the four phases
 * (diagnostic → motivation → Belbin → АСТУР), each weighted by how long it
 * takes (`ASSESSMENT_PHASE_MINUTES`).
 *
 * Phase-local bars (0–100% then reset) and whole-phase stepping (0/25/50/75)
 * both read as chaotic: the resume card stays at 0% for the entire longest
 * phase, and the rail snaps back to 0% at every phase boundary. This helper
 * keeps a single monotonic 0–100 for the rail and the in-progress card.
 *
 * Weights follow time, not phase count (PRO-439): with four equal quarters
 * the ~40-minute diagnostic and the 12 motivation triplets each moved the bar
 * by 25%, so a student past half of the real time still saw 25% and then
 * watched it jump.
 */

export interface JourneyProgressInput {
  answeredCount: number;
  totalQuestions: number;
  motivationAnsweredCount: number;
  motivationTotal: number;
  /** 0–1 within Belbin; falls back to belbinCompleted when omitted. */
  belbinFraction?: number;
  belbinCompleted?: boolean;
  /** 0–1 within АСТУР; falls back to asturCompleted when omitted. */
  asturFraction?: number;
  asturCompleted?: boolean;
}

const TOTAL_MINUTES =
  ASSESSMENT_PHASE_MINUTES.diagnostic +
  ASSESSMENT_PHASE_MINUTES.motivation +
  ASSESSMENT_PHASE_MINUTES.belbin +
  ASSESSMENT_PHASE_MINUTES.astur;

function clamp01(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function phaseFraction(answered: number, total: number): number {
  if (total <= 0) return 0;
  return clamp01(answered / total);
}

type JourneyStageId = keyof typeof ASSESSMENT_PHASE_MINUTES;

export interface JourneyStage {
  id: JourneyStageId;
  /** 0–1 within this phase. */
  fraction: number;
}

/** The four phases in journey order, each with how far into it the student is. */
export function journeyStages(input: JourneyProgressInput): JourneyStage[] {
  return [
    { id: 'diagnostic', fraction: phaseFraction(input.answeredCount, input.totalQuestions) },
    { id: 'motivation', fraction: phaseFraction(input.motivationAnsweredCount, input.motivationTotal) },
    {
      id: 'belbin',
      fraction:
        input.belbinFraction !== undefined
          ? clamp01(input.belbinFraction)
          : input.belbinCompleted
            ? 1
            : 0,
    },
    {
      id: 'astur',
      fraction:
        input.asturFraction !== undefined
          ? clamp01(input.asturFraction)
          : input.asturCompleted
            ? 1
            : 0,
    },
  ];
}

export function journeyProgressPercent(input: JourneyProgressInput): number {
  const doneMinutes = journeyStages(input).reduce(
    (sum, stage) => sum + stage.fraction * ASSESSMENT_PHASE_MINUTES[stage.id],
    0,
  );
  return Math.round((doneMinutes / TOTAL_MINUTES) * 100);
}
