import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import type {
  PsychEmotionalSection,
  PsychoEmotionalHistoryItem,
  PsychoEmotionalPositionalPair,
  PsychoEmotionalSplitPair,
  PsychoPairSign,
} from '@/shared/types';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { CHECKIN_QUESTION_BY_KEY, CHECKIN_SKIPPED } from '@/shared/config/psychoCheckin';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { PsychSectionShell } from './PsychSectionShell';
import { MetricList } from './MetricList';

interface PsychoEmotionalSectionProps {
  section?: PsychEmotionalSection | null;
}

/**
 * «Психоэмоциональный тест» (МЦВ Собчик — the name «Люшер» is never shown,
 * PRO-282 §4). The specialist-facing composition (§B8 / PRO-309): the two
 * colour rows, D, functional pairs with ( )/[ ], the anxiety / compensation /
 * СО / ВК indices with levels + breakdowns, and a compact dynamics list of
 * past runs. No canned hint texts — removed by product decision: the reader
 * is a licensed psychologist, who doesn't need research-derived phrasing and
 * could find it confusing. The structural indices (Р/concentricity/
 * heteronomy/Ккп) block was dropped too, 2026-09-11 — product decided they
 * won't be shown.
 *
 * `null` section → renders nothing (report generated before the run was
 * scored, or scoring failed). Section-object prop only — no hook/store
 * coupling — so PRO-320 reuses it on the admin client-review screen.
 */

const VALIDITY_DOT = {
  ok: 'bg-success',
  caution: 'bg-warning',
  low: 'bg-danger',
} as const;

const SIGN_GLYPH: Record<PsychoPairSign, string> = {
  plus: '+',
  cross: '×',
  equal: '=',
  minus: '−',
};

const LEVEL_TONE: Record<string, string> = {
  low: 'text-success',
  norm: 'text-success',
  balance: 'text-success',
  moderate: 'text-warning',
  elevated: 'text-warning',
  reduced: 'text-warning',
  high: 'text-danger',
  very_high: 'text-danger',
  low_tone: 'text-danger',
  overexcited: 'text-danger',
};

