import { useMemo } from 'react';
import type { DirectionTreeNode } from '@/shared/types';
import { searchTree, type SpecialtySearchMatch } from '../utils/search';

/** Cross-sphere search over the whole tree. Returns [] for an empty query —
 * callers fall back to their normal browse UI in that case. */
export function useProfessionSearch(
  tree: DirectionTreeNode[] | undefined,
  query: string,
): SpecialtySearchMatch[] {
  return useMemo(() => searchTree(tree ?? [], query), [tree, query]);
}
