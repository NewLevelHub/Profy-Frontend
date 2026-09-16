import { REPORT_SECTIONS } from '@/shared/api/feedback';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import type { AdminFeedbackListItem, AgeGroup } from '@/shared/types';

/**
 * Everything this screen needs to turn raw feedback rows into readable
 * groupings — kept out of the page so the summary block and the table read the
 * same numbers from the same functions.
 *
 * The grouping mirrors `admin_service._breakdown` exactly (group by key, count,
 * mean score), so the figures shown here are the figures
 * `GET /admin/feedback/stats` would return for the same rows — the page just
 * computes them over the set the filters left, which the endpoint cannot do.
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

const SECTION_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  REPORT_SECTIONS.map((section) => [section.value, section.labelKey]),
);

/**
 * One-word names for the table, where the full ones don't fit.
 *
 * "Профессии и направления" wrapped onto two lines inside a table cell, which
 * pushed a row with four picked sections to five lines tall while its neighbour
 * stayed at one. The full names live in the summary above the table, which is
 * where they read as a legend.
 */
const SECTION_SHORT_LABEL_KEYS: Record<string, string> = {
  interests: 'admin:feedback.sectionShort.interests',
  personality: 'admin:feedback.sectionShort.personality',
  careers: 'admin:feedback.sectionShort.careers',
  thinking_style: 'admin:feedback.sectionShort.thinking_style',
  motivation: 'admin:feedback.sectionShort.motivation',
};

/** Falls back to the raw key: sections are free-form strings server-side, so a
 *  section retired from `REPORT_SECTIONS` still has rows pointing at it. */
export function sectionLabel(key: string, t: (key: string) => string): string {
  const labelKey = SECTION_LABEL_KEYS[key];
  return labelKey ? t(labelKey) : key;
}

export function sectionShortLabel(key: string, t: (key: string) => string): string {
  const labelKey = SECTION_SHORT_LABEL_KEYS[key];
  return labelKey ? t(labelKey) : sectionLabel(key, t);
}

/** Tiers in age order, not the alphabetical order the API returns them in. */
export const AGE_ORDER: AgeGroup[] = ['junior', 'middle', 'senior'];

/** Mirrors `compute_age_group` in app/models/profile.py. */
export const AGE_RANGE_HINT: Record<AgeGroup, string> = {
  junior: 'admin:feedback.age.junior',
  middle: 'admin:feedback.age.middle',
  senior: 'admin:feedback.age.senior',
};

export function ageLabel(key: string): string {
  return AGE_TIER_LABELS[key as AgeGroup] ?? key;
}

/** A/B/C are the report scenarios the goal maps onto — opaque on their own. */
export const SCENARIO_LABELS: Record<string, string> = {
  A: 'admin:feedback.goal.A',
  B: 'admin:feedback.goal.B',
  C: 'admin:feedback.goal.C',
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

/** Group + mean score, the same shape the backend's `_breakdown` produces. */
export function breakdown(
  items: readonly AdminFeedbackListItem[],
  keyOf: (item: AdminFeedbackListItem) => string | null,
  labelOf: (key: string) => string = (key) => key,
): Bucket[] {
  const groups = new Map<string, number[]>();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) continue;
    const scores = groups.get(key);
    if (scores) scores.push(item.relevance_score);
    else groups.set(key, [item.relevance_score]);
  }
  return [...groups.entries()].map(([key, scores]) => ({
    key,
    label: labelOf(key),
    count: scores.length,
    avg: scores.reduce((sum, score) => sum + score, 0) / scores.length,
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
 * a missing 1★ bar and a 1★ bar of zero say different things.
 */
export function scoreDistribution(items: readonly AdminFeedbackListItem[]): ScoreBar[] {
  const counts = new Map<number, number>();
  for (const item of items) {
    counts.set(item.relevance_score, (counts.get(item.relevance_score) ?? 0) + 1);
  }
  return SCORES.map((score) => ({
    score,
    count: counts.get(score) ?? 0,
    share: items.length > 0 ? (counts.get(score) ?? 0) / items.length : 0,
  }));
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
export function sectionTally(items: readonly AdminFeedbackListItem[], t: (key: string) => string): SectionTally[] {
  const counts = new Map<string, number>();
  for (const section of REPORT_SECTIONS) counts.set(section.value, 0);
  for (const item of items) {
    for (const key of item.helpful_sections) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: sectionLabel(key, t),
      count,
      share: items.length > 0 ? count / items.length : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ru'));
}

export function averageScore(items: readonly AdminFeedbackListItem[]): number | null {
  if (items.length === 0) return null;
  return items.reduce((sum, item) => sum + item.relevance_score, 0) / items.length;
}

export function countLowScores(items: readonly AdminFeedbackListItem[]): number {
  return items.filter((item) => item.relevance_score <= LOW_SCORE_MAX).length;
}

export function countHighScores(items: readonly AdminFeedbackListItem[]): number {
  return items.filter((item) => item.relevance_score >= HIGH_SCORE_MIN).length;
}

export function countWithComment(items: readonly AdminFeedbackListItem[]): number {
  return items.filter((item) => Boolean(item.comment?.trim())).length;
}
