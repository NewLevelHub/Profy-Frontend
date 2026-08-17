import { cn } from '@/shared/lib/cn';
import { Mascot } from '@/shared/ui/Mascot';
import { RiasecIcon, type RiasecType } from '@/shared/ui/icons/RiasecIcon';
import { RIASEC_LABELS, MI_LABELS, MI_ICONS } from '@/shared/config/constants';
import type {
  InterestMapItem,
  StrengthCard,
  StudentPersonalityNote,
  ThinkingStyleNote,
} from '@/shared/types';

interface SharedDiagnosticCardProps {
  isJunior: boolean;
  interestMap: InterestMapItem[];
  interestMapNote: string;
  strengthCards: StrengthCard[];
  personalityNotes: StudentPersonalityNote[];
  personalityNote: string;
  thinkingStyleNotes: ThinkingStyleNote[];
  motivationHighlights: string[];
}

type Level = InterestMapItem['level'];

// Status word under each type-grid cell (design spec §06). Deliberately its
// own vocabulary, not a reuse of INTEREST_LEVEL_LABELS (used elsewhere on
// this page for the same low/medium/high enum with different copy) — this
// component owns the exact strings the spec calls for.
const STATUS_LABEL: Record<Level, string> = {
  high: 'ВЕДУЩЕЕ',
  medium: 'ЗАМЕТНО',
  low: 'ПОЧТИ НЕ ПРОЯВИЛОСЬ',
};

// Status-word color — Pine for leading, ink for noticeable, the standard
// "mute" text token for barely-present (spec: "(mute)", generic).
const STATUS_COLOR: Record<Level, string> = {
  high: 'var(--pine)',
  medium: 'var(--ink)',
  low: 'var(--text-muted)',
};

// Icon color — a different mapping than the status word (spec: "colored
// Dawn+bold-stroke for the leading type, ink for other noticeable types,
// muted #9A9287 for barely-present"). #9A9287 is var(--text-subtle)'s exact
// light-mode value — using the token instead of the literal hex keeps this
// correct in dark mode too.
const ICON_COLOR: Record<Level, string> = {
  high: 'var(--dawn)',
  medium: 'var(--ink)',
  low: 'var(--text-subtle)',
};

/**
 * Builds the "leading type in words" headline (design spec §06). Never a
 * RIASEC letter or MI code — always the human-readable label/sphere name.
 * `level` is the only ranking signal the result-v2 contract gives us (§5,
 * opaque low/medium/high, no underlying score) — "leading" here means every
 * item at `level: 'high'`, which is how the spec's leading-tie case (two
 * types marked ВЕДУЩЕЕ at once) falls out naturally, no tie-break logic
 * needed. Falls back to `medium` items, then the first item, if nothing is
 * `high` (a flat/low profile is legitimate per contract §8).
 *
 * The mockup's exact phrasing ("Исследующий с сильной артистической
 * частью") is hand-authored NLG the backend doesn't supply — RIASEC_LABELS/
 * MI_LABELS are plain nominative-case labels, not declinable sentence
 * fragments — so a tie is rendered as "{Label} + {Label}" rather than
 * attempting Russian case agreement from data that isn't there.
 */
function buildHeadline(items: InterestMapItem[], labels: Record<string, string>): string {
  if (items.length === 0) return '';
  const leading = items.filter((i) => i.level === 'high');
  const pool = leading.length > 0 ? leading : items.filter((i) => i.level === 'medium');
  const picked = pool.length > 0 ? pool : items.slice(0, 1);
  return picked.slice(0, 2).map((i) => labels[i.code] ?? i.sphere).join(' + ');
}

/** "также заметно: {secondary types}" — medium-level types not already in the headline. */
function buildSecondaryNote(items: InterestMapItem[], labels: Record<string, string>): string {
  const leadingCodes = new Set(items.filter((i) => i.level === 'high').map((i) => i.code));
  const secondary = items.filter((i) => i.level === 'medium' && !leadingCodes.has(i.code));
  if (secondary.length === 0) return '';
  return secondary.map((i) => labels[i.code] ?? i.sphere).join(', ');
}

interface FindingColumn {
  key: string;
  kicker: string;
  accent?: boolean;
  finding: string;
  detail: string;
}

/**
 * The shared diagnostic block's card (design spec §06) — identical
 * regardless of goal, rendered once above the goal-branch update boundary.
 * Replaces what used to be five separate stacked full-width sections
 * (StrengthCardsSection/InterestMapSection/PersonalitySection/
 * ThinkingStyleSection/MotivationSection) with the spec's single
 * Fog-bordered card: kicker+headline header, a 6-column (8 for MI/junior)
 * type grid, and a 5-column strength-summary row. Each list field
 * (strength_cards, thinking_style_notes, personality_notes,
 * motivation_highlights) can carry more items than the compact row shows —
 * per contract these are already backend-ordered by relevance, so the first
 * item stands in as the row's "headline finding"; this is a deliberate
 * compression to a scannable at-a-glance strip, not a bug.
 */
