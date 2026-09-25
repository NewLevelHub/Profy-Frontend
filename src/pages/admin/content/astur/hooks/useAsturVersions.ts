import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAsturApi } from '@/shared/api/adminAstur';

export const ASTUR_VERSIONS_KEY = ['adminAsturVersions'] as const;
export const asturVersionPath = (id: string) => `/admin/content/tests/versions/${id}`;

/** АСТУР bank versions list + "open the draft" (created on demand). */
export function useAsturVersions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ASTUR_VERSIONS_KEY,
    queryFn: adminAsturApi.listVersions,
  });

  const versions = data ?? [];
  const draft = versions.find((v) => v.status === 'draft') ?? null;
  const published = versions.filter((v) => v.status === 'published');

  async function openDraft() {
    setOpening(true);
    setOpenError(null);
    try {
      const created = await adminAsturApi.createDraft();
      await queryClient.invalidateQueries({ queryKey: ASTUR_VERSIONS_KEY });
      navigate(asturVersionPath(created.id));
    } catch {
      setOpenError('Не удалось открыть черновик.');
    } finally {
      setOpening(false);
    }
  }

  return { draft, published, isLoading, isError, refetch, openDraft, opening, openError };
}
