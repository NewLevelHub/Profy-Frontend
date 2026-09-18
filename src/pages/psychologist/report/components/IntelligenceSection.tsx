import { useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { IntelligenceSection as IntelligenceSectionData } from '@/shared/types';
import { LineChart, type LineChartPoint } from './LineChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import {
  ASTUR_METHODOLOGY,
  ASTUR_SUBTESTS,
  ASTUR_SPN_GROUPS,
  ASTUR_LABILITY_NOTE,
} from '../model/psychTestExplanations';

const SUBTEST_ORDER = ['awareness', 'analogies', 'classification', 'generalization', 'logical_schemas', 'numeric_series'];

const SUBTEST_MAX: Record<string, number> = {
  awareness: 20,
  analogies: 16,
  classification: 12,
  generalization: 38,
  logical_schemas: 26,
  numeric_series: 15,
};

const SUBTEST_SHORT_LABELS: Record<string, string> = {
  awareness: 'Осведомл.',
  analogies: 'Аналогии',
  classification: 'Классиф.',
  generalization: 'Обобщение',
  logical_schemas: 'Лог. схемы',
  numeric_series: 'Числ. ряды',
};

const SUBTEST_FULL_LABELS: Record<string, string> = {
  awareness: 'Осведомлённость',
  analogies: 'Двойные аналогии',
  classification: 'Классификации',
  generalization: 'Обобщение',
  logical_schemas: 'Логические схемы',
  numeric_series: 'Числовые ряды',
};

const SUBJECT_LABELS: Record<string, string> = {
  humanities: 'Гуманитарный',
  physics_math: 'Физико-математический',
  natural_science: 'Естественнонаучный',
};

/**
 * АСТУР «Характеристики интеллекта» — линейный график по 6 субтестам +
 * СПН-группа + профиль обучения + подробный доказательный разбор структуры интеллекта.
 */
