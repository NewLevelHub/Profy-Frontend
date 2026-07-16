import { apiClient } from './client';
import { API } from './endpoints';
import type { DirectionTreeNode } from '@/shared/types';

export const directionsApi = {
  tree: () =>
    apiClient.get<DirectionTreeNode[]>(API.directions.tree).then(r => r.data),
};
