import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PsychValiditySection } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { PsychSectionShell } from './PsychSectionShell';

interface ValiditySectionProps {
  section?: PsychValiditySection | null;
}

/**
 * «Достоверность протокола» ("шкала лжи") — the specialist-facing verdict
 * (PRO-300): a traffic light with a state caption, a collapsible numeric
 * breakdown, and the fixed "вероятностная оценка, не заключение" disclaimer.
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

const DISCLAIMER =
  'Вероятностная оценка мотивации одобрения и качества заполнения. Не заключение. ' +
  'Итоговое суждение — за специалистом. Высокий балл не означает ложь.';

export function ValiditySection({ section }: ValiditySectionProps) {
  if (!section) return null;

  const state = STATE[section.traffic_light];
  const yellowThreshold = section.sd_bounds[1] + 1;

  return (
    <PsychSectionShell emoji="🛡️" title="Достоверность протокола" consentOk={section.consent_ok}>
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

        <details className="group border-t border-default pt-2">
          <summary className="flex cursor-pointer select-none items-center gap-1 text-caption text-brand [&::-webkit-details-marker]:hidden">
            <ChevronDown
              className="h-4 w-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
            Расшифровка
          </summary>
          <dl className="mt-2 flex flex-col gap-1.5 text-caption text-secondary">
            <BreakdownRow label="Шкала одобрения (MC-SDS)">
              {section.sd_raw} из 20 · «под вопросом» с {yellowThreshold}
            </BreakdownRow>
            <BreakdownRow label="Серия одинаковых ответов (LongString)">
              {section.longstring_max}
            </BreakdownRow>
            <BreakdownRow label="Вариативность ответов (IRV)">
              {section.irv.toFixed(2)}
            </BreakdownRow>
            <BreakdownRow label="Провалено ловушек внимания">
              {section.infrequency_failed} из 5
            </BreakdownRow>
          </dl>
        </details>

        <p className="text-caption text-muted leading-snug">{DISCLAIMER}</p>
        <p className="text-caption text-muted leading-snug">
          Пороги ориентировочны до локальной калибровки (версия {section.thresholds_version}).
        </p>
      </div>
    </PsychSectionShell>
  );
}

function BreakdownRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="shrink-0 font-mono text-primary">{children}</dd>
    </div>
  );
}
