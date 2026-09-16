/**
 * Builds a PATCH body containing only the keys whose value actually changed
 * from `initial` to `current`. Required by the admin university/program
 * editing API: every key present in the PATCH body gets locked against the
 * next automated seed/backfill re-sync (see docs/admin-university-editing-api.md
 * §5.2), so sending the whole form state on every save would silently lock
 * every field forever after the first edit.
 */
export function buildPatchBody<T extends object>(
  initial: T,
  current: T,
  keys: readonly (keyof T)[],
): Partial<T> {
  const patch: Partial<T> = {};
  for (const key of keys) {
    if (JSON.stringify(initial[key]) !== JSON.stringify(current[key])) {
      patch[key] = current[key];
    }
  }
  return patch;
}

/**
 * Whether `field` is admin-overridden for `locale` specifically, on a
 * question-bank content row (question/pair/statement/direction — the
 * single-row-per-item design, not `AdminUniversityDetail`'s flat
 * `admin_locked_fields: string[]`, which never needs this).
 *
 * A localized field's override entry is itself a `{locale: value}` map (only
 * the edited locale's key is present — editing kk never touches ru's entry),
 * unlike a structural field's override, which is the bare value. See
 * `app.services.admin_lock.apply_overrides` on the backend.
 */
export function isLocalizedFieldLocked(
  overrides: Record<string, unknown>,
  field: string,
  locale: string,
): boolean {
  const entry = overrides[field];
  return typeof entry === 'object' && entry !== null && locale in (entry as Record<string, unknown>);
}
