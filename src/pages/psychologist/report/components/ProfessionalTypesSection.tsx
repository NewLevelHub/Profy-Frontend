import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { ProfessionalTypesSection as ProfessionalTypesSectionData } from '@/shared/types';

/** ДДО «Профессиональные типы» — stub, scored in Ф1 (02-Фаза1-Лёгкие-тесты.md). */
export function ProfessionalTypesSection({ section }: { section: ProfessionalTypesSectionData | null }) {
  if (!section) return null;
  return (
    <AdminCard title="Профессиональные типы" description="ДДО Климова + Йовайши/Резапкина">
      {section.top_type && (
        <p className={cn(ADMIN_TEXT, 'm-0')}>
          Ведущий тип: <span className="font-semibold text-primary">{section.top_type}</span>
        </p>
      )}
      {section.scores && (
        <ul className="m-0 mt-2 p-0 list-none flex flex-col gap-1">
          {Object.entries(section.scores).map(([key, value]) => (
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
