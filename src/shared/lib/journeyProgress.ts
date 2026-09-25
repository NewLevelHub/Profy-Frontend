/**
 * Overall assessment progress across the four phases
 * (diagnostic → motivation → Belbin → АСТУР), each weighted equally.
 *
 * Phase-local bars (0–100% then reset) and whole-phase stepping (0/25/50/75)
 * both read as chaotic: the resume card stays at 0% for the entire longest
 * phase, and the rail snaps back to 0% at every phase boundary. This helper
 * keeps a single monotonic 0–100 for the rail and the in-progress card.
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

const PHASE_COUNT = 4;

function clamp01(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function phaseFraction(answered: number, total: number): number {
  if (total <= 0) return 0;
  return clamp01(answered / total);
}

export function journeyProgressPercent(input: JourneyProgressInput): number {
  const diagnostic = phaseFraction(input.answeredCount, input.totalQuestions);
  const motivation = phaseFraction(input.motivationAnsweredCount, input.motivationTotal);
  const belbin =
    input.belbinFraction !== undefined
      ? clamp01(input.belbinFraction)
      : input.belbinCompleted
        ? 1
        : 0;
  const astur =
    input.asturFraction !== undefined
      ? clamp01(input.asturFraction)
      : input.asturCompleted
        ? 1
        : 0;

  return Math.round(((diagnostic + motivation + belbin + astur) / PHASE_COUNT) * 100);
}
