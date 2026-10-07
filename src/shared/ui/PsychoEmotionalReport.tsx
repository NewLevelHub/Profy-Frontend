import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertTriangle, ChevronDown, Info } from 'lucide-react';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { CHECKIN_QUESTION_BY_KEY, CHECKIN_SKIPPED } from '@/shared/config/psychoCheckin';
import { formatDate, formatNumber } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import type {
  PsychoEmotionalChoiceAnalysis,
  PsychoEmotionalHistoryItem,
  PsychoEmotionalIndexNote,
  PsychoEmotionalSection,
  PsychoEmotionalSplitPair,
  PsychoPairSign,
} from '@/shared/types';
import { Mono } from './typography/Mono';
import { Text } from './typography/Text';
import { PsychoEmotionalInterpretation } from './PsychoEmotionalInterpretation';

type MetricKey = 'anxiety' | 'compensation' | 'so' | 'vk';
type Tone = 'success' | 'warning' | 'danger';

interface ScaleBand {
  level: string;
  from: number;
  to: number;
  tone: Tone;
  rangeLabel: string;
}

interface MetricSpec {
  key: MetricKey;
  value: number;
  displayValue: string;
  level: string;
  bands: ScaleBand[];
  description?: string;
  contributors?: Record<string, number>;
  note?: string;
}

const SIGN_GLYPH: Record<PsychoPairSign, string> = {
  plus: '+',
  cross: '×',
  equal: '=',
  minus: '−',
};

const AUTOGENIC_NORM = [3, 4, 2, 5, 1, 6, 0, 7];

const BAND_TONE: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const VALIDITY_DOT = {
  ok: 'bg-success',
  caution: 'bg-warning',
  low: 'bg-danger',
} as const;

export interface PsychoEmotionalReportProps {
  section: PsychoEmotionalSection;
  className?: string;
}

/**
 * Complete specialist reading of the colour-choice run. The information
 * architecture mirrors the useful layers of a full MЦВ report: method frame,
 * qualitative hypotheses, quantitative scales and a collapsible calculation
 * protocol. It deliberately uses Profy's original, non-clinical copy instead
 * of reproducing protected manual/table wording.
 */
export function PsychoEmotionalReport({ section, className }: PsychoEmotionalReportProps) {
  const { t } = useTranslation('psychologist');
  const indexText = new Map(section.interpretation.indices.map((note) => [note.metric, note]));
  const metrics = buildMetricSpecs(section, indexText, t);

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="flex items-start gap-3 rounded-[12px] border border-default bg-brand-subtle p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
        <div className="flex flex-col gap-1">
          <Text variant="caption" className="font-semibold text-heading">
            {t('psychoResult.methodFrameTitle')}
          </Text>
          <Text variant="body-sm" className="text-primary">
            {t('psychoResult.methodFrame')}
          </Text>
          <Text variant="caption" className="text-muted">
            {t('psychoResult.methodAttribution')}
          </Text>
        </div>
      </div>

      {section.black_first && (
        <div role="note" className="flex items-start gap-3 rounded-[12px] border border-warning bg-warning-subtle p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <Text variant="body-sm" className="font-semibold text-primary">
            {t('psychoResult.blackFirst')}
          </Text>
        </div>
      )}

      <ReportSection
        title={t('psychoResult.choiceComparisonTitle')}
        description={t('psychoResult.choiceComparisonIntro')}
      >
        <div className="grid gap-3 xl:grid-cols-2">
          {section.choice_analyses.map((analysis) => (
            <ChoiceAnalysisCard key={analysis.round} analysis={analysis} />
          ))}
        </div>
        {section.choice_analyses.length === 2 && (
          <ChoiceDynamics analyses={section.choice_analyses} dValue={section.d_value} />
        )}
      </ReportSection>

      <PsychoEmotionalInterpretation interpretation={section.interpretation} />

      <ReportSection
        title={t('psychoResult.quantitativeTitle')}
        description={t('psychoResult.quantitativeIntro')}
      >
        <div className="grid gap-3 xl:grid-cols-2">
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
        <Text variant="caption" className="text-muted">
          {t('psychoResult.preliminaryThresholds')}
        </Text>
      </ReportSection>

      <Disclosure title={t('psychoResult.protocolTitle')} hint={t('psychoResult.protocolHint')}>
        <TechnicalProtocol section={section} />
      </Disclosure>

      {Object.keys(section.checkin).length > 0 && (
        <Disclosure title={t('psychoResult.checkinTitle')} hint={t('psychoResult.checkinHint')}>
          <CheckIn checkin={section.checkin} />
        </Disclosure>
      )}

      {section.history.length > 0 && (
        <Disclosure title={t('psychoResult.history')} hint={t('psychoResult.historyHint')}>
          <History items={section.history} />
        </Disclosure>
      )}
    </div>
  );
}

