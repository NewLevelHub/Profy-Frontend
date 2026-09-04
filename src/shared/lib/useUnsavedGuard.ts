import { useEffect } from 'react';
import { useBlocker } from 'react-router';

const MESSAGE = 'Изменения не сохранены. Уйти со страницы?';

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
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(MESSAGE)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

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
