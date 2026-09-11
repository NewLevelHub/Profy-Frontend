import type { PsychValiditySection } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { PsychSectionShell } from './PsychSectionShell';
import { MetricList } from './MetricList';

interface ValiditySectionProps {
  section?: PsychValiditySection | null;
}

/**
 * «Достоверность протокола» ("шкала лжи") — the specialist-facing verdict
 * (PRO-300): a traffic light with a state caption and the numeric breakdown,
 * always expanded (was a `<details>` disclosure — product decision
 * 2026-09-11: a psychologist reading this section wants the numbers on
 * screen, not hidden behind a toggle). The disclaimer paragraph was dropped
 * the same day — the reader doesn't need the caveat either.
 *
 * `null` section → renders nothing (report generated before PRO-299, or the
 * scoring failed). Takes only the section object — no hook/store coupling —
 * so PRO-320 can reuse it on the admin client-review screen.
 *
 * Strings are hardcoded RU (the rest of the results page is too); PRO-293
 * moves them to the `psychValidity` i18n namespace.
 */
const STATE = {
  green: {
    dot: 'bg-success',
    label: 'Данные достоверны',
    detail: 'Ответы по батарее можно интерпретировать без поправок.',
  },
  yellow: {
    dot: 'bg-warning',
    label: 'Вероятна социальная желательность',
    detail:
      'Балл шкалы одобрения высокий — возможно приукрашивание образа. ' +
      'Остальные результаты стоит трактовать с осторожностью.',
  },
  red: {
    dot: 'bg-danger',
    label: 'Небрежное или случайное заполнение — данные под вопросом',
    detail:
      'Сработал контроль качества заполнения. При случайных ответах остальная ' +
      'диагностика малоинформативна.',
  },
} as const;

export function ValiditySection({ section }: ValiditySectionProps) {
  if (!section) return null;

  const state = STATE[section.traffic_light];
  const yellowThreshold = section.sd_bounds[1] + 1;

  return (
    <PsychSectionShell title="Достоверность протокола">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={cn('mt-[3px] h-3 w-3 shrink-0 rounded-full', state.dot)}
            aria-hidden
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-body font-semibold text-primary leading-snug">{state.label}</p>
            <p className="text-caption text-secondary leading-snug">{state.detail}</p>
          </div>
        </div>

        <div className="border-t border-default pt-3">
          <MetricList
            rows={[
              {
                key: 'sd',
                label: 'Шкала одобрения (MC-SDS)',
                value: (
                  <span className="font-mono text-primary">
                    {section.sd_raw} из 20{' '}
                    <span className="font-sans text-muted">· «под вопросом» с {yellowThreshold}</span>
                  </span>
                ),
              },
              {
                key: 'longstring',
                label: 'Серия одинаковых ответов (LongString)',
                value: <span className="font-mono text-primary">{section.longstring_max}</span>,
              },
              {
                key: 'irv',
                label: 'Вариативность ответов (IRV)',
                value: <span className="font-mono text-primary">{section.irv.toFixed(2)}</span>,
              },
              {
                key: 'infrequency',
                label: 'Провалено ловушек внимания',
                value: (
                  <span className="font-mono text-primary">{section.infrequency_failed} из 5</span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </PsychSectionShell>
  );
}
