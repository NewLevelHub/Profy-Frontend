import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TeamRoleSection as TeamRoleSectionData } from '@/shared/types';

/** Belbin BTRSPI «Кто вы в организации» — stub, own table lands in Ф2.3
 * (03-Фаза2-Белбин.md), always null until then. */
export function TeamRoleSection({ section }: { section: TeamRoleSectionData | null }) {
  if (!section) return null;
  return (
    <AdminCard title="Командная роль" description="Belbin BTRSPI">
      {section.top_roles && section.top_roles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {section.top_roles.map((role) => (
            <AdminBadge key={role} tone="quiet">{role}</AdminBadge>
          ))}
        </div>
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
      {section.methodological_note && (
        <p className={cn(ADMIN_TEXT, 'text-muted mt-2')}>{section.methodological_note}</p>
      )}
    </AdminCard>
  );
}
