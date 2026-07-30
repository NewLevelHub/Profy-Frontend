import { useLocation } from 'react-router';

/** Typed wrapper around useLocation().state — react-router leaves state as
 * `unknown`, so every reader had its own ad hoc `as Shape` cast. Route state
 * shapes live in @/app/routes so a state key can't drift between the
 * navigate() call that sets it and the page that reads it. Always returns an
 * object (never null), since every caller immediately destructures it with
 * defaults. */
export function useTypedLocationState<T extends object>(): Partial<T> {
  const { state } = useLocation();
  return (state ?? {}) as Partial<T>;
}
