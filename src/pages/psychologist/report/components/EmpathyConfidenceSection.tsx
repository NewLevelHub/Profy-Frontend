import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { EmpathyConfidenceSection as EmpathyConfidenceSectionData } from '@/shared/types';

/** Бойко «Эмпатия» + Кондаш/Прихожан «Соц. уверенность» — stub, scored in Ф1
 * (02-Фаза1-Лёгкие-тесты.md). */
export function EmpathyConfidenceSection({ section }: { section: EmpathyConfidenceSectionData | null }) {
  if (!section) return null;
  return (
    <AdminCard title="Эмпатия и уверенность" description="Бойко + Кондаш/Прихожан">
      {section.empathy_total !== null && (
        <p className={cn(ADMIN_TEXT, 'm-0')}>
          Эмпатия (итого): <span className="font-semibold text-primary">{section.empathy_total}</span>
        </p>
      )}
      {section.confidence_stens !== null && (
        <p className={cn(ADMIN_TEXT, 'm-0 mt-1')}>
          Уверенность: <span className="font-semibold text-primary">{section.confidence_stens}</span> стен
        </p>
      )}
      {section.empathy_channels && (
        <ul className="m-0 mt-2 p-0 list-none flex flex-col gap-1">
          {Object.entries(section.empathy_channels).map(([key, value]) => (
            <li key={key} className="flex items-center justify-between gap-2">
              <span className={ADMIN_META}>{key}</span>
              <span className={ADMIN_NUM}>{value}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
