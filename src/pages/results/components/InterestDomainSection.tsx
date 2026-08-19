import { cn } from '@/shared/lib/cn';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { RiasecIcon, type RiasecType } from '@/shared/ui/icons/RiasecIcon';
import {
  RIASEC_LABELS,
  RIASEC_DESCRIPTIONS,
  MI_LABELS,
  MI_ICONS,
  MI_DESCRIPTIONS,
} from '@/shared/config/constants';
import type { InterestMapItem } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainGrid, DomainCell, LEVEL_STATUS_LABEL } from './DomainCardParts';

interface InterestDomainSectionProps {
  isJunior: boolean;
  interestMap: InterestMapItem[];
  interestMapNote: string;
}

type Level = InterestMapItem['level'];

// Icon color — the fill-contrast cell goes solid Pine at `high` and solid
// Dawn at `medium`, so both flip to --text-on-brand (readable on either
// fill) instead of a color-on-same-color icon. Muted #9A9287 (--text-
// subtle's exact light-mode value, dark-mode-safe via the token) for
// barely-present — the cell's own opacity-45 does the rest of the dimming.
const ICON_COLOR: Record<Level, string> = {
  high: 'var(--text-on-brand)',
  medium: 'var(--text-on-brand)',
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
function pickHeadlineItems(items: InterestMapItem[]): InterestMapItem[] {
  if (items.length === 0) return [];
  const leading = items.filter((i) => i.level === 'high');
  const pool = leading.length > 0 ? leading : items.filter((i) => i.level === 'medium');
  const picked = pool.length > 0 ? pool : items.slice(0, 1);
  return picked.slice(0, 2);
}

function buildHeadline(items: InterestMapItem[], labels: Record<string, string>): string {
  return pickHeadlineItems(items).map((i) => labels[i.code] ?? i.sphere).join(' + ');
}

/** "также заметно: {secondary types}" — medium-level types not already in the headline. */
function buildSecondaryNote(items: InterestMapItem[], labels: Record<string, string>): string {
  const leadingCodes = new Set(items.filter((i) => i.level === 'high').map((i) => i.code));
  const secondary = items.filter((i) => i.level === 'medium' && !leadingCodes.has(i.code));
  if (secondary.length === 0) return '';
  return secondary.map((i) => labels[i.code] ?? i.sphere).join(', ');
}

/**
 * The page's one "type identity" moment — RIASEC ("Карьерные интересы") for
 * middle/senior, MI ("Ведущие способности") for junior. The only place on
 * the results page besides PageHeader that uses `Heading` (display role),
 * since this is the single domain that actually has a rankable "type name"
 * to headline — Big Five (PersonalityDomainSection) never gets this
 * treatment, it has no ranking concept.
 */
export function InterestDomainSection({ isJunior, interestMap, interestMapNote }: InterestDomainSectionProps) {
  const labels = isJunior ? MI_LABELS : RIASEC_LABELS;
  const descriptions = isJunior ? MI_DESCRIPTIONS : RIASEC_DESCRIPTIONS;
  const headline = buildHeadline(interestMap, labels);
  const secondaryNote = buildSecondaryNote(interestMap, labels);

  return (
    <DomainCardFrame ariaLabel={isJunior ? 'Ведущие способности' : 'Карьерные интересы'}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <DomainKicker>
            {isJunior ? 'ВЕДУЩИЕ СПОСОБНОСТИ' : 'КАРЬЕРНЫЕ ИНТЕРЕСЫ'}
          </DomainKicker>
          {headline && (
            <Heading level="display-md" as="h2" className="text-[color:var(--midnight)]">
              {headline}
            </Heading>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {secondaryNote && (
            <p className="font-mono text-mono-xs text-right leading-snug max-w-[220px]" style={{ color: 'var(--ink)' }}>
              Также заметно: {secondaryNote}
            </p>
          )}
          <Mascot state="completion" size={46} />
        </div>
      </div>

      {interestMap.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-caption leading-relaxed" style={{ color: 'var(--ink)' }}>
            Ниже — {isJunior ? 'восемь направлений интересов' : 'шесть типов интересов'}: у каждого
            своя окраска — от «ведущее» (это ближе всего) до «почти не проявилось».{' '}
            {headline && <>Выделенные — <strong className="font-semibold">{headline}</strong> — твоя карта интересов.</>}
          </p>
          <DomainGrid
            columnsClassName={isJunior ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}
          >
            {interestMap.map((item) => (
              <DomainCell
                key={item.code}
                icon={<TypeIcon item={item} isJunior={isJunior} />}
                title={item.sphere}
                status={LEVEL_STATUS_LABEL[item.level]}
                description={descriptions[item.code]}
                level={item.level}
              />
            ))}
          </DomainGrid>
          {interestMapNote && (
            <p className="text-caption leading-relaxed" style={{ color: 'var(--ink)' }}>{interestMapNote}</p>
          )}
        </div>
      )}
    </DomainCardFrame>
  );
}

// MI (junior) has no pictogram set analogous to RiasecIcon — the emoji set
// (MI_ICONS) is the junior-appropriate icon per the earlier MI work, not a
// literal RIASEC re-skin. Since emoji glyphs carry their own fixed color,
// the leading/noticeable/barely-present distinction is expressed via the
// badge background instead of recoloring the glyph itself. `high`/`medium`
// both get a translucent white badge now — their cells are solid Pine/Dawn
// fills, so a same-hue badge would disappear into the fill.
function TypeIcon({ item, isJunior }: { item: InterestMapItem; isJunior: boolean }) {
  if (isJunior) {
    return (
      <span
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center text-lg select-none',
          (item.level === 'high' || item.level === 'medium') && 'bg-white/25',
          item.level === 'low' && 'bg-surface border border-default',
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
