import { RIASEC_LABELS } from '@/shared/config/constants';
import type { CareerMatch } from '@/shared/types';

function joinRu(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} и ${items[items.length - 1]}`;
}

/** RIASEC letters the student's own code shares with a career's own code —
 * these two codes are independent (career.holland_code is the profession's
 * fixed code, not derived from the student), so showing them side by side
 * ("ТВОЙ КОД — CIA" next to "Код направления — RCI") reads as a mismatch
 * even on a strong match. Showing the overlap instead makes the fit legible.
 * `userCode` is typed string[] because AnalysisResultResponse.code holds
 * MIType keys for junior — but junior never has careers, so this only ever
 * runs with real RIASEC letters in practice. */
export function matchedLetters(userCode: string[], career: CareerMatch): string[] {
  return userCode.filter(letter => career.holland_code.includes(letter));
}

export function describeCareerFit(userCode: string[], career: CareerMatch): string {
  const matched = matchedLetters(userCode, career);
  if (matched.length === 0) {
    return `Совпадение с твоим профилем: ${career.match_score} из 6.`;
  }
  const labels = matched.map(letter => RIASEC_LABELS[letter]);
  return `Совпадает по твоим сильным сторонам: ${joinRu(labels)}. Профиль совпадает на ${career.match_score} из 6.`;
}
