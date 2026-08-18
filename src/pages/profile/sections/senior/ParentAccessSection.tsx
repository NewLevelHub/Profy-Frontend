import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';

interface PermissionRow {
  label: string;
  open: boolean;
}

// Same 4 items/order the design spec calls out, matched against what the
// product philosophy already enforces elsewhere (ResultResponse's contract
// comment: "No raw scores/percentages/codes anywhere" is exposed student-side)
// — raw RIASEC profile/answers and full direction/university detail stay
// closed, progress status and the de-numbered 3-area interest map are open.
//
// NOTE (backend gap): there is no per-request parent-access-permission toggle
// anywhere in the API — no `/parent` route, no ParentAccessRequest endpoint,
// and no "СВЯЗЬ РОДИТЕЛЬ — РЕБЁНОК" block in AdminUserDetailPage.tsx to cross-
// check against (grepped, confirmed absent). So this table is static reference
// copy describing what parent access always includes when granted, not a
// live per-user/per-request state — see ParentAccessRequest in shared/types
// for the real contract a future "pending request" card would need.
const PERMISSIONS: PermissionRow[] = [
  { label: 'Статус прохождения и прогресс плана', open: true },
  { label: 'Три области интереса, без чисел и рангов', open: true },
  { label: 'Профиль RIASEC и ответы', open: false },
  { label: 'Направления, вузы, гэп-анализ', open: false },
];

/**
 * "ДОСТУП РОДИТЕЛЯ · УПРАВЛЯЕШЬ ТОЛЬКО ТЫ" — the spec also calls for a live
 * pending parent-access request card with Открыть/Отклонить actions. There is
 * no backend support for that at all in this app (no endpoint, no data shape
 * populated anywhere) — rather than fabricate a fake pending request with
 * buttons wired to nothing, this renders only the real, static part: what
 * parent access always includes/excludes.
 */
export function ParentAccessSection() {
  return (
    <Card className="border-l-4 p-0 overflow-hidden" style={{ borderLeftColor: 'var(--dawn)' }}>
      <div className="p-4 sm:p-6">
        <p className="font-mono text-tiny font-bold uppercase tracking-label text-muted mb-2">
          ДОСТУП РОДИТЕЛЯ · УПРАВЛЯЕШЬ ТОЛЬКО ТЫ
        </p>
        <p className="text-caption text-secondary leading-relaxed">
          Когда доступ открыт, родитель видит только то, что отмечено «ОТКРЫТО» ниже — остальное
          остаётся закрытым. Заявок на доступ пока нет.
        </p>
      </div>

      <div className="border-t border-default">
        {PERMISSIONS.map((row, i) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--hairline)' }}
          >
            <span className="text-label font-medium" style={{ color: 'var(--midnight)' }}>
              {row.label}
            </span>
            <Badge variant={row.open ? 'brand' : 'default'} className="flex-shrink-0">
              {row.open ? 'ОТКРЫТО' : 'ЗАКРЫТО'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