export function PsychoEmotionalSection({ section }: PsychoEmotionalSectionProps) {
  const { t } = useTranslation('psychologist');
  if (!section) return null;

  const flag = section.validity_flag;
  const completed = new Date(section.completed_at);
  const completedLabel = Number.isNaN(completed.getTime()) ? '' : formatDate(completed, { dateStyle: 'short' });

  return (
    <PsychSectionShell title={t('psycho.title')}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-body font-semibold text-primary leading-snug">
            {t('psycho.run', { n: section.run_number })}
            {completedLabel && <span className="text-secondary font-normal"> · {completedLabel}</span>}
          </p>
          {flag && (
            <span className="flex items-center gap-1.5 text-caption text-secondary">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', VALIDITY_DOT[flag])} aria-hidden />
              {t('psychoResult.validityLabel', { label: t(`psychoResult.validity.${flag}`) })}
            </span>
          )}
        </div>

        {section.validity_reasons.length > 0 && (
          <ul className="flex flex-col gap-1 text-caption text-secondary">
            {section.validity_reasons.map((code) => (
              <li key={code}>• {t(`psycho.reason.${code}`, { defaultValue: code })}</li>
            ))}
          </ul>
        )}

        <CheckIn checkin={section.checkin} />

        <Block title={t('psychoResult.choices')}>
          <ColourRow label={t('psychoResult.round1')} ids={section.choice_1} />
          <ColourRow label={t('psychoResult.round2')} ids={section.choice_2} />
          <p className="text-caption text-secondary">
            D = <span className="font-mono text-primary">{section.d_value}</span>
            {section.d_memory && t('psychoResult.dMemory')}
            {section.d_situationally_unstable && t('psychoResult.dUnstable')}
          </p>
        </Block>

        <Block title={t('psychoResult.pairs')}>
          <div className="flex flex-col gap-1.5">
            {section.positional_pairs.map((pair) => (
              <PositionalPairRow key={pair.sign} pair={pair} />
            ))}
          </div>
          <p className="text-caption text-secondary">
            {t('psychoResult.rootConflict')}{' '}
            <ColourChip id={section.root_conflict[0]} />
            <ColourChip id={section.root_conflict[1]} />
          </p>
          <div className="flex flex-col gap-1 border-t border-default pt-2">
            <p className="text-caption text-muted">
              {t('psychoResult.splitSummary', { count: section.split_count })}
              {section.instability && t('psychoResult.instability')}
            </p>
            {section.split_pairs.map((pair, i) => (
              <SplitPairRow key={i} pair={pair} />
            ))}
          </div>
        </Block>

        <Block title={t('psychoResult.indices')}>
          <MetricList
            rows={[
              {
                key: 'anxiety',
                label: t('psychoResult.anxiety'),
                value: (
                  <IndexValue
                    value={section.anxiety.score}
                    outOf={12}
                    level={t(`psycho.level.anxiety.${section.anxiety.level}`)}
                    levelKey={section.anxiety.level}
                    contributors={section.anxiety.breakdown}
                  />
                ),
              },
              {
                key: 'compensation',
                label: t('psychoResult.compensation'),
                value: (
                  <IndexValue
                    value={section.compensation.score}
                    outOf={9}
                    level={t(`psycho.level.compensation.${section.compensation.level}`)}
                    levelKey={section.compensation.level}
                    contributors={section.compensation.breakdown}
                  />
                ),
              },
              {
                key: 'so',
                label: t('psychoResult.so'),
                value: (
                  <IndexValue
                    value={section.so_value}
                    outOf={32}
                    level={t(`psycho.level.so.${section.so_level}`)}
                    levelKey={section.so_level}
                  />
                ),
              },
              {
                key: 'vk',
                label: t('psychoResult.vk'),
                value: (
                  <IndexValue
                    value={section.vk_value.toFixed(2)}
                    level={t(`psycho.level.vk.${section.vk_level}`)}
                    levelKey={section.vk_level}
                  />
                ),
              },
            ]}
          />
          {section.compensation.purple_forward && (
            <p className="text-caption text-secondary">
              {t('psychoResult.purpleForward', { position: section.compensation.purple_position })}
            </p>
          )}
          {section.black_first && (
            <p className="text-caption font-medium text-danger">
              {t('psychoResult.blackFirst')}
            </p>
          )}
        </Block>

        {section.history.length > 0 && (
          <Block title={t('psychoResult.history')}>
            <ul className="flex flex-col gap-1 text-caption text-secondary">
              {section.history.map((item) => (
                <HistoryRow key={item.run_number} item={item} />
              ))}
            </ul>
          </Block>
        )}
      </div>
    </PsychSectionShell>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-default pt-3">
      <h4 className="text-caption font-semibold uppercase tracking-wide text-muted">{title}</h4>
      {children}
    </section>
  );
}

/** Localized colour name — the canonical ru `name` in psychoColors.ts is
 *  not UI copy. */
function useColourName() {
  const { t } = useTranslation('assessment');
  return (id: number) => (PSYCHO_COLOR_BY_ID[id] ? t(`psychoemotional.color.${id}`) : String(id));
}

function ColourChip({ id }: { id: number }) {
  const colourName = useColourName();
  const colour = PSYCHO_COLOR_BY_ID[id];
  return (
    <span
      className="mx-0.5 inline-block h-4 w-4 translate-y-[3px] rounded-[3px] ring-1 ring-inset ring-black/15"
      style={{ backgroundColor: colour?.hex ?? 'transparent' }}
      title={colourName(id)}
      aria-label={colourName(id)}
    />
  );
}

function ColourRow({ label, ids }: { label: string; ids: number[] }) {
  const { t } = useTranslation('psychologist');
  const colourName = useColourName();
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-caption text-secondary">{label}</span>
      <div className="flex flex-wrap gap-1">
        {ids.map((id, position) => {
          const colour = PSYCHO_COLOR_BY_ID[id];
          const name = colourName(id);
          return (
            <span
              key={position}
              className="h-6 w-6 rounded ring-1 ring-inset ring-black/15"
              style={{ backgroundColor: colour?.hex ?? 'transparent' }}
              title={`${position + 1}. ${name}`}
              aria-label={t('psychoResult.position', { n: position + 1, colour: name })}
            />
          );
        })}
      </div>
    </div>
  );
}

