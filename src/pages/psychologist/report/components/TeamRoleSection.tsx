import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TeamRoleSection as TeamRoleSectionData } from '@/shared/types';
import { BarChart, type BarChartItem } from './BarChart';

const ROLE_LABELS: Record<string, string> = {
  implementer: 'Исполнитель',
  coordinator: 'Председатель',
  shaper: 'Формирователь',
  plant: 'Мыслитель',
  resource_investigator: 'Разведчик',
  evaluator: 'Оценщик',
  team_worker: 'Коллективист',
  finisher: 'Доводчик',
};

// One color per group, matching this file's own dominant/supporting/
// avoidance/neutral classification — not per-role, roles don't carry their
// own fixed color, only their group does.
const DOMINANT_COLOR = 'var(--brand)';
const SUPPORTING_COLOR = 'var(--accent)';
// `--border` was tried first but reads almost the same as the bar's own
// empty track (`bg-raised`) — too close to invisible for a short bar.
// `--mute` (already this theme's --text-secondary/--text-muted) gives a
// clearly visible but deliberately unexciting grey, distinct from both the
// track and the two "important" colors above.
const AVOIDANCE_COLOR = 'var(--mute)';
const NEUTRAL_COLOR = 'var(--brand-subtle)';

/** Belbin BTRSPI «Кто вы в организации» — Bar Chart (Ф2.7), роли по
 * убыванию балла, доминирующая/поддерживающие/избегаемые визуально
 * различимы цветом. `methodological_note` carries the source's
 * 18+/corporate-context caveat (epic decision table §2). */
export function TeamRoleSection({ section }: { section: TeamRoleSectionData | null }) {
  if (!section) return null;
  const hasChart = !!section.scores && !!section.ranked_roles && section.ranked_roles.length > 0;
  const maxScore = hasChart ? Math.max(...Object.values(section.scores!)) : 0;

  const items: BarChartItem[] = hasChart
    ? section.ranked_roles!.map((role) => {
        const color = role === section.dominant_role
          ? DOMINANT_COLOR
          : section.supporting_roles?.includes(role)
            ? SUPPORTING_COLOR
            : section.avoidance_roles?.includes(role)
              ? AVOIDANCE_COLOR
              : NEUTRAL_COLOR;
        return {
          key: role,
          label: ROLE_LABELS[role] ?? role,
          value: section.scores![role] ?? 0,
          color,
        };
      })
    : [];

  return (
    <AdminCard title="Командная роль" description="Belbin BTRSPI">
      {section.dominant_role && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <AdminBadge tone="brand" dot>
            Доминирующая: {ROLE_LABELS[section.dominant_role] ?? section.dominant_role}
          </AdminBadge>
          {section.supporting_roles?.map((role) => (
            <AdminBadge key={role} tone="accent">
              {ROLE_LABELS[role] ?? role}
            </AdminBadge>
          ))}
          {section.avoidance_roles?.map((role) => (
            <AdminBadge key={role} tone="quiet">
              Избегание: {ROLE_LABELS[role] ?? role}
            </AdminBadge>
          ))}
        </div>
      )}

      {hasChart && <BarChart items={items} max={maxScore} />}

      {section.methodological_note && (
        <p className={cn(ADMIN_TEXT, 'text-muted mt-3')}>{section.methodological_note}</p>
      )}
    </AdminCard>
  );
}