function buildMetricSpecs(
  section: PsychoEmotionalSection,
  indexText: Map<string, PsychoEmotionalIndexNote>,
  t: TFunction<'psychologist'>,
): MetricSpec[] {
  const versionTwo = section.thresholds_version === 2 || section.thresholds_version == null;
  const anxietyBands: ScaleBand[] = versionTwo
    ? [
        { level: 'low', from: 0, to: 2, tone: 'success', rangeLabel: '0–2' },
        { level: 'moderate', from: 3, to: 5, tone: 'warning', rangeLabel: '3–5' },
        { level: 'high', from: 6, to: 8, tone: 'danger', rangeLabel: '6–8' },
        { level: 'very_high', from: 9, to: 12, tone: 'danger', rangeLabel: '9–12' },
      ]
    : [{ level: section.anxiety.level, from: 0, to: 12, tone: toneForLevel(section.anxiety.level), rangeLabel: '0–12' }];
  const compensationBands: ScaleBand[] = versionTwo
    ? [
        { level: 'low', from: 0, to: 2, tone: 'success', rangeLabel: '0–2' },
        { level: 'moderate', from: 3, to: 5, tone: 'warning', rangeLabel: '3–5' },
        { level: 'high', from: 6, to: 9, tone: 'danger', rangeLabel: '6–9' },
      ]
    : [{ level: section.compensation.level, from: 0, to: 9, tone: toneForLevel(section.compensation.level), rangeLabel: '0–9' }];
  const soBands: ScaleBand[] = versionTwo
    ? [
        { level: 'norm', from: 0, to: 16, tone: 'success', rangeLabel: '0–16' },
        { level: 'elevated', from: 17, to: 24, tone: 'warning', rangeLabel: '18–24' },
        { level: 'high', from: 25, to: 32, tone: 'danger', rangeLabel: '26–32' },
      ]
    : [{ level: section.so_level, from: 0, to: 32, tone: toneForLevel(section.so_level), rangeLabel: '0–32' }];
  const vkBands: ScaleBand[] = versionTwo
    ? [
        { level: 'low_tone', from: 0.2, to: 0.5, tone: 'danger', rangeLabel: '0,2–<0,5' },
        { level: 'reduced', from: 0.5, to: 0.9, tone: 'warning', rangeLabel: '0,5–0,9' },
        { level: 'balance', from: 0.9, to: 2, tone: 'success', rangeLabel: '0,9–2,0' },
        { level: 'overexcited', from: 2, to: 5, tone: 'danger', rangeLabel: '>2,0' },
      ]
    : [{ level: section.vk_level, from: 0.2, to: 5, tone: toneForLevel(section.vk_level), rangeLabel: '0,2–5,0' }];

  return [
    {
      key: 'anxiety',
      value: section.anxiety.score,
      displayValue: `${formatNumber(section.anxiety.score)} / 12`,
      level: section.anxiety.level,
      bands: anxietyBands,
      description: indexText.get('anxiety')?.text,
      contributors: section.anxiety.breakdown,
    },
    {
      key: 'compensation',
      value: section.compensation.score,
      displayValue: `${formatNumber(section.compensation.score)} / 9`,
      level: section.compensation.level,
      bands: compensationBands,
      description: t(`psychoResult.compensationText.${section.compensation.level}`),
      contributors: section.compensation.breakdown,
      note: section.compensation.purple_forward
        ? t('psychoResult.purpleForward', { position: section.compensation.purple_position })
        : undefined,
    },
    {
      key: 'so',
      value: section.so_value,
      displayValue: `${formatNumber(section.so_value)} / 32`,
      level: section.so_level,
      bands: soBands,
      description: indexText.get('so')?.text,
    },
    {
      key: 'vk',
      value: section.vk_value,
      displayValue: formatNumber(section.vk_value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      level: section.vk_level,
      bands: vkBands,
      description: indexText.get('vk')?.text,
    },
  ];
}

function toneForLevel(level: string): Tone {
  if (level === 'low' || level === 'norm' || level === 'balance') return 'success';
  if (level === 'moderate' || level === 'elevated' || level === 'reduced') return 'warning';
  return 'danger';
}

function MetricCard({ metric }: { metric: MetricSpec }) {
  const { t } = useTranslation('psychologist');
  const contributorEntries = Object.entries(metric.contributors ?? {}).filter(([, value]) => value > 0);

  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-default bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Text as="h4" variant="body-sm" className="font-semibold text-heading">
            {t(`psychoResult.${metric.key}`)}
          </Text>
          <Text variant="caption" className="text-muted">
            {t(`psychoResult.metricHelp.${metric.key}`)}
          </Text>
        </div>
        <Mono variant="md" className="shrink-0 text-heading">
          {metric.displayValue}
        </Mono>
      </div>

      <MetricScale metric={metric} />

      <Text variant="caption" className={cn('font-semibold', levelTone(metric.level))}>
        {t(`psycho.level.${metric.key}.${metric.level}`)}
      </Text>
      {metric.description && (
        <Text variant="body-sm" className="text-primary">
          {metric.description}
        </Text>
      )}

      {contributorEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-default pt-2">
          <Text as="span" variant="caption" className="text-muted">
            {t('psychoResult.contribution')}
          </Text>
          {contributorEntries.map(([id, value]) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-raised px-2 py-1">
              <ColourDot id={Number(id)} />
              <Mono variant="xs" className="text-primary">+{value}</Mono>
            </span>
          ))}
        </div>
      )}
      {metric.note && (
        <Text variant="caption" className="text-warning">
          {metric.note}
        </Text>
      )}
    </article>
  );
}

