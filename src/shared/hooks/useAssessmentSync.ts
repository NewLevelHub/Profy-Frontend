import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/shared/store/auth';
import { useAssessmentStore } from '@/shared/store/assessment';
import { assessmentApi } from '@/shared/api/assessment';

export function useAssessmentSync() {
  const userId = useAuthStore(s => s.user?.id);
  const hasHydrated = useAuthStore(s => s._hasHydrated);

  useEffect(() => {
    // Auth store not yet rehydrated — wait for it
    if (!hasHydrated) return;

    // Auth store hydrated but no user (e.g. corrupted state) — unblock UI
    if (!userId) {
      useAssessmentStore.setState({ syncDone: true });
      return;
    }

    let cancelled = false;

    // Safety net: if API hangs for >6s, unblock the UI anyway
    const timeout = setTimeout(() => {
      if (!cancelled) useAssessmentStore.setState({ syncDone: true });
    }, 6000);

    assessmentApi.current()
      .then(data => {
        if (!cancelled) useAssessmentStore.getState().syncFromServer(data, userId);
      })
      .catch(err => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          useAssessmentStore.getState().clearForUser(userId);
        } else {
          useAssessmentStore.setState({ syncDone: true });
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      // Reset syncDone on unmount so AppLayout always shows a spinner on remount
      // rather than briefly flashing stale content while the re-sync is in flight.
      useAssessmentStore.setState({ syncDone: false });
    };
  }, [userId, hasHydrated]);
}
