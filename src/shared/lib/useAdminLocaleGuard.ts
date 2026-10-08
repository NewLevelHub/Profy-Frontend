import { useEffect } from 'react';
import { create } from 'zustand';

/** The active content editor owns this guard; it is never persisted. */
export const useAdminLocaleGuardState = create<{ blocked: boolean }>(() => ({ blocked: false }));

export function useAdminLocaleGuard(blocked: boolean) {
  useEffect(() => {
    useAdminLocaleGuardState.setState({ blocked });
    return () => { useAdminLocaleGuardState.setState({ blocked: false }); };
  }, [blocked]);
}
