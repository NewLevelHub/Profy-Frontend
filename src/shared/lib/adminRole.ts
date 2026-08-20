import type { AdminRole } from '@/shared/types';

/**
 * Derives the frontend-only Operator/Administrator distinction from the one
 * piece of role data that actually exists in the backend today: `is_admin`.
 *
 * BACKEND GAP: there is no real `role: 'operator' | 'administrator'` field in
 * the API — `User`, `AdminUserListItem` and `AdminUserDetail` all still only
 * carry `is_admin: boolean`. Everyone who can reach `/admin/*` already passed
 * `RequireAdmin`, which only checks `is_admin`, so in the current system there
 * is no live account that would resolve to `'operator'` — this derivation is
 * provisional scaffolding for the UI layer, not real role-based authorization.
 * Treat every gate built on top of this as a visual/UX pattern only, until the
 * backend exposes a real role field to key off.
 */
export function deriveAdminRole(isAdmin: boolean | null | undefined): AdminRole {
  return isAdmin ? 'administrator' : 'operator';
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  administrator: 'Администратор',
  operator: 'Оператор',
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  administrator: 'Полный доступ, включая финансовые данные и деструктивные действия',
  operator: 'Только чтение и алерты — без доступа к финансовым данным',
};

export const REQUIRES_ADMIN_TOOLTIP = 'Требует роли Администратор';
