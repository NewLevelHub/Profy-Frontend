import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Returning to the tab used to refetch every active query older than
      // staleTime — the profile, the whole report, catalog pages — although
      // nothing here changes behind the user's back. Screens that do wait
      // for someone else opt back in (usePsychologistReviews) or poll
      // (useResults while the report is under review).
      refetchOnWindowFocus: false,
    },
  },
});
