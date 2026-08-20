import type { Question, QuestionPair } from '@/shared/types';
import type { DisplayItem } from './buildDisplaySequence';

export const LIKERT_PAGE_SIZE = 5;

export type Page =
  | { kind: 'likert'; questions: Question[] }
  | { kind: 'pair'; pair: QuestionPair };

/**
 * Groups a flat likert+pair sequence into pages: up to LIKERT_PAGE_SIZE
 * consecutive Likert questions per page, one pair per page. Written
 * order-agnostically (it just batches consecutive same-kind runs) so it
 * doesn't assume Likert always precedes pairs, even though that's how
 * buildDisplaySequence produces it today.
 */
export function buildPages(sequence: DisplayItem[]): Page[] {
  const pages: Page[] = [];
  let likertBuffer: Question[] = [];

  const flushLikert = () => {
    if (likertBuffer.length > 0) {
      pages.push({ kind: 'likert', questions: likertBuffer });
      likertBuffer = [];
    }
  };

  for (const item of sequence) {
    if (item.kind === 'likert') {
      likertBuffer.push(item.question);
      if (likertBuffer.length === LIKERT_PAGE_SIZE) flushLikert();
    } else {
      flushLikert();
      pages.push({ kind: 'pair', pair: item.pair });
    }
  }
  flushLikert();

  return pages;
}