export function IntelligenceSection({ section }: { section: IntelligenceSectionData | null }) {
  if (!section) return null;
  const {
    raw_score, subtest_scores, spn_group, learning_profile, learning_profile_shares,
    lability_first_half_accuracy, lability_second_half_accuracy, lability_fatigue_signal,
  } = section;

  // Selected item to inspect: subtest key or 'spn' or 'lability'
  const [selectedKey, setSelectedKey] = useState<string | null>(spn_group ? 'spn' : 'generalization');

  const activeSubtestInfo = selectedKey && selectedKey in ASTUR_SUBTESTS ? ASTUR_SUBTESTS[selectedKey] : null;
  const isSpnSelected = selectedKey === 'spn';
  const isLabilitySelected = selectedKey === 'lability';

  const points: LineChartPoint[] | null = subtest_scores
    ? SUBTEST_ORDER.filter((key) => key in subtest_scores).map((key) => ({
        key,
        label: SUBTEST_SHORT_LABELS[key],
        value: subtest_scores[key],
        max: SUBTEST_MAX[key],
      }))
    : null;

  return (
    <AdminCard title="Характеристики интеллекта" description="АСТУР (ПИ РАО, 1995)">
      <PsychTestHeaderInfo methodology={ASTUR_METHODOLOGY} />

      {points && points.length > 0 && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <LineChart points={points} />
          <div className="flex items-center gap-3">
            {raw_score !== null && (
              <span className={cn(ADMIN_NUM, 'text-primary')}>Общий балл: {raw_score}/127</span>
            )}
            {spn_group !== null && (
              <button
                type="button"
                onClick={() => setSelectedKey(isSpnSelected ? null : 'spn')}
                className="inline-flex items-center gap-1 focus:outline-none"
              >
                <AdminBadge tone="brand">СПН-группа {spn_group}/5</AdminBadge>
                <ChevronDown size={13} className={cn('text-muted transition-transform', isSpnSelected && 'rotate-180')} />
              </button>
            )}
          </div>

          <ul className="m-0 p-0 list-none flex flex-col gap-1 w-full max-w-[320px]">
            {points.map((p) => {
              const isSelected = selectedKey === p.key;
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(isSelected ? null : p.key)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-1.5 rounded-[8px] text-left transition-colors focus:outline-none',
                      isSelected ? 'bg-brand-subtle ring-1 ring-brand/30' : 'hover:bg-raised/70',
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={cn(ADMIN_META, isSelected && 'text-primary font-medium')}>
                        {SUBTEST_FULL_LABELS[p.key]}
                      </span>
                      <ChevronDown size={12} className={cn('text-muted transition-transform', isSelected && 'rotate-180')} />
                    </span>
                    <span className={cn(ADMIN_NUM, isSelected && 'font-bold text-brand')}>
                      {p.value}/{p.max}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {learning_profile && (
        <div className="pt-3 border-t border-default mb-4">
          <p className={cn(ADMIN_TEXT, 'text-secondary mb-2')}>
            Рекомендуемый профиль обучения:{' '}
            <span className="font-semibold text-primary">{SUBJECT_LABELS[learning_profile] ?? learning_profile}</span>
          </p>
          {learning_profile_shares && (
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {Object.entries(learning_profile_shares).map(([subject, share]) => (
                <li key={subject} className="flex items-center gap-2">
                  <span className={cn(ADMIN_META, 'w-40 flex-shrink-0')}>{SUBJECT_LABELS[subject] ?? subject}</span>
                  <ProgressBar value={share * 100} className="flex-1" />
                  <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(share * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(lability_first_half_accuracy !== null || lability_second_half_accuracy !== null) && (
        <div className="pt-3 border-t border-default">
          <button
            type="button"
            onClick={() => setSelectedKey(isLabilitySelected ? null : 'lability')}
            className={cn(
              'w-full flex items-center justify-between gap-2 p-1.5 rounded-[8px] mb-2 text-left transition-colors focus:outline-none',
              isLabilitySelected ? 'bg-brand-subtle ring-1 ring-brand/30' : 'hover:bg-raised/50',
            )}
          >
            <span className={cn(ADMIN_TEXT, 'font-medium', isLabilitySelected && 'text-brand font-semibold')}>
              Умственная работоспособность (лабильность)
            </span>
            <ChevronDown size={13} className={cn('text-muted transition-transform', isLabilitySelected && 'rotate-180')} />
          </button>

          {lability_fatigue_signal && (
            <div role="alert" className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle">
              <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
                Точность упала более чем на 25% между половинами блока — признак умственной утомляемости.
              </p>
            </div>
          )}

          <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
            {lability_first_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-32 flex-shrink-0')}>1-я половина</span>
                <ProgressBar value={lability_first_half_accuracy * 100} className="flex-1" />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_first_half_accuracy * 100)}%</span>
              </li>
            )}
            {lability_second_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-32 flex-shrink-0')}>2-я половина</span>
                <ProgressBar
                  value={lability_second_half_accuracy * 100}
                  variant={lability_fatigue_signal ? 'accent' : 'brand'}
                  className="flex-1"
                />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_second_half_accuracy * 100)}%</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Expanded RIASEC-style Detail Card */}
      {activeSubtestInfo && (
        <PsychDetailCard
          title={activeSubtestInfo.name}
          badge={<AdminBadge tone="brand">Субтест интеллекта</AdminBadge>}
          meaning={activeSubtestInfo.meaning}
          means={activeSubtestInfo.behavioralManifestation}
          follows={activeSubtestInfo.psychologistFocus}
          why={`Ученик набрал ${subtest_scores?.[selectedKey!] ?? 0} из ${SUBTEST_MAX[selectedKey!] ?? 0} баллов. ${activeSubtestInfo.normsExplanation ?? ''}`}
          onClose={() => setSelectedKey(null)}
        />
      )}

      {isSpnSelected && spn_group !== null && (
        <PsychDetailCard
          title={`Социально-психологический норматив: СПН-группа ${spn_group}/5`}
          badge={<AdminBadge tone="brand">Норматив развития</AdminBadge>}
          meaning={ASTUR_SPN_GROUPS[spn_group]?.meaning ?? ''}
          means={ASTUR_SPN_GROUPS[spn_group]?.meaning ?? ''}
          follows={ASTUR_SPN_GROUPS[spn_group]?.advice ?? ''}
          why={`Общий сырой балл по всем 6 субтестам: ${raw_score}/127. Границы групп (предварительные, не откалиброваны на выборке платформы — см. astur_thresholds.json): Группа 1 (96–127), Группа 2 (65–95), Группа 3 (33–64), Группа 4 (12–32), Группа 5 (0–11).`}
          riskWarning={
            spn_group >= 4
              ? 'Группа ниже среднего по предварительной шкале. Это не диагноз — границы групп ещё не откалиброваны на выборке платформы, поэтому результат стоит рассматривать как повод присмотреться внимательнее, а не как готовый вывод об академических трудностях.'
              : undefined
          }
          onClose={() => setSelectedKey(null)}
        />
      )}

      {isLabilitySelected && (
        <PsychDetailCard
          title={ASTUR_LABILITY_NOTE.title}
          badge={
            <AdminBadge tone={lability_fatigue_signal ? 'danger' : 'neutral'}>
              {lability_fatigue_signal ? 'Сигнал утомляемости' : 'Работоспособность стабильна'}
            </AdminBadge>
          }
          meaning="Оценивает переключаемость внимания, темп умственной деятельности и сопротивляемость истощению в условиях ограниченного времени."
          means={
            lability_fatigue_signal
              ? ASTUR_LABILITY_NOTE.fatigueDetected
              : ASTUR_LABILITY_NOTE.stable
          }
          follows={
            lability_fatigue_signal
              ? 'Рекомендовать соблюдение гигиены интеллектуального труда: метод Pomodoro (25 мин работы / 5 мин отдыха), исключение ночных зубрежек перед экзаменами, дыхательные практики.'
              : 'Высокая умственная выносливость. Подросток готов к длительным интеллектуальным испытаниям и высокой плотности учебного графика.'
          }
          why={`Точность первой половины: ${Math.round((lability_first_half_accuracy ?? 0) * 100)}%, второй половины: ${Math.round((lability_second_half_accuracy ?? 0) * 100)}%.`}
          riskWarning={
            lability_fatigue_signal
              ? 'При перегрузках и непрерывных многочасовых тестах резко возрастает количество «глупых» ошибок из-за истощения внимания.'
              : undefined
          }
          onClose={() => setSelectedKey(null)}
        />
      )}
    </AdminCard>
  );
}
