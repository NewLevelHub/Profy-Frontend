import { REPORT_SECTIONS } from '@/shared/api/feedback';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import type { AdminFeedbackStatsResponse, AgeGroup } from '@/shared/types';

/**
 * Labels and shapes for the feedback summary.
 *
 * The aggregates themselves come from `GET /admin/feedback/stats`, which now
 * takes the same filters as the list — so the summary describes exactly the
 * rows the table is showing. This file used to recompute all of it in the
 * browser from a fully downloaded feed, because the endpoint could only ever
 * describe the whole table; the adapters below just reshape the server's
 * answer for the components.
 */

export const MAX_SCORE = 5;
export const SCORES = [5, 4, 3, 2, 1] as const;

/** "Low" is the actionable half of the scale: these are the reviews to read. */
export const LOW_SCORE_MAX = 2;
export const HIGH_SCORE_MIN = 4;

/**
 * One colour per score, used by both the histogram and the in-row meter — a 5
 * that is pine in the table and lake in the chart above it is two encodings of
 * the same number on one screen.
 *
 * Dawn is the "finding" accent, not an error: a student saying "this isn't me"
 * is the signal this screen exists to surface. Clay stays reserved for genuine
 * failures, per DESIGN.md.
 */
export function scoreTone(score: number): string {
  if (score >= HIGH_SCORE_MIN) return 'var(--pine)';
  if (score <= LOW_SCORE_MAX) return 'var(--dawn)';
  return 'var(--lake)';
}

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  REPORT_SECTIONS.map((section) => [section.value, section.label]),
);

/**
 * One-word names for the table, where the full ones don't fit.
 *
 * "Профессии и направления" wrapped onto two lines inside a table cell, which
 * pushed a row with four picked sections to five lines tall while its neighbour
 * stayed at one. The full names live in the summary above the table, which is
 * where they read as a legend.
 */
const SECTION_SHORT_LABELS: Record<string, string> = {
  interests: 'Интересы',
  personality: 'Характер',
  careers: 'Профессии',
  thinking_style: 'Мышление',
  motivation: 'Мотивация',
};

/** Falls back to the raw key: sections are free-form strings server-side, so a
 *  section retired from `REPORT_SECTIONS` still has rows pointing at it. */
export function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key;
}

export function sectionShortLabel(key: string): string {
  return SECTION_SHORT_LABELS[key] ?? sectionLabel(key);
}

/** Tiers in age order, not the alphabetical order the API returns them in. */
export const AGE_ORDER: AgeGroup[] = ['junior', 'middle', 'senior'];

/** Mirrors `compute_age_group` in app/models/profile.py. */
export const AGE_RANGE_HINT: Record<AgeGroup, string> = {
  junior: 'до 9 лет',
  middle: '10–13 лет',
  senior: '14 лет и старше',
};

export function ageLabel(key: string): string {
  return AGE_TIER_LABELS[key as AgeGroup] ?? key;
}

/** A/B/C are the report scenarios the goal maps onto — opaque on their own. */
export const SCENARIO_LABELS: Record<string, string> = {
  A: 'A · исследовать',
  B: 'B · выбрать профессию',
  C: 'C · поступить в вуз',
};

export function scenarioLabel(key: string): string {
  return SCENARIO_LABELS[key] ?? key;
}

export interface Bucket {
  key: string;
  label: string;
  count: number;
  avg: number;
}

/** One `FeedbackBreakdownItem` from the API, labelled for display. */
export function toBuckets(
  rows: AdminFeedbackStatsResponse['by_age_group'],
  labelOf: (key: string) => string = (key) => key,
): Bucket[] {
  return rows.map((row) => ({
    key: row.key,
    label: labelOf(row.key),
    count: row.count,
    avg: row.avg_relevance_score,
  }));
}

export interface ScoreBar {
  score: number;
  count: number;
  /** 0–1 of all reviews in the set. */
  share: number;
}

/**
 * The 5→1 histogram.
 *
 * An average alone hides the shape that matters: "4.0" reads the same whether
 * everyone said 4 or half said 5 and half said 3, and it was the only figure
 * this screen showed. Every score is always present, including the zero rows —
 * a missing 1★ bar and a 1★ bar of zero say different things, and the server
 * returns all five keys for the same reason.
 */
export function scoreDistribution(stats: AdminFeedbackStatsResponse): ScoreBar[] {
  return SCORES.map((score) => {
    const count = stats.score_counts[String(score)] ?? 0;
    return { score, count, share: stats.total > 0 ? count / stats.total : 0 };
  });
}

/** Reviews scoring 1–2 / 4–5, summed off the histogram. */
export function countInScoreBand(
  stats: AdminFeedbackStatsResponse,
  from: number,
  to: number,
): number {
  let total = 0;
  for (let score = from; score <= to; score += 1) {
    total += stats.score_counts[String(score)] ?? 0;
  }
  return total;
}

export interface SectionTally {
  key: string;
  label: string;
  count: number;
  /** 0–1 of reviews that named this section. */
  share: number;
}

/**
 * How often each report section was called useful.
 *
 * Sections nobody picked stay in the list at zero — "this section helps no one"
 * is the finding, and dropping the row hides it. The previous version showed
 * only the top four, so the weakest section was never visible.
 */
export function sectionTally(stats: AdminFeedbackStatsResponse): SectionTally[] {
  // Every known section starts at zero: the server only reports sections that
  // someone actually picked, and "this section helps no one" is precisely the
  // finding a missing row would hide.
  const counts = new Map<string, number>();
  for (const section of REPORT_SECTIONS) counts.set(section.value, 0);
  for (const [key, count] of Object.entries(stats.helpful_section_counts)) {
    counts.set(key, count);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: sectionLabel(key),
      count,
      share: stats.total > 0 ? count / stats.total : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ru'));
}
