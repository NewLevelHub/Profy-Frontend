import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { ValiditySection as ValiditySectionData } from '@/shared/types';

const SD_LEVEL_LABELS: Record<string, string> = {
  ok: 'В норме',
  social_desirability: 'Вероятна социальная желательность',
  high: 'Высокая — данные под вопросом',
};

const TRAFFIC_LIGHT: Record<string, { icon: typeof CheckCircle2; border: string; bg: string; text: string; label: string }> = {
  green: { icon: CheckCircle2, border: 'border-success', bg: 'bg-success-subtle', text: 'text-success', label: 'Данные достоверны' },
  yellow: { icon: HelpCircle, border: 'border-default', bg: 'bg-raised', text: 'text-secondary', label: 'Вероятна социальная желательность' },
  red: { icon: AlertTriangle, border: 'border-danger', bg: 'bg-danger-subtle', text: 'text-danger', label: 'Небрежное/случайное заполнение — данные под вопросом' },
};

/** PRO-282 «Достоверность протокола» (шкала лжи / carelessness). Ф4.1 —
 *  впервые появляется на этом фронтенде (собственный фронт PRO-282 сюда не
 *  вливался, бэкенд-контракт уже существовал). Только психолог/админ видит
 *  эту секцию (report_service.psych_sections_for), ученик — никогда. */
export function ValiditySection({ section }: { section: ValiditySectionData | null }) {
  if (!section) return null;
  const tl = TRAFFIC_LIGHT[section.traffic_light] ?? TRAFFIC_LIGHT.yellow;
  const Icon = tl.icon;

  return (
    <AdminCard title="Достоверность протокола" description="Шкала лжи (MC-SDS) + индексы небрежности">
      <div className={cn('flex items-start gap-3 p-3 mb-3 rounded-[14px] border', tl.border, tl.bg)} role="status">
        <Icon size={15} className={cn(tl.text, 'flex-shrink-0 mt-0.5')} />
        <p className={cn(ADMIN_TEXT, tl.text, 'font-semibold m-0')}>{tl.label}</p>
      </div>

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Шкала одобрения (MC-SDS)</span>
          <span className="flex items-center gap-2">
            <span className={ADMIN_NUM}>{section.sd_raw}/20 (жёлтая зона с {section.sd_bounds[0] + 1})</span>
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Уровень одобрения</span>
          <span className={ADMIN_NUM}>{SD_LEVEL_LABELS[section.sd_level] ?? section.sd_level}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Серия одинаковых ответов (LongString)</span>
          <span className={ADMIN_NUM}>{section.longstring_max}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Вариативность ответов (IRV)</span>
          <span className={ADMIN_NUM}>{section.irv.toFixed(2)}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Провалено ловушек внимания</span>
          <span className={ADMIN_NUM}>{section.infrequency_failed}/5</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Согласие на психоблок</span>
          <span className={ADMIN_NUM}>{section.consent_ok ? 'Есть' : 'Не зафиксировано'}</span>
        </li>
      </ul>
      <p className={cn(ADMIN_META, 'mt-3')}>
        Вероятностная оценка мотивации одобрения и качества заполнения. Не заключение — итоговое суждение за специалистом.
        Пороги ориентировочны до локальной калибровки (версия {section.thresholds_version}).
      </p>
    </AdminCard>
  );
}