function PositionalPairRow({ pair }: { pair: PsychoEmotionalPositionalPair }) {
  const { t } = useTranslation('psychologist');
  return (
    <div className="flex items-center gap-2 text-caption text-secondary">
      <span className="w-4 shrink-0 text-center font-mono text-primary">{SIGN_GLYPH[pair.sign]}</span>
      <ColourChip id={pair.colors[0]} />
      <ColourChip id={pair.colors[1]} />
      <span className="text-muted">— {t(`psycho.sign.${pair.sign}`)}</span>
    </div>
  );
}

function SplitPairRow({ pair }: { pair: PsychoEmotionalSplitPair }) {
  const { t } = useTranslation('psychologist');
  return (
    <div className="flex items-center gap-1.5 text-caption text-secondary">
      <span className="font-mono text-primary">{pair.stable ? '( )' : '[ ]'}</span>
      <ColourChip id={pair.colors[0]} />
      <ColourChip id={pair.colors[1]} />
      <span className="text-muted">{pair.stable ? t('psychoResult.stable') : t('psychoResult.split')}</span>
    </div>
  );
}

function IndexValue({
  value,
  outOf,
  level,
  levelKey,
  contributors,
}: {
  value: number | string;
  outOf?: number;
  level: string;
  levelKey: string;
  contributors?: Record<string, number>;
}) {
  const { t } = useTranslation('psychologist');
  const contributorEntries = contributors
    ? Object.entries(contributors).filter(([, v]) => v > 0)
    : [];
  return (
    <span className="flex flex-col items-end gap-1">
      <span>
        <span className="font-mono text-primary">
          {value}
          {outOf != null && t('psychoResult.outOf', { n: outOf })}
        </span>{' '}
        · <span className={cn('font-medium', LEVEL_TONE[levelKey] ?? 'text-secondary')}>{level}</span>
      </span>
      {contributorEntries.length > 0 && (
        <span className="flex flex-wrap items-center justify-end gap-1 text-muted">
          {t('psychoResult.contribution')}
          {contributorEntries.map(([id, v]) => (
            <span key={id} className="inline-flex items-center gap-0.5">
              <ColourChip id={Number(id)} />+{v}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

/** Check-in answers are stored as the canonical ru option (psychoCheckin.ts);
 *  shown through the same catalog keys the student saw them with. */
function CheckIn({ checkin }: { checkin: Record<string, string> }) {
  const { t } = useTranslation('psychologist');
  const { t: tAssessment } = useTranslation('assessment');
  const entries = Object.entries(checkin);
  const answerLabel = (key: string, answer: string) => {
    if (answer === CHECKIN_SKIPPED) return t('psycho.checkinSkipped');
    const index = CHECKIN_QUESTION_BY_KEY[key]?.options.indexOf(answer) ?? -1;
    return index >= 0 ? tAssessment(`psychoemotional.checkin.${key}.options.${index}`) : answer;
  };
  if (entries.length === 0) return null;
  return (
    <details className="group border-t border-default pt-2">
      <summary className="flex cursor-pointer select-none items-center gap-1 text-caption text-brand [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        {t('psychoResult.checkin')}
      </summary>
      <MetricList
        className="mt-2"
        rows={entries.map(([key, answer]) => ({
          key,
          label: CHECKIN_QUESTION_BY_KEY[key] ? tAssessment(`psychoemotional.checkin.${key}.label`) : key,
          value: <span className="text-primary">{answerLabel(key, answer)}</span>,
        }))}
      />
    </details>
  );
}

function HistoryRow({ item }: { item: PsychoEmotionalHistoryItem }) {
  const { t } = useTranslation('psychologist');
  const date = new Date(item.completed_at);
  const dateLabel = Number.isNaN(date.getTime()) ? '' : formatDate(date, { dateStyle: 'short' });
  const flag = item.validity_flag;
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="font-mono text-primary">№{item.run_number}</span>
      {dateLabel && <span className="text-muted">{dateLabel}</span>}
      <span>{t('psychoResult.historySo', { value: item.so ?? '—' })}</span>
      <span>{t('psychoResult.historyAnxiety', { value: item.anxiety_score ?? '—' })}</span>
      {flag && (
        <span className="flex items-center gap-1">
          ·<span className={cn('h-2 w-2 rounded-full', VALIDITY_DOT[flag])} aria-hidden />
          {t(`psychoResult.validity.${flag}`)}
        </span>
      )}
    </li>
  );
}
