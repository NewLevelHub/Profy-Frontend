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
