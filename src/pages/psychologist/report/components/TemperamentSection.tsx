import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM } from '@/shared/ui/admin/density';
import type { TemperamentSection as TemperamentSectionData } from '@/shared/types';

/** Eysenck EPI «Темперамент» — stub, scored in Ф1 (02-Фаза1-Лёгкие-тесты.md). */
export function TemperamentSection({ section }: { section: TemperamentSectionData | null }) {
  if (!section) return null;
  const rows: [string, number | string | null][] = [
    ['Экстраверсия', section.extraversion],
    ['Нейротизм', section.neuroticism],
    ['Шкала лжи', section.lie_scale],
    ['Квадрант', section.quadrant],
  ];
  return (
    <AdminCard title="Темперамент" description="Eysenck EPI (адапт. Шмелева)">
      <ul className="m-0 p-0 list-none flex flex-col gap-1">
        {rows.filter(([, value]) => value !== null).map(([label, value]) => (
          <li key={label} className="flex items-center justify-between gap-2">
            <span className={ADMIN_META}>{label}</span>
            <span className={ADMIN_NUM}>{value}</span>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
