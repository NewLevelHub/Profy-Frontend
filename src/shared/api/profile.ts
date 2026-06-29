import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ProfilePayload, ProfileResponse } from '@/shared/types';

export const profileApi = {
  get: () =>
    apiClient.get<ProfileResponse>(API.profile.get).then(r => r.data),

  create: (payload: ProfilePayload) =>
    apiClient.post<ProfileResponse>(API.profile.create, payload).then(r => r.data),

  update: (payload: Partial<ProfilePayload>) =>
    apiClient.put<ProfileResponse>(API.profile.update, payload).then(r => r.data),
};
