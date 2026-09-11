import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type {
  PsychEmotionalSection,
  PsychoEmotionalHistoryItem,
  PsychoEmotionalPositionalPair,
  PsychoEmotionalSplitPair,
  PsychoPairSign,
} from '@/shared/types';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { CHECKIN_QUESTION_BY_KEY } from '@/shared/config/psychoCheckin';
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
 *
 * Strings are hardcoded RU (the rest of the results page is too); PRO-293
 * moves them to the `psychEmotional` i18n namespace.
 */

const VALIDITY_FLAG = {
  ok: { dot: 'bg-success', label: 'Достоверно' },
  caution: { dot: 'bg-warning', label: 'С оговоркой' },
  low: { dot: 'bg-danger', label: 'Низкая достоверность' },
} as const;

const VALIDITY_REASON_LABEL: Record<string, string> = {
  mechanical_pick: 'Механический выбор — очень быстрые клики',
  too_fast_overall: 'Весь тест пройден слишком быстро',
  identical_lists: 'Второй круг повторяет первый (выбор по памяти)',
  unstable_choices: 'Нестабильные выборы между кругами',
  pause_not_held: 'Пауза между кругами не выдержана',
};

const SIGN: Record<PsychoPairSign, { glyph: string; meaning: string }> = {
  plus: { glyph: '+', meaning: 'цель, желаемое' },
  cross: { glyph: '×', meaning: 'актуальное состояние' },
  equal: { glyph: '=', meaning: 'зона безразличия' },
  minus: { glyph: '−', meaning: 'отвергается, скрытое напряжение' },
};

