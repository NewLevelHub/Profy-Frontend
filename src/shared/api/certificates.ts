import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { CertificateItem } from '@/shared/types';

export const certificatesApi = {
  // Backend wraps the list as `{ items: [...] }`, not a bare array.
  get: () =>
    apiClient.get<{ items: CertificateItem[] }>(API.profile.certificates).then(r => r.data.items),

  save: (items: CertificateItem[]) =>
    apiClient.post(API.profile.certificates, { items }).then(r => r.data),
};
