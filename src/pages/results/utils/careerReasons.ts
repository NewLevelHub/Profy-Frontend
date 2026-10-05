import type { StudentCareer, StudentFitReason } from '@/shared/types';

function reasonCore(text: string): string {
  return text.trim().replace(/\.$/, '').toLowerCase();
}

/** The reasons `why` doesn't already say. The backend folds the first
 *  reasons into the `why` synthesis, so a list right under it shows only
 *  the rest — matched by text, not by a fixed count. The AI analysis's text
 *  for the best match covers them all. */
export function reasonsBeyondWhy(career: StudentCareer): StudentFitReason[] {
  if (career.why_by_ai) return [];
  const why = career.why.toLowerCase();
  return career.fit_reasons.filter((reason) => !why.includes(reasonCore(reason.text)));
}