const ANXIETY_LEVEL: Record<string, string> = {
  low: 'незначительная',
  moderate: 'умеренная',
  high: 'выраженная',
  very_high: 'выраженная',
};
const COMPENSATION_LEVEL: Record<string, string> = {
  low: 'в норме',
  moderate: 'умеренная',
  high: 'выраженная',
};
const SO_LEVEL: Record<string, string> = {
  norm: 'в норме',
  elevated: 'повышено',
  high: 'высоко',
};
const VK_LEVEL: Record<string, string> = {
  low_tone: 'истощение',
  reduced: 'сниженный тонус',
  balance: 'баланс',
  overexcited: 'перевозбуждение',
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
  if (!section) return null;

  const flag = section.validity_flag ? VALIDITY_FLAG[section.validity_flag] : null;
  const completed = new Date(section.completed_at);
  const completedLabel = Number.isNaN(completed.getTime())
    ? ''
    : completed.toLocaleDateString('ru-RU');

  return (
    <PsychSectionShell title="Психоэмоциональный тест">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-body font-semibold text-primary leading-snug">
            Прохождение №{section.run_number}
            {completedLabel && <span className="text-secondary font-normal"> · {completedLabel}</span>}
          </p>
          {flag && (
            <span className="flex items-center gap-1.5 text-caption text-secondary">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', flag.dot)} aria-hidden />
              Достоверность: {flag.label}
            </span>
          )}
        </div>

        {section.validity_reasons.length > 0 && (
          <ul className="flex flex-col gap-1 text-caption text-secondary">
            {section.validity_reasons.map((code) => (
              <li key={code}>• {VALIDITY_REASON_LABEL[code] ?? code}</li>
            ))}
          </ul>
        )}

        <CheckIn checkin={section.checkin} />

        <Block title="Списки выбора и расхождение">
          <ColourRow label="Круг 1" ids={section.choice_1} />
          <ColourRow label="Круг 2" ids={section.choice_2} />
          <p className="text-caption text-secondary">
            D = <span className="font-mono text-primary">{section.d_value}</span>
            {section.d_memory && ' · второй круг повторён по памяти'}
            {section.d_situationally_unstable &&
              ' · состояние ситуативно нестабильно — метрики трактовать осторожно'}
          </p>
        </Block>

        <Block title="Функциональные пары">
          <div className="flex flex-col gap-1.5">
            {section.positional_pairs.map((pair) => (
              <PositionalPairRow key={pair.sign} pair={pair} />
            ))}
          </div>
          <p className="text-caption text-secondary">
            Корневой конфликт (первый / последний):{' '}
            <ColourChip id={section.root_conflict[0]} />
            <ColourChip id={section.root_conflict[1]} />
          </p>
          <div className="flex flex-col gap-1 border-t border-default pt-2">
            <p className="text-caption text-muted">
              Устойчивые ( ) / расщеплённые [ ] пары — {section.split_count} из 4
              {section.instability && ' · признак эмоциональной нестабильности'}
            </p>
            {section.split_pairs.map((pair, i) => (
              <SplitPairRow key={i} pair={pair} />
            ))}
          </div>
        </Block>

        <Block title="Индексы">
          <MetricList
            rows={[
              {
                key: 'anxiety',
                label: 'Индекс тревоги',
                value: (
                  <IndexValue
                    value={section.anxiety.score}
                    outOf={12}
                    level={ANXIETY_LEVEL[section.anxiety.level]}
                    levelKey={section.anxiety.level}
                    contributors={section.anxiety.breakdown}
                  />
                ),
              },
              {
                key: 'compensation',
                label: 'Индекс компенсации',
                value: (
                  <IndexValue
                    value={section.compensation.score}
                    outOf={9}
                    level={COMPENSATION_LEVEL[section.compensation.level]}
                    levelKey={section.compensation.level}
                    contributors={section.compensation.breakdown}
                  />
                ),
              },
              {
                key: 'so',
                label: 'СО (отклонение от аутогенной нормы)',
                value: (
                  <IndexValue
                    value={section.so_value}
                    outOf={32}
                    level={SO_LEVEL[section.so_level]}
                    levelKey={section.so_level}
                  />
                ),
              },
              {
                key: 'vk',
                label: 'ВК (вегетативный коэффициент)',
                value: (
                  <IndexValue
                    value={section.vk_value.toFixed(2)}
                    level={VK_LEVEL[section.vk_level]}
                    levelKey={section.vk_level}
                  />
                ),
              },
            ]}
          />
          {section.compensation.purple_forward && (
            <p className="text-caption text-secondary">
              Фиолетовый выдвинут вперёд (позиция {section.compensation.purple_position}) —
              пометка, в подсчёт индекса не входит.
            </p>
          )}
          {section.black_first && (
            <p className="text-caption font-medium text-danger">
              ⚠ Чёрный на первой позиции — подростковый маркер риска, обсудить в беседе.
            </p>
          )}
        </Block>

        {section.history.length > 0 && (
          <Block title="Динамика по предыдущим прохождениям">
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

function ColourChip({ id }: { id: number }) {
  const colour = PSYCHO_COLOR_BY_ID[id];
  return (
    <span
      className="mx-0.5 inline-block h-4 w-4 translate-y-[3px] rounded-[3px] ring-1 ring-inset ring-black/15"
      style={{ backgroundColor: colour?.hex ?? 'transparent' }}
      title={colour?.name ?? String(id)}
      aria-label={colour?.name ?? String(id)}
    />
  );
}

function ColourRow({ label, ids }: { label: string; ids: number[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-caption text-secondary">{label}</span>
      <div className="flex flex-wrap gap-1">
        {ids.map((id, position) => {
          const colour = PSYCHO_COLOR_BY_ID[id];
          return (
            <span
              key={position}
              className="h-6 w-6 rounded ring-1 ring-inset ring-black/15"
              style={{ backgroundColor: colour?.hex ?? 'transparent' }}
              title={`${position + 1}. ${colour?.name ?? id}`}
              aria-label={`Позиция ${position + 1}: ${colour?.name ?? id}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function PositionalPairRow({ pair }: { pair: PsychoEmotionalPositionalPair }) {
  const sign = SIGN[pair.sign];
  return (
    <div className="flex items-center gap-2 text-caption text-secondary">
      <span className="w-4 shrink-0 text-center font-mono text-primary">{sign.glyph}</span>
      <ColourChip id={pair.colors[0]} />
      <ColourChip id={pair.colors[1]} />
      <span className="text-muted">— {sign.meaning}</span>
    </div>
  );
}

function SplitPairRow({ pair }: { pair: PsychoEmotionalSplitPair }) {
  return (
    <div className="flex items-center gap-1.5 text-caption text-secondary">
      <span className="font-mono text-primary">{pair.stable ? '( )' : '[ ]'}</span>
      <ColourChip id={pair.colors[0]} />
      <ColourChip id={pair.colors[1]} />
      <span className="text-muted">{pair.stable ? 'устойчива' : 'расщеплена'}</span>
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
  const contributorEntries = contributors
    ? Object.entries(contributors).filter(([, v]) => v > 0)
    : [];
  return (
    <span className="flex flex-col items-end gap-1">
      <span>
        <span className="font-mono text-primary">
          {value}
          {outOf != null && ` из ${outOf}`}
        </span>{' '}
        · <span className={cn('font-medium', LEVEL_TONE[levelKey] ?? 'text-secondary')}>{level}</span>
      </span>
      {contributorEntries.length > 0 && (
        <span className="flex flex-wrap items-center justify-end gap-1 text-muted">
          Вклад:
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

function CheckIn({ checkin }: { checkin: Record<string, string> }) {
  const entries = Object.entries(checkin);
  if (entries.length === 0) return null;
  return (
    <details className="group border-t border-default pt-2">
      <summary className="flex cursor-pointer select-none items-center gap-1 text-caption text-brand [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        Самочувствие перед тестом (check-in)
      </summary>
      <MetricList
        className="mt-2"
        rows={entries.map(([key, answer]) => ({
          key,
          label: CHECKIN_QUESTION_BY_KEY[key]?.label ?? key,
          value: <span className="text-primary">{answer}</span>,
        }))}
      />
    </details>
  );
}

function HistoryRow({ item }: { item: PsychoEmotionalHistoryItem }) {
  const date = new Date(item.completed_at);
  const dateLabel = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
  const flag = item.validity_flag ? VALIDITY_FLAG[item.validity_flag] : null;
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="font-mono text-primary">№{item.run_number}</span>
      {dateLabel && <span className="text-muted">{dateLabel}</span>}
      <span>СО {item.so ?? '—'}</span>
      <span>· тревога {item.anxiety_score ?? '—'}</span>
      {flag && (
        <span className="flex items-center gap-1">
          ·<span className={cn('h-2 w-2 rounded-full', flag.dot)} aria-hidden />
          {flag.label}
        </span>
      )}
    </li>
  );
}
