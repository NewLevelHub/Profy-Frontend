import { Trans, useTranslation } from 'react-i18next';
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
import { buildHeadline, buildSecondaryNote } from '../utils/interestHeadline';
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
 * The page's one "type identity" moment — RIASEC ("Карьерные интересы") for
 * middle/senior, MI ("Ведущие способности") for junior. The only place on
 * the results page besides PageHeader that uses `Heading` (display role),
 * since this is the single domain that actually has a rankable "type name"
 * to headline — Big Five (PersonalityDomainSection) never gets this
 * treatment, it has no ranking concept.
 */
export function InterestDomainSection({ isJunior, interestMap, interestMapNote }: InterestDomainSectionProps) {
  const { t } = useTranslation();
  const labelKeys = isJunior ? MI_LABELS : RIASEC_LABELS;
  const descriptionKeys = isJunior ? MI_DESCRIPTIONS : RIASEC_DESCRIPTIONS;
  // Resolve the i18n key maps to display text once, so the pure headline
  // helpers keep taking a plain code -> string record.
  const labels = Object.fromEntries(
    Object.entries(labelKeys).map(([code, key]) => [code, t(key)]),
  ) as Record<string, string>;
  const descriptions = Object.fromEntries(
    Object.entries(descriptionKeys).map(([code, key]) => [code, t(key)]),
  ) as Record<string, string>;
  const headline = buildHeadline(interestMap, labels);
  const secondaryNote = buildSecondaryNote(interestMap, labels);

  return (
    <DomainCardFrame ariaLabel={t(isJunior ? 'results:interestDomain.ariaMi' : 'results:interestDomain.ariaRiasec')}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <DomainKicker>
            {t(isJunior ? 'results:interestDomain.kickerMi' : 'results:interestDomain.kickerRiasec')}
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
              {t('results:interestDomain.alsoNotable', { items: secondaryNote })}
            </p>
          )}
          <Mascot state="completion" size={68} celebrate />
        </div>
      </div>

      {interestMap.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-caption leading-relaxed" style={{ color: 'var(--ink)' }}>
            {t('results:interestDomain.legendIntro', {
              kinds: t(isJunior ? 'results:interestDomain.kindsMi' : 'results:interestDomain.kindsRiasec'),
            })}
            {headline && (
              <Trans
                i18nKey="results:interestDomain.legendHighlight"
                values={{ headline }}
                components={{ 1: <strong className="font-semibold" /> }}
              />
            )}
          </p>
          <DomainGrid
            columnsClassName={isJunior ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}
          >
            {interestMap.map((item) => (
              <DomainCell
                key={item.code}
                icon={<TypeIcon item={item} isJunior={isJunior} />}
                title={item.sphere}
                status={t(LEVEL_STATUS_LABEL[item.level])}
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
