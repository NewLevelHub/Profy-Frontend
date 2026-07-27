import { apiClient } from './client';
import { API } from './endpoints';
import type { DirectionTreeNode, KnownProfessionQuizResponse } from '@/shared/types';

export const directionsApi = {
  tree: () =>
    apiClient.get<DirectionTreeNode[]>(API.directions.tree).then(r => r.data),

  knownProfessionQuiz: (slug: string) =>
    apiClient
      .get<KnownProfessionQuizResponse>(API.directions.knownProfessionQuiz(slug))
      .then(r => r.data),
};
