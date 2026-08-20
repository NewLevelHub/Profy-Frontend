import { Lock } from 'lucide-react';
import { MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminRole } from '@/shared/types';

/**
 * Payment block. `sc-if isAdmin` shows real fields; `sc-if isOperator` shows a
 * locked, dashed-border explanation in place of the section — never a hidden
 * section, per the "visible but role-locked" pattern `RoleGatedAction`
 * established for actions (extended here to a whole section, since there's
 * no single element to wrap).
 *
 * BACKEND GAP: money/payment data does not exist anywhere in the API —
 * confirmed by grepping `shared/api` and `shared/types` for
 * payment/tariff/refund/amount, all zero matches. So even the Administrator
 * branch has no real fields to show; it states that honestly rather than
 * rendering fabricated status/tariff/amount/next-charge/refund values.
 */
export function PaymentBlockCard({ role }: { role: AdminRole }) {
  if (role !== 'administrator') {
    return (
      <div className="rounded-[3px] border border-dashed border-default p-3 flex items-start gap-2.5">
        <Lock size={14} className="text-muted mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-caption leading-[1.35] text-secondary font-semibold">
            Платёжные данные видны только роли «Администратор».
          </p>
          <p className="text-mono-xs text-muted leading-[1.35] mt-1">
            Ваша роль (Оператор) не имеет доступа к финансовым полям — см. RoleBadge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-caption leading-[1.35] text-secondary font-semibold">
        Статус / тариф / сумма / следующее списание / возвраты не отдаются
        ни одним admin-эндпоинтом сегодня (`adminApi` — только 3 read-only GET,
        ни одного платёжного поля).
      </p>
      <p className={MONO_MUTE}>СТАТУС · ТАРИФ · СУММА · СЛЕДУЮЩЕЕ СПИСАНИЕ · ВОЗВРАТЫ: НЕТ ДАННЫХ</p>
    </div>
  );
}