function MetricScale({ metric }: { metric: MetricSpec }) {
  const activeIndex = Math.max(0, metric.bands.findIndex((band) => band.level === metric.level));
  const minimum = Math.min(...metric.bands.map((band) => band.from));
  const maximum = Math.max(...metric.bands.map((band) => band.to));
  const fullSpan = Math.max(maximum - minimum, Number.EPSILON);
  const marker = ((metric.value - minimum) / fullSpan) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative flex h-2.5 gap-1" aria-hidden>
        {metric.bands.map((band, index) => (
          <span
            key={`${metric.key}-${band.level}`}
            className={cn(
              'h-full rounded-full',
              BAND_TONE[band.tone],
              index === activeIndex ? 'opacity-100' : 'opacity-30',
            )}
            style={{ width: `${Math.max(3, ((band.to - band.from) / fullSpan) * 100)}%` }}
          />
        ))}
        <span
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-strong bg-surface shadow-sm"
          style={{ left: `${Math.max(1, Math.min(99, marker))}%` }}
        />
      </div>
      <div className="flex gap-1">
        {metric.bands.map((band) => (
          <Mono
            key={band.level}
            variant="xs"
            className="text-center text-muted"
            style={{ width: `${Math.max(3, ((band.to - band.from) / fullSpan) * 100)}%` }}
          >
            {band.rangeLabel}
          </Mono>
        ))}
      </div>
    </div>
  );
}

function levelTone(level: string): string {
  if (level === 'low' || level === 'norm' || level === 'balance') return 'text-success';
  if (level === 'moderate' || level === 'elevated' || level === 'reduced') return 'text-warning';
  return 'text-danger';
}

function ChoiceAnalysisCard({ analysis }: { analysis: PsychoEmotionalChoiceAnalysis }) {
  const { t } = useTranslation('psychologist');
  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-default bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text as="h4" variant="body-sm" className="font-semibold text-heading">
          {t(analysis.round === 1 ? 'psychoResult.round1' : 'psychoResult.round2')}
        </Text>
        <span className="flex flex-wrap gap-2">
          <Text as="span" variant="caption" className="rounded-full bg-raised px-2 py-1 text-secondary">
            {t('psychoResult.roundAnxiety', { value: analysis.anxiety.score })}
          </Text>
          <Text as="span" variant="caption" className="rounded-full bg-raised px-2 py-1 text-secondary">
            {t('psychoResult.roundCompensation', { value: analysis.compensation.score })}
          </Text>
        </span>
      </div>
      <ChoiceSequence ids={analysis.colors} analysis={analysis} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-default pt-2">
        <Text as="span" variant="caption" className="text-muted">
          <b className="text-warning">!</b> {t('psychoResult.anxietyMark')}
        </Text>
        <Text as="span" variant="caption" className="text-muted">
          <b className="text-brand">К</b> {t('psychoResult.compensationMark')}
        </Text>
      </div>
    </article>
  );
}

