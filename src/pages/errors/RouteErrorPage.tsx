import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import { claimReload, looksLikeStaleChunk } from '@/shared/lib/staleChunk';

/**
 * The router's error boundary. Without it react-router renders its own bare
 * «Unexpected Application Error!» page, and the app-level ErrorBoundary never
 * sees errors thrown inside routes.
 */
export default function RouteErrorPage() {
  const error = useRouteError();
  const staleChunk = looksLikeStaleChunk(error);
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
