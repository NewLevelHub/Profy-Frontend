import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';
import { FullPageSpinner } from '@/shared/ui/Spinner';

const RELOAD_KEY = 'profy-chunk-reload-at';
const RELOAD_COOLDOWN_MS = 60_000;

/**
 * After a deploy, a tab opened on the previous build still asks for page
 * chunks whose hashed names are gone from the server. Chrome, Firefox and
 * Safari word a missing JS chunk differently; a missing page stylesheet is
 * Vite's own preload error.
 */
function isChunkLoadError(error: unknown): boolean {
  return error instanceof Error
    && /dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(error.message);
}

/** Reload at most once a minute, so a chunk that is really missing can't loop. */
function claimReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    if (last && Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

/**
 * The router's error boundary. Without it react-router renders its own bare
 * «Unexpected Application Error!» page, and the app-level ErrorBoundary never
 * sees errors thrown inside routes.
 */
export default function RouteErrorPage() {
  const error = useRouteError();
  const staleChunk = isChunkLoadError(error);
  const [reloadDenied, setReloadDenied] = useState(false);

  useEffect(() => {
    if (!staleChunk) {
      console.error('[RouteErrorPage]', error);
      return;
    }
    if (claimReload()) window.location.reload();
    else setReloadDenied(true);
  }, [staleChunk, error]);

  return staleChunk && !reloadDenied ? <FullPageSpinner /> : <ErrorScreen error={error} />;
}
