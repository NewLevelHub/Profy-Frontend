import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ArtifactItem } from '@/shared/types';

export const artifactsApi = {
  get: () =>
    apiClient.get<ArtifactItem[]>(API.profile.artifacts).then(r => r.data),

  save: (items: ArtifactItem[]) =>
    apiClient.post(API.profile.artifacts, { items }).then(r => r.data),
};
