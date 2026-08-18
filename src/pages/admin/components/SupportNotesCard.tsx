import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { RoleGatedAction } from '@/shared/ui/admin/RoleGatedAction';
import { MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminRole } from '@/shared/types';

/**
 * Threaded support notes. No note/comment data model exists anywhere in the
 * API for user records (grepped for note/comment near admin/user types —
 * nothing), so this renders an honest empty thread instead of fake notes.
 *
 * "+ добавить заметку" is gated to Administrator via `RoleGatedAction` (reused,
 * not rebuilt) for the Operator case. For Administrator, the button is still
 * disabled — same "wired, not connected" pattern as `ChangeLogTable`'s revert
 * button — since there's no endpoint to actually post a note to yet.
 */
export function SupportNotesCard({ role }: { role: AdminRole }) {
  const addButton = (
    <Tooltip content="Эндпоинт для заметок ещё не подключён к бэкенду">
      <span tabIndex={0} className="inline-flex rounded-[3px]">
        <Button variant="ghost" size="sm" disabled aria-disabled muteSound>
          <Plus size={14} />
          Добавить заметку
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <div className="space-y-2.5">
      <p className="text-caption leading-[1.35] text-secondary font-semibold">
        Заметок пока нет — история заметок по пользователю не ведётся бэкендом.
      </p>
      {role === 'administrator' ? (
        addButton
      ) : (
        <RoleGatedAction allowed={false}>
          <Button variant="ghost" size="sm" muteSound>
            <Plus size={14} />
            Добавить заметку
          </Button>
        </RoleGatedAction>
      )}
      <p className={MONO_MUTE}>АВТОР · ВРЕМЯ: НЕТ ДАННЫХ</p>
    </div>
  );
}
