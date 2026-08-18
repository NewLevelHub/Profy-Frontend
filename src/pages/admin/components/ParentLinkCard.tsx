import { MONO_MUTE } from '@/shared/ui/admin/density';

/**
 * Parent-child link card. Per spec this should mirror `/profile`'s "ДОСТУП
 * РОДИТЕЛЯ" 4-item permission list — but that list doesn't exist anywhere in
 * the current codebase: `src/pages/profile/**` has no parent-access section
 * (grepped for "родител"/"parent"/"ДОСТУП" — zero matches outside admin's own
 * new scaffolding and unrelated files like Button's `disabled` prop name).
 * There is also no parent field at all on `AdminUserDetail` or
 * `AdminUserListItem` (no name/email/id, no permission tier). This is a
 * two-layer gap: no canonical list to mirror, and no data to populate a card
 * with even if one existed — so no permission list or parent identity is
 * fabricated here.
 *
 * Second-child/sibling accounts: the data model has no field indicating a
 * linked sibling anywhere (`AdminUserDetail` is a single-user record with no
 * `children`/`siblings` reference), so that row is not rendered rather than
 * guessed at.
 */
export function ParentLinkCard() {
  return (
    <div className="space-y-1.5">
      <p className="text-caption leading-[1.35] text-secondary font-semibold">
        Связь с аккаунтом родителя не отдаётся ни одним admin-эндпоинтом сегодня —
        ни имени, ни email, ни id родителя, ни уровня доступа.
      </p>
      <p className={MONO_MUTE}>
        ДОСТУП РОДИТЕЛЯ: НЕТ ДАННЫХ
      </p>
      <p className="text-mono-xs text-muted leading-[1.35]">
        Канонический список из 4 пунктов ("ДОСТУП РОДИТЕЛЯ") также ещё не существует
        на `/profile` — сверять здесь пока не с чем.
      </p>
    </div>
  );
}
