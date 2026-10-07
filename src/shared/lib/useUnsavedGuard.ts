import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';
import { confirm } from './confirm';

/**
 * Warns before losing unsaved admin form edits — both for in-app navigation
 * (react-router's blocker, available because the app uses a data router) and
 * for closing/reloading the tab (`beforeunload`).
 *
 * Every admin detail screen already tracked `isDirty` to enable its save
 * button; nothing acted on it when leaving. A misclick on "Назад" silently
 * discarded a rewritten question text.
 */
export function useUnsavedGuard(dirty: boolean) {
  const { t } = useTranslation('admin');
  const MESSAGE = t('form.unsavedWarning');
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // Effect re-runs on every blocker identity change while still 'blocked';
  // the flag keeps it to one dialog per blocked navigation.
  const blocked = blocker.state === 'blocked';
  useEffect(() => {
    if (!blocked) return;
    let active = true;
    void confirm({
      title: MESSAGE,
      confirmLabel: t('form.unsavedLeave'),
      cancelLabel: t('form.unsavedStay'),
    }).then((ok) => {
      if (!active) return;
      if (ok) blocker.proceed?.();
      else blocker.reset?.();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Browsers ignore custom text and show their own copy; assigning
      // returnValue is still what triggers the prompt at all.
      event.returnValue = MESSAGE;
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);
}
