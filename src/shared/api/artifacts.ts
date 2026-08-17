import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ArtifactItem } from '@/shared/types';

export const artifactsApi = {
  // Backend wraps the list as `{ items: [...] }`, not a bare array.
  get: () =>
    apiClient.get<{ items: ArtifactItem[] }>(API.profile.artifacts).then(r => r.data.items),

  save: (items: ArtifactItem[]) =>
    apiClient.post(API.profile.artifacts, { items }).then(r => r.data),
};
