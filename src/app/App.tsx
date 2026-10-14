import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from '@/shared/lib/queryClient';
import { ConfirmHost } from '@/shared/ui/ConfirmHost';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import '@/shared/i18n';
import { LocaleGate } from '@/shared/i18n/LocaleGate';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocaleGate />
        {/* Safety net: a screen that reads a translation namespace not loaded
            yet (staff catalogs are on demand) waits here instead of failing. */}
        <Suspense fallback={<FullPageSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
        <ConfirmHost />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
