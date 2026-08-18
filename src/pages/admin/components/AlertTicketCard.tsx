import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminRole } from '@/shared/types';

/**
 * Alert/"тревога" ticket card. There is no alert-ticket endpoint or type
 * anywhere in the API today (grepped `shared/api` and `shared/types` —
 * nothing named alert/ticket/тревога exists), so this renders the real card
 * shape the spec describes with an honest empty state instead of a fabricated
 * open ticket. Both roles get "закрыть с комментарием" / "вернуть в новые" —
 * this is explicitly the one action the Operator role CAN take per spec, so
 * neither button goes through `RoleGatedAction`; both are disabled only
 * because no backend action exists yet, with a tooltip saying so (same
 * "wired, not connected" pattern as `ChangeLogTable`'s revert button).
 */
export function AlertTicketCard({ role }: { role: AdminRole }) {
  return (
    <div className="rounded-[3px] border border-[color:var(--dawn)] bg-[color:var(--warning-subtle,transparent)] p-3 space-y-2.5" style={{ background: 'color-mix(in srgb, var(--dawn) 8%, var(--bg-surface))' }}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-[color:var(--dawn)]" />
        <span className={MONO_MUTE}>ТРЕВОГА</span>
      </div>
      <p className="text-caption leading-[1.35] text-secondary font-semibold">
        Открытых тикетов нет — бэкенд ещё не отдаёт alert-тикеты по пользователю
        (нет ни эндпоинта, ни данных для id/статуса/исполнителя).
      </p>
      <div className="flex items-center gap-2 pt-1">
        <Tooltip content="Действие ещё не подключено к бэкенду">
          <span tabIndex={0} className="inline-flex rounded-[3px]">
            <Button variant="ghost" size="sm" disabled aria-disabled muteSound>
              Закрыть с комментарием
            </Button>
          </span>
        </Tooltip>
        <Tooltip content="Действие ещё не подключено к бэкенду">
          <span tabIndex={0} className="inline-flex rounded-[3px]">
            <Button variant="ghost" size="sm" disabled aria-disabled muteSound>
              Вернуть в новые
            </Button>
          </span>
        </Tooltip>
      </div>
      <p className="text-mono-xs text-muted leading-[1.35]">
        {role === 'operator' ? 'Доступно вашей роли (Оператор): ' : ''}
        Комментарий к закрытию попадёт в журнал изменений («История изменений» ниже) —
        как только появится реальный тикет и эндпоинт.
      </p>
    </div>
  );
}