export function SharedDiagnosticCard({
  isJunior,
  interestMap,
  interestMapNote,
  strengthCards,
  personalityNotes,
  personalityNote,
  thinkingStyleNotes,
  motivationHighlights,
}: SharedDiagnosticCardProps) {
  const labels = isJunior ? MI_LABELS : RIASEC_LABELS;
  const headline = buildHeadline(interestMap, labels);
  const secondaryNote = buildSecondaryNote(interestMap, labels);
  const leadingInterest = interestMap.find((i) => i.level === 'high') ?? interestMap[0];

  const columns: FindingColumn[] = [
    {
      key: 'strength',
      kicker: 'СИЛЬНАЯ СТОРОНА',
      accent: true,
      finding: strengthCards[0]?.title ?? 'Пока не выделено',
      detail: strengthCards[0]?.description ?? 'Появится по мере новых ответов.',
    },
    {
      key: 'interests',
      kicker: 'КАРТА ИНТЕРЕСОВ',
      finding: leadingInterest?.sphere ?? 'Пока не выделено',
      detail: interestMapNote || 'Карта интересов пока формируется.',
    },
    {
      key: 'thinking',
      kicker: 'СТИЛЬ МЫШЛЕНИЯ',
      finding: thinkingStyleNotes[0]?.title ?? 'Пока не выделено',
      detail: thinkingStyleNotes[0]?.description ?? 'Появится по мере новых ответов.',
    },
    {
      key: 'personality',
      kicker: 'ЛИЧНОСТЬ',
      finding: personalityNotes[0]?.label ?? 'Пока не выделено',
      detail: personalityNote || personalityNotes[0]?.description || '',
    },
    {
      key: 'motivation',
      kicker: 'МОТИВАЦИЯ',
      finding: motivationHighlights[0] ?? 'Пока не выделено',
      detail: motivationHighlights[1] ?? '',
    },
  ];

  return (
    <div
      className="border border-strong rounded-[var(--radius)] bg-page p-5 sm:p-6 flex flex-col gap-6"
      aria-label="Общая диагностика"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[.06em] text-muted mb-2">
            {isJunior ? 'ОБЩАЯ ДИАГНОСТИКА' : 'ОБЩАЯ ДИАГНОСТИКА · ОДИНАКОВА ВО ВСЕХ ТРЁХ СЦЕНАРИЯХ'}
          </p>
          {headline && (
            <h2
              className="font-display font-semibold tracking-[-0.025em] text-[color:var(--midnight)] leading-tight"
              style={{ fontSize: 32 }}
            >
              {headline}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {secondaryNote && (
            <p className="font-mono text-[11px] text-muted text-right leading-snug max-w-[220px]">
              также заметно: {secondaryNote}
            </p>
          )}
          <Mascot state="completion" size={46} />
        </div>
      </div>

      {interestMap.length > 0 && (
        <div
          className={cn(
            'grid gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden',
            isJunior ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
          )}
        >
          {interestMap.map((item) => (
            <TypeCell key={item.code} item={item} isJunior={isJunior} />
          ))}
        </div>
      )}

      {/* 5 items don't divide evenly into 2 or 3 columns, so a mid-tier
         grid-cols-2/3 step leaves an empty trailing cell that renders as a
         bare hairline-colored box (looks like missing content) — jump
         straight from a single column to the full 5-column row instead. */}
      <div className="grid gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden grid-cols-1 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.key} className="bg-surface p-4 flex flex-col gap-1.5">
            <p
              className={cn(
                'font-mono text-[10px] font-bold uppercase tracking-[.06em]',
                col.accent ? 'text-accent' : 'text-muted',
              )}
            >
              {col.kicker}
            </p>
            <p
              className="font-display font-semibold text-[color:var(--midnight)] leading-snug line-clamp-1"
              style={{ fontSize: 17 }}
            >
              {col.finding}
            </p>
            {col.detail && (
              <p className="text-caption text-muted leading-snug line-clamp-1">{col.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeCell({ item, isJunior }: { item: InterestMapItem; isJunior: boolean }) {
  return (
    <div className="bg-surface p-3 sm:p-4 flex flex-col items-center text-center gap-1.5">
      <TypeIcon item={item} isJunior={isJunior} />
      <p className="text-[14px] font-semibold text-[color:var(--midnight)] leading-snug line-clamp-2">
        {item.sphere}
      </p>
      <p
        className="font-mono uppercase tracking-[.06em]"
        style={{ fontSize: 10, color: STATUS_COLOR[item.level] }}
      >
        {STATUS_LABEL[item.level]}
      </p>
    </div>
  );
}

// MI (junior) has no pictogram set analogous to RiasecIcon — the emoji set
// (MI_ICONS) is the junior-appropriate icon per the earlier MI work, not a
// literal RIASEC re-skin. Since emoji glyphs carry their own fixed color,
// the leading/noticeable/barely-present distinction is expressed via the
// badge background instead of recoloring the glyph itself.
function TypeIcon({ item, isJunior }: { item: InterestMapItem; isJunior: boolean }) {
  if (isJunior) {
    return (
      <span
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center text-lg select-none',
          item.level === 'high' && 'bg-accent-soft',
          item.level === 'medium' && 'bg-brand-subtle',
          item.level === 'low' && 'bg-surface border border-default opacity-60',
        )}
        aria-hidden="true"
      >
        {MI_ICONS[item.code] ?? '🧭'}
      </span>
    );
  }
  return (
    <RiasecIcon
      type={item.code as RiasecType}
      size={32}
      strokeWidth={item.level === 'high' ? 2.25 : 1.75}
      style={{ color: ICON_COLOR[item.level] }}
    />
  );
}
