import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { IntelligenceSection as IntelligenceSectionData } from '@/shared/types';

/** АСТУР «Характеристики интеллекта» — stub, own table lands in Ф3.3
 * (04-Фаза3-АСТУР.md), always null until then. */
export function IntelligenceSection({ section }: { section: IntelligenceSectionData | null }) {
  if (!section) return null;
  return (
    <AdminCard title="Характеристики интеллекта" description="АСТУР (ПИ РАО, 1995)">
      {section.spn_group !== null && (
        <p className={cn(ADMIN_TEXT, 'm-0')}>
          Группа СПН: <span className="font-semibold text-primary">{section.spn_group}</span>
        </p>
      )}
      {section.subtest_scores && (
        <ul className="m-0 mt-2 p-0 list-none flex flex-col gap-1">
          {Object.entries(section.subtest_scores).map(([key, value]) => (
            <li key={key} className="flex items-center justify-between gap-2">
              <span className={ADMIN_META}>{key}</span>
              <span className={ADMIN_NUM}>{value}</span>
            </li>
          ))}
        </ul>
      )}
      {section.learning_profile && (
        <p className={cn(ADMIN_TEXT, 'text-muted mt-2')}>{section.learning_profile}</p>
      )}
    </AdminCard>
  );
}
