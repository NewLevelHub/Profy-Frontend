import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { RiasecIcon, type RiasecType } from '@/shared/ui/icons/RiasecIcon';
import { RIASEC_LABELS, RIASEC_DESCRIPTIONS } from '@/shared/config/constants';
import type { InterestCombination, InterestMapItem, InterestMapItemDetails } from '@/shared/types';
import { buildHeadline, buildSecondaryNote } from '../utils/interestHeadline';
import { DomainCardFrame, DomainKicker, DomainGrid, DomainCell, LEVEL_STATUS_LABEL } from './DomainCardParts';
import { InterestTypeDetail } from './InterestTypeDetail';
import { InterestHowItWorks } from './InterestHowItWorks';

interface InterestDomainSectionProps {
  interestMap: InterestMapItem[];
  interestMapNote: string;
  interestCombination?: InterestCombination | null;
}

type Level = InterestMapItem['level'];
type DetailedItem = InterestMapItem & { details: InterestMapItemDetails };

// Icon color — the fill-contrast cell goes solid Pine at `high` and solid
// Dawn at `medium`, so both flip to --text-on-brand (readable on either
// fill) instead of a color-on-same-color icon. Muted --text-subtle for
// barely-present — the cell's own opacity-45 does the rest of the dimming.
const ICON_COLOR: Record<Level, string> = {
  high: 'var(--text-on-brand)',
  medium: 'var(--text-on-brand)',
  low: 'var(--text-subtle)',
};

const hasDetails = (item: InterestMapItem): item is DetailedItem => Boolean(item.details);

/**
 * The page's one "type identity" moment — RIASEC ("Карьерные интересы"). The only place on
 * the results page besides PageHeader that uses `Heading` (display role),
 * since this is the single domain that actually has a rankable "type name"
 * to headline — Big Five (PersonalityDomainSection) never gets this
 * treatment, it has no ranking concept.
 *
 * RIASEC reports carrying `details` (PRO-336) turn each cell into a toggle:
 * the selected type's "why" breakdown opens under the grid, and a closing
 * block explains how levels are computed and how the top types combine.
 * Older cached reports without `details` render as before.
 */
export function InterestDomainSection({
  interestMap,
  interestMapNote,
  interestCombination = null,
}: InterestDomainSectionProps) {
  const { t } = useTranslation();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const labelKeys = RIASEC_LABELS;
  const descriptionKeys = RIASEC_DESCRIPTIONS;
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

  const detailed = interestMap.some(hasDetails);
  const selected = detailed
    ? interestMap.filter(hasDetails).find((i) => i.code === selectedCode) ?? interestMap.find(hasDetails)
    : undefined;

  return (
    <DomainCardFrame ariaLabel={t('results:interestDomain.ariaRiasec')}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <DomainKicker>
            {t('results:interestDomain.kickerRiasec')}
          </DomainKicker>
          {headline && (
            <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)] text-balance">
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
            {detailed ? (
              <>
                {t('results:interestDetail.legendIntro', {
                  kinds: t('results:interestDomain.kindsRiasec'),
                })}
                <Trans
                  i18nKey="results:interestDetail.legendAction"
                  components={{ 1: <strong className="font-semibold" /> }}
                />
              </>
            ) : (
              <>
                {t('results:interestDomain.legendIntro', {
                  kinds: t('results:interestDomain.kindsRiasec'),
                })}
                {headline && (
                  <Trans
                    i18nKey="results:interestDomain.legendHighlight"
                    values={{ headline }}
                    components={{ 1: <strong className="font-semibold" /> }}
                  />
                )}
              </>
            )}
          </p>
          <DomainGrid columnsClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {interestMap.map((item) => {
              const isSelected = selected?.code === item.code;
              return (
                <DomainCell
                  key={item.code}
                  icon={<TypeIcon item={item} />}
                  title={item.sphere}
                  status={t(LEVEL_STATUS_LABEL[item.level])}
                  description={detailed ? undefined : descriptions[item.code]}
                  level={item.level}
                  selected={isSelected}
                  onSelect={detailed && item.details ? () => setSelectedCode(item.code) : undefined}
                >
                  {detailed && item.details && (
                    <CellEvidence details={item.details} level={item.level} selected={isSelected} />
                  )}
                </DomainCell>
              );
            })}
          </DomainGrid>

          {selected && (
            <InterestTypeDetail
              item={selected}
              label={labels[selected.code] ?? selected.sphere}
              summary={descriptions[selected.code] ?? ''}
            />
          )}

          {detailed && (
            <InterestHowItWorks items={interestMap} labels={labels} combination={interestCombination} />
          )}

          {interestMapNote && (
            <p className="text-caption leading-relaxed" style={{ color: 'var(--ink)' }}>{interestMapNote}</p>
          )}
        </div>
      )}
    </DomainCardFrame>
  );
}

/** Mini level meter + "нравится 17 из 24" + a "why" affordance inside a cell. */
function CellEvidence({ details, level, selected }: { details: InterestMapItemDetails; level: Level; selected: boolean }) {
  const { t } = useTranslation();
  const color = level === 'low' ? 'var(--text-heading)' : 'var(--text-on-brand)';
  return (
    <span className="flex flex-col items-center gap-1.5 w-full" style={{ color }}>
      <span
        className="relative w-4/5 h-1 rounded-sm mt-0.5"
        style={{ background: 'color-mix(in srgb, currentColor 22%, transparent)' }}
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ width: `${Math.min(100, details.score)}%`, background: 'currentColor' }}
        />
      </span>
      <span className="font-mono text-mono-xs tabular-nums">
        {t('results:interestDetail.cellCount', { likes: details.likes, answered: details.answered })}
      </span>
      <span className={cn('text-caption inline-flex items-center gap-1 mt-0.5', selected ? 'font-semibold' : 'opacity-80')}>
        {t('results:interestDetail.cellMore')}
        <ChevronDown size={14} aria-hidden="true" />
      </span>
    </span>
  );
}

function TypeIcon({ item }: { item: InterestMapItem }) {
  return (
    <RiasecIcon
      type={item.code as RiasecType}
      size={32}
      strokeWidth={item.level === 'high' ? 2.25 : 1.75}
      style={{ color: ICON_COLOR[item.level] }}
    />
  );
}
