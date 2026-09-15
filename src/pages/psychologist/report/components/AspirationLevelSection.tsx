import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AspirationLevelSection as AspirationLevelSectionData } from '@/shared/types';

/** Elers achievement motivation «Уровень притязаний» — stub, scored in Ф1
 * (02-Фаза1-Лёгкие-тесты.md). */
export function AspirationLevelSection({ section }: { section: AspirationLevelSectionData | null }) {
  if (!section) return null;
  return (
    <AdminCard title="Уровень притязаний" description="Elers achievement motivation">
      {section.score !== null && (
        <p className={cn(ADMIN_TEXT, 'm-0')}>
          Балл: <span className="font-semibold text-primary">{section.score}</span>
        </p>
      )}
      {section.level && <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-1')}>{section.level}</p>}
    </AdminCard>
  );
}
