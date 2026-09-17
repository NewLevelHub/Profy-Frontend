import type { Instrument, Question, QuestionPair } from '@/shared/types';
import type { DisplayItem } from './buildDisplaySequence';

export const LIKERT_PAGE_SIZE = 5;

export type Page =
  | { kind: 'likert'; questions: Question[]; instrument: Instrument }
  | { kind: 'pair'; pair: QuestionPair };

/**
 * Groups a flat likert+pair sequence into pages: up to LIKERT_PAGE_SIZE
 * consecutive Likert questions per page, one pair per page, and never mixing
 * two instruments on the same page — a page also flushes early when the next
 * question's instrument differs from the buffer's, so every page can be
 * tagged with exactly one `instrument` (see useAssessment's instrument-intro
 * screens, which key off that boundary). Written order-agnostically (it just
 * batches consecutive same-kind runs) so it doesn't assume Likert always
 * precedes pairs, even though that's how buildDisplaySequence produces it
 * today.
 */
export function buildPages(sequence: DisplayItem[]): Page[] {
  const pages: Page[] = [];
  let likertBuffer: Question[] = [];

  const flushLikert = () => {
    if (likertBuffer.length > 0) {
      pages.push({ kind: 'likert', questions: likertBuffer, instrument: likertBuffer[0].instrument });
      likertBuffer = [];
    }
  };

  for (const item of sequence) {
    if (item.kind === 'likert') {
      const bufferInstrument = likertBuffer[0]?.instrument;
      if (bufferInstrument !== undefined && bufferInstrument !== item.question.instrument) {
        flushLikert();
      }
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

export function pageInstrument(page: Page): Instrument {
  return page.kind === 'likert' ? page.instrument : page.pair.instrument;
}

export function pageItemCount(page: Page): number {
  return page.kind === 'likert' ? page.questions.length : 1;
}
