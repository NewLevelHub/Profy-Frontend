import { RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { RoleGatedAction } from '@/shared/ui/admin/RoleGatedAction';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { AdminRole, ChangeLogEntry } from '@/shared/types';

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ChangeLogTableProps {
  entries: ChangeLogEntry[];
  role: AdminRole;
}

/**
 * Field-level edit history table: field id / author / timestamp / old→new
 * value / revert.
 *
 * BACKEND GAP: there is no audit-log or change-history endpoint for user
 * records today (`adminApi` exposes only read GETs — see `src/shared/api/admin.ts`).
 * Callers must pass real `ChangeLogEntry[]` once such an endpoint exists;
 * this component never fabricates rows itself, and renders a real, honest
 * empty state when `entries` is empty.
 *
 * The revert button is always rendered — never hidden — but is disabled
 * whenever either (a) the current role can't perform it, or (b) no real
 * revert endpoint exists yet (`entry.can_revert === false`, currently always
 * the case), each with its own tooltip explaining why.
 */
export function ChangeLogTable({ entries, role }: ChangeLogTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-secondary font-semibold">
        История изменений пока не ведётся — бэкенд ещё не отдаёт журнал изменений по пользователю
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-raised border-b border-default">
          <tr>
            <th className="text-left px-3 py-2.5 font-extrabold">Поле</th>
            <th className="text-left px-3 py-2.5 font-extrabold">Автор</th>
            <th className="text-left px-3 py-2.5 font-extrabold">Время</th>
            <th className="text-left px-3 py-2.5 font-extrabold">Было → стало</th>
            <th className="text-left px-3 py-2.5 font-extrabold">Действие</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-default last:border-b-0">
              <td className="px-3 py-2.5">
                <code className="font-mono text-xs font-bold text-brand">{entry.field_id}</code>
              </td>
              <td className="px-3 py-2.5 font-semibold">{entry.author}</td>
              <td className="px-3 py-2.5 text-secondary">{formatDate(entry.timestamp)}</td>
              <td className="px-3 py-2.5">
                <span className="text-secondary">{entry.old_value ?? '—'}</span>
                {' → '}
                <span className="font-bold text-primary">{entry.new_value ?? '—'}</span>
              </td>
              <td className="px-3 py-2.5">
                {role !== 'administrator' ? (
                  <RoleGatedAction allowed={false}>
                    <Button variant="ghost" size="sm">
                      <RotateCcw size={14} />
                      Откатить
                    </Button>
                  </RoleGatedAction>
                ) : (
                  <Tooltip content="Функция отката ещё не подключена к бэкенду">
                    <span tabIndex={0} className="inline-flex rounded-[var(--radius)]">
                      <Button variant="ghost" size="sm" disabled aria-disabled>
                        <RotateCcw size={14} />
                        Откатить
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
