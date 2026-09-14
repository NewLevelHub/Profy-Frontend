import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { universityApi } from '@/shared/api/university';
import type { ProgramBrief, UniversityDetail, UniversityListItem, UniversityListResponse } from '@/shared/types';

function withFavoriteFlag(items: UniversityListItem[], id: string, next: boolean): UniversityListItem[] {
  const updated = items.map(u => (u.id === id ? { ...u, is_favorite: next } : u));
  // Keep favourites at the front of every cached page so a star from
  // Results is visible at the top of /universities without waiting for
  // the refetch — the server order is the source of truth after settle.
  return [...updated].sort((a, b) => {
    if (a.is_favorite === b.is_favorite) return 0;
    return a.is_favorite ? -1 : 1;
  });
}

function withProgramFavorite(programs: ProgramBrief[], id: string, next: boolean): ProgramBrief[] {
  const updated = programs.map(p =>
    p.university.id === id
      ? { ...p, university: { ...p.university, is_favorite: next } }
      : p,
  );
  return [...updated].sort((a, b) => {
    if (a.university.is_favorite === b.university.is_favorite) return 0;
    return a.university.is_favorite ? -1 : 1;
  });
}

/**
 * The one place a university gets starred or unstarred, shared by all three
 * surfaces that show the star: the catalogue grid, a university's own page,
 * and the direction-scoped program cards on Results.
 *
 * Results and /universities share the same backend favourites table and the
 * same React Query keys — starring in one place must update the other.
 */
export function useFavoriteUniversity() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      next ? universityApi.addFavorite(id) : universityApi.removeFavorite(id),

    onMutate: async ({ id, next }) => {
      // Cancel in-flight reads first, or a response that left before this
      // toggle can land afterwards and overwrite the optimistic value.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['universities'] }),
        queryClient.cancelQueries({ queryKey: ['university', id] }),
        queryClient.cancelQueries({ queryKey: ['programs'] }),
      ]);

      const snapshot = {
        universities: queryClient.getQueriesData<UniversityListResponse>({ queryKey: ['universities'] }),
        university: queryClient.getQueriesData<UniversityDetail>({ queryKey: ['university', id] }),
        programs: queryClient.getQueriesData<ProgramBrief[]>({ queryKey: ['programs'] }),
      };

      queryClient.setQueriesData<UniversityListResponse>({ queryKey: ['universities'] }, prev =>
        prev
          ? {
              ...prev,
              items: withFavoriteFlag(prev.items, id, next),
            }
          : prev,
      );
      queryClient.setQueriesData<UniversityDetail>({ queryKey: ['university', id] }, prev =>
        prev ? { ...prev, is_favorite: next } : prev,
      );
      queryClient.setQueriesData<ProgramBrief[]>({ queryKey: ['programs'] }, prev =>
        prev ? withProgramFavorite(prev, id, next) : prev,
      );

      return snapshot;
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      for (const [key, data] of context.universities) queryClient.setQueryData(key, data);
      for (const [key, data] of context.university) queryClient.setQueryData(key, data);
      for (const [key, data] of context.programs) queryClient.setQueryData(key, data);
    },

    onSettled: (_data, _err, { id }) => {
      // refetchType 'all' — also refresh inactive catalogue queries so that
      // starring on Results updates /universities before the user opens it.
      void queryClient.invalidateQueries({ queryKey: ['universities'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['university', id], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['programs'], refetchType: 'all' });
    },
  });

  // Stable identity: this is handed down to React.memo'd cards, and a fresh
  // closure per render would re-render the whole grid on any parent update.
  // Depends on `mutate`, not on `mutation` — the result object is rebuilt
  // every render, so depending on it would defeat the memo entirely.
  const { mutate } = mutation;
  const toggleFavorite = useCallback(
    (id: string, isFavorite: boolean) => mutate({ id, next: !isFavorite }),
    [mutate],
  );

  return { toggleFavorite, isPending: mutation.isPending };
}