function ChoiceDynamics({ analyses, dValue }: { analyses: PsychoEmotionalChoiceAnalysis[]; dValue: number }) {
  const { t } = useTranslation('psychologist');
  const first = analyses.find((item) => item.round === 1);
  const second = analyses.find((item) => item.round === 2);
  if (!first || !second) return null;
  const anxietyDelta = second.anxiety.score - first.anxiety.score;
  const compensationDelta = second.compensation.score - first.compensation.score;
  const direction = (delta: number) => (delta > 0 ? 'up' : delta < 0 ? 'down' : 'same');
  return (
    <div className="rounded-[12px] border border-default bg-raised p-3.5">
      <Text variant="body-sm" className="text-primary">
        {t('psychoResult.choiceDynamics', {
          d: dValue,
          anxiety: t(`psychoResult.direction.${direction(anxietyDelta)}`),
          compensation: t(`psychoResult.direction.${direction(compensationDelta)}`),
        })}
      </Text>
    </div>
  );
}

function TechnicalProtocol({ section }: { section: PsychoEmotionalSection }) {
  const { t } = useTranslation('psychologist');
  const positions = Object.fromEntries(section.choice_2.map((id, index) => [id, index + 1]));
  const numerator = 18 - positions[3] - positions[4];
  const denominator = 18 - positions[1] - positions[2];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <ProtocolTitle>{t('psychoResult.choiceMarkup')}</ProtocolTitle>
        <ChoiceSequence label={t('psychoResult.round1')} ids={section.choice_1} analysis={section.choice_analyses.find((item) => item.round === 1)} />
        <ChoiceSequence label={t('psychoResult.round2')} ids={section.choice_2} analysis={section.choice_analyses.find((item) => item.round === 2)} />
      </div>

      <div className="flex flex-col gap-3 border-t border-default pt-4">
        <ProtocolTitle>{t('psychoResult.pairs')}</ProtocolTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {section.positional_pairs.map((pair) => (
            <div key={pair.sign} className="flex items-center gap-2 rounded-[10px] bg-raised p-2.5">
              <Mono variant="md" className="w-5 shrink-0 text-center text-heading">
                {SIGN_GLYPH[pair.sign]}
              </Mono>
              <ColourDot id={pair.colors[0]} size="large" />
              <ColourDot id={pair.colors[1]} size="large" />
              <Text as="span" variant="caption" className="text-secondary">
                {t(`psycho.sign.${pair.sign}`)}
              </Text>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Text as="span" variant="caption" className="text-muted">
            {t('psychoResult.rootConflict')}
          </Text>
          <ColourDot id={section.root_conflict[0]} size="large" />
          <Mono variant="sm" className="text-muted">→</Mono>
          <ColourDot id={section.root_conflict[1]} size="large" />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-default pt-4">
        <ProtocolTitle>{t('psychoResult.stabilityTitle')}</ProtocolTitle>
        <Text variant="body-sm" className="text-primary">
          {t('psychoResult.splitSummary', { count: section.split_count })}
          {section.instability && t('psychoResult.instability')}
        </Text>
        <div className="flex flex-wrap gap-2">
          {section.split_pairs.map((pair, index) => (
            <SplitPair key={`${pair.colors.join('-')}-${index}`} pair={pair} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-default pt-4">
        <ProtocolTitle>{t('psychoResult.calculations')}</ProtocolTitle>
        <FormulaRow label={t('psychoResult.dLabel')} result={formatNumber(section.d_value)}>
          {t('psychoResult.dFormula')}
        </FormulaRow>
        {section.d_memory && <ProtocolNote>{t('psychoResult.dMemoryLong')}</ProtocolNote>}
        {section.d_situationally_unstable && <ProtocolNote tone="danger">{t('psychoResult.dUnstableLong')}</ProtocolNote>}

        <div className="flex flex-col gap-2 rounded-[10px] bg-raised p-3">
          <Text variant="caption" className="font-semibold text-secondary">
            {t('psychoResult.autogenicNorm')}
          </Text>
          <SoBreakdown choice={section.choice_2} />
        </div>
        <FormulaRow label={t('psychoResult.so')} result={formatNumber(section.so_value)}>
          {t('psychoResult.soFormula')}
        </FormulaRow>
        <FormulaRow
          label={t('psychoResult.vk')}
          result={formatNumber(section.vk_value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        >
          {`(18 − ${positions[3]} − ${positions[4]}) / (18 − ${positions[1]} − ${positions[2]}) = ${numerator} / ${denominator}`}
        </FormulaRow>

        {section.thresholds_version != null && (
          <Text variant="caption" className="text-muted">
            {t('psychoResult.thresholdVersion', { version: section.thresholds_version })}
          </Text>
        )}
      </div>
    </div>
  );
}

function SoBreakdown({ choice }: { choice: number[] }) {
  const { t } = useTranslation('psychologist');
  const positions = Object.fromEntries(choice.map((id, index) => [id, index + 1]));
  const differences = AUTOGENIC_NORM.map((id, index) => Math.abs(positions[id] - (index + 1)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-x-1 border-spacing-y-1.5">
        <tbody>
          <tr>
            <th scope="row" className="pr-2 text-left align-middle">
              <Text as="span" variant="caption" className="text-muted">{t('psychoResult.soTable.colours')}</Text>
            </th>
            {AUTOGENIC_NORM.map((id) => (
              <td key={id} className="text-center"><ColourDot id={id} size="large" /></td>
            ))}
          </tr>
          <SoBreakdownRow label={t('psychoResult.soTable.normPosition')} values={AUTOGENIC_NORM.map((_, index) => index + 1)} />
          <SoBreakdownRow label={t('psychoResult.soTable.choicePosition')} values={AUTOGENIC_NORM.map((id) => positions[id])} />
          <SoBreakdownRow label={t('psychoResult.soTable.difference')} values={differences} emphasized />
        </tbody>
      </table>
    </div>
  );
}

function SoBreakdownRow({ label, values, emphasized = false }: { label: string; values: number[]; emphasized?: boolean }) {
  return (
    <tr>
      <th scope="row" className="pr-2 text-left align-middle">
        <Text as="span" variant="caption" className="text-muted">{label}</Text>
      </th>
      {values.map((value, index) => (
        <Mono key={`${label}-${index}`} as="td" variant="xs" className={cn('text-center', emphasized ? 'font-semibold text-heading' : 'text-secondary')}>
          {value}
        </Mono>
      ))}
    </tr>
  );
}

function ChoiceSequence({
  label,
  ids,
  compact = false,
  analysis,
}: {
  label?: string;
  ids: number[];
  compact?: boolean;
  analysis?: PsychoEmotionalChoiceAnalysis;
}) {
  const { t } = useTranslation('psychologist');
  const { t: tAssessment } = useTranslation('assessment');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Text variant="caption" className="font-semibold text-secondary">
          {label}
        </Text>
      )}
      <div className="grid grid-cols-8 gap-1.5">
        {ids.map((id, index) => {
          const colour = PSYCHO_COLOR_BY_ID[id];
          const name = tAssessment(`psychoemotional.color.${id}`);
          const anxiety = analysis?.anxiety.breakdown[String(id)] ?? 0;
          const compensation = analysis?.compensation.breakdown[String(id)] ?? 0;
          const purpleCompensation = id === 5 && analysis?.compensation.purple_forward;
          return (
            <div key={`${id}-${index}`} className="flex min-w-0 flex-col items-center gap-1">
              <span
                className={cn(
                  'w-full rounded-[6px] ring-1 ring-inset ring-black/15',
                  compact ? 'h-6' : 'h-9 sm:h-11',
                )}
                style={{ backgroundColor: colour?.hex ?? 'transparent' }}
                title={name}
                role="img"
                aria-label={t('psychoResult.position', { n: index + 1, colour: name })}
              />
              {!compact && (
                <span className="flex min-h-4 items-center gap-0.5">
                  <Mono variant="xs" className="text-muted">{index + 1}</Mono>
                  {anxiety > 0 && (
                    <Mono variant="xs" className="font-semibold text-warning">{'!'.repeat(anxiety)}</Mono>
                  )}
                  {(compensation > 0 || purpleCompensation) && (
                    <Mono variant="xs" className="font-semibold text-brand">К</Mono>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ColourDot({ id, size = 'small' }: { id: number; size?: 'small' | 'large' }) {
  const { t } = useTranslation('assessment');
  const colour = PSYCHO_COLOR_BY_ID[id];
  const name = colour ? t(`psychoemotional.color.${id}`) : String(id);
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-[4px] ring-1 ring-inset ring-black/15',
        size === 'large' ? 'h-5 w-5' : 'h-3.5 w-3.5',
      )}
      style={{ backgroundColor: colour?.hex ?? 'transparent' }}
      title={name}
      role="img"
      aria-label={name}
    />
  );
}

function SplitPair({ pair }: { pair: PsychoEmotionalSplitPair }) {
  const { t } = useTranslation('psychologist');
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-default bg-surface px-2.5 py-1.5">
      <Mono variant="xs" className="text-primary">{pair.stable ? '( )' : '[ ]'}</Mono>
      <ColourDot id={pair.colors[0]} />
      <ColourDot id={pair.colors[1]} />
      <Text as="span" variant="caption" className="text-muted">
        {pair.stable ? t('psychoResult.stable') : t('psychoResult.split')}
      </Text>
    </span>
  );
}

function FormulaRow({ label, result, children }: { label: string; result: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-[10px] border border-default bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="min-w-0">
        <Text variant="caption" className="font-semibold text-secondary">{label}</Text>
        <Mono as="div" variant="sm" className="mt-1 break-words text-primary">{children}</Mono>
      </div>
      <Mono variant="md" className="text-heading">= {result}</Mono>
    </div>
  );
}

function ProtocolNote({ children, tone = 'warning' }: { children: ReactNode; tone?: 'warning' | 'danger' }) {
  return (
    <Text variant="caption" className={tone === 'danger' ? 'text-danger' : 'text-warning'}>
      {children}
    </Text>
  );
}

function CheckIn({ checkin }: { checkin: Record<string, string> }) {
  const { t } = useTranslation('psychologist');
  const { t: tAssessment } = useTranslation('assessment');
  const answerLabel = (key: string, answer: string) => {
    if (answer === CHECKIN_SKIPPED) return t('psycho.checkinSkipped');
    const index = CHECKIN_QUESTION_BY_KEY[key]?.options.indexOf(answer) ?? -1;
    return index >= 0 ? tAssessment(`psychoemotional.checkin.${key}.options.${index}`) : answer;
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Object.entries(checkin).map(([key, answer]) => (
        <div key={key} className="rounded-[10px] bg-raised p-3">
          <Text as="div" variant="caption" className="text-muted">
            {CHECKIN_QUESTION_BY_KEY[key] ? tAssessment(`psychoemotional.checkin.${key}.label`) : key}
          </Text>
          <Text as="div" variant="body-sm" className="mt-1 font-semibold text-primary">
            {answerLabel(key, answer)}
          </Text>
        </div>
      ))}
    </div>
  );
}

function History({ items }: { items: PsychoEmotionalHistoryItem[] }) {
  const { t } = useTranslation('psychologist');
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item) => (
        <li key={item.run_number} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-raised p-3">
          <span className="flex flex-wrap items-center gap-2">
            <Mono variant="sm" className="text-heading">№{item.run_number}</Mono>
            <Text as="span" variant="caption" className="text-muted">
              {formatDate(item.completed_at, { dateStyle: 'short' })}
            </Text>
          </span>
          <Text as="span" variant="caption" className="text-secondary">
            {t('psychoResult.historySo', { value: item.so ?? '—' })}{' '}
            {t('psychoResult.historyAnxiety', { value: item.anxiety_score ?? '—' })}
          </Text>
          {item.validity_flag && (
            <span className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', VALIDITY_DOT[item.validity_flag])} aria-hidden />
              <Text as="span" variant="caption" className="text-muted">
                {t(`psychoResult.validity.${item.validity_flag}`)}
              </Text>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Disclosure({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <details className="group rounded-[12px] border border-default bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 shrink-0 text-brand transition-transform group-open:rotate-180" aria-hidden />
        <span className="min-w-0 flex-1">
          <Text as="span" variant="body-sm" className="block font-semibold text-heading">{title}</Text>
          {hint && <Text as="span" variant="caption" className="block text-muted">{hint}</Text>}
        </span>
      </summary>
      <div className="border-t border-default px-4 py-4">{children}</div>
    </details>
  );
}

function ReportSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-default pt-4">
      <div className="flex flex-col gap-1">
        <Text as="h3" variant="body-lg" className="font-semibold text-heading">{title}</Text>
        {description && <Text variant="body-sm" className="text-secondary">{description}</Text>}
      </div>
      {children}
    </section>
  );
}

function ProtocolTitle({ children }: { children: ReactNode }) {
  return <Text as="h4" variant="caption" className="font-semibold uppercase tracking-wide text-muted">{children}</Text>;
}
