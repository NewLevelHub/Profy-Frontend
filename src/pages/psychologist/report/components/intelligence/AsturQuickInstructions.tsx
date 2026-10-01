import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturQuickInstructions as QuickInstructionsData } from '@/shared/types';

/** «Точность выполнения быстрых инструкций» — observed numbers only: on-time
 *  correct answers per half, on-time count, median time. No verdict about
 *  fatigue or stamina, and no half comparison with too few on-time answers. */
export function AsturQuickInstructions({ quick }: { quick: QuickInstructionsData }) {
  const { t } = useTranslation('psychReport');
  const halves = [
    { label: t('psychReport:astur.quick.firstHalf'), correct: quick.first_half_correct, total: quick.first_half_total, percent: quick.first_half_percent },
    { label: t('psychReport:astur.quick.secondHalf'), correct: quick.second_half_correct, total: quick.second_half_total, percent: quick.second_half_percent },
  ];

  return (
    <div className="pt-3 border-t border-default flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <p className={cn(ADMIN_TEXT, 'font-medium text-primary m-0')}>{t('psychReport:astur.quick.title')}</p>
        <p className={cn(ADMIN_META, 'm-0')}>{t('psychReport:astur.quick.note')}</p>
      </div>

      {quick.status === 'insufficient_on_time' ? (
        <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
          {t('psychReport:astur.quick.insufficient', { onTime: quick.on_time, total: quick.total })}
        </p>
      ) : (
        <>
          <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
            {halves.map((half) => (
              <li key={half.label} className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-28 flex-shrink-0')}>{half.label}</span>
                <ProgressBar value={half.percent ?? 0} className="flex-1" />
                <span className={cn(ADMIN_NUM, 'w-24 text-right')}>
                  {t('psychReport:astur.quick.halfValue', { correct: half.correct, total: half.total })}
                </span>
              </li>
            ))}
          </ul>
          {quick.accuracy_change_pp !== null && (
            <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
              {t('psychReport:astur.quick.change', {
                change: quick.accuracy_change_pp > 0 ? `+${quick.accuracy_change_pp}` : quick.accuracy_change_pp,
              })}
            </p>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className={ADMIN_META}>{t('psychReport:astur.quick.onTime', { onTime: quick.on_time, total: quick.total })}</span>
        {quick.median_ms !== null && (
          <span className={ADMIN_META}>
            {t('psychReport:astur.quick.medianTime', { seconds: (quick.median_ms / 1000).toFixed(1) })}
          </span>
        )}
      </div>
    </div>
  );
}
