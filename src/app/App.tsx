import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from '@/shared/lib/queryClient';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import '@/shared/i18n';
import { LocaleGate } from '@/shared/i18n/LocaleGate';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocaleGate />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
