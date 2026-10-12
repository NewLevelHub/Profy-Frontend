import type { Instrument, Question, QuestionPair } from '@/shared/types';
import type { DisplayItem } from './buildDisplaySequence';

const LIKERT_PAGE_SIZE = 5;
// Pairs are batched like Likert questions: one pair per screen left a lone
// two-card row on an empty page, 20 times over. Klimov's ДДО is a single
// sheet of all its pairs on paper anyway.
const PAIR_PAGE_SIZE = 5;

export type Page =
  | { kind: 'likert'; questions: Question[]; instrument: Instrument }
  | { kind: 'pair'; pairs: QuestionPair[]; instrument: Instrument };

/**
 * Groups a flat likert+pair sequence into pages: up to LIKERT_PAGE_SIZE
 * consecutive Likert questions or PAIR_PAGE_SIZE consecutive pairs per page,
 * never mixing the two kinds or two instruments on the same page — a page
 * also flushes early when the next item's kind or instrument differs from
 * the buffer's, so every page can be tagged with exactly one `instrument`
 * (see useAssessment's instrument-intro screens, which key off that
 * boundary). Written order-agnostically (it just batches consecutive
 * same-kind runs) so it doesn't assume Likert always precedes pairs, even
 * though that's how buildDisplaySequence produces it today.
 */
export function buildPages(sequence: DisplayItem[]): Page[] {
  const pages: Page[] = [];
  let likertBuffer: Question[] = [];
  let pairBuffer: QuestionPair[] = [];

  const flushLikert = () => {
    if (likertBuffer.length > 0) {
      pages.push({ kind: 'likert', questions: likertBuffer, instrument: likertBuffer[0].instrument });
      likertBuffer = [];
    }
  };
  const flushPairs = () => {
    if (pairBuffer.length > 0) {
      pages.push({ kind: 'pair', pairs: pairBuffer, instrument: pairBuffer[0].instrument });
      pairBuffer = [];
    }
  };

  for (const item of sequence) {
    if (item.kind === 'likert') {
      flushPairs();
      const bufferInstrument = likertBuffer[0]?.instrument;
      if (bufferInstrument !== undefined && bufferInstrument !== item.question.instrument) {
        flushLikert();
      }
      likertBuffer.push(item.question);
      if (likertBuffer.length === LIKERT_PAGE_SIZE) flushLikert();
    } else {
      flushLikert();
      const bufferInstrument = pairBuffer[0]?.instrument;
      if (bufferInstrument !== undefined && bufferInstrument !== item.pair.instrument) {
        flushPairs();
      }
      pairBuffer.push(item.pair);
      if (pairBuffer.length === PAIR_PAGE_SIZE) flushPairs();
    }
  }
  flushLikert();
  flushPairs();

  return pages;
}

export function pageInstrument(page: Page): Instrument {
  return page.instrument;
}

/** The page opens its instrument: the first page overall, or the one right
 *  after a page of another instrument — where that test's intro card sits. */
export function isFirstPageOfInstrument(pages: Page[], index: number): boolean {
  const page = pages[index];
  if (!page) return false;
  return index === 0 || pageInstrument(pages[index - 1]) !== pageInstrument(page);
}

export function pageItemCount(page: Page): number {
  return page.kind === 'likert' ? page.questions.length : page.pairs.length;
}

/** How many items of the same section come before this page — so a page's
 *  question numbers continue the count (06, 07…) instead of restarting at
 *  01 on every page. The section is not the instrument: the main battery
 *  interleaves riasec/big_five items page by page, so `sectionOf` lumps
 *  those together and only splits off the standalone tests. */
export function itemsBeforePageInSection(
  pages: Page[],
  index: number,
  sectionOf: (instrument: Instrument) => string,
): number {
  const page = pages[index];
  if (!page) return 0;
  const section = sectionOf(pageInstrument(page));
  let count = 0;
  for (let i = index - 1; i >= 0 && sectionOf(pageInstrument(pages[i])) === section; i--) {
    count += pageItemCount(pages[i]);
  }
  return count;
}
