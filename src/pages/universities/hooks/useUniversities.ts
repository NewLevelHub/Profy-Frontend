import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useFavoriteUniversity } from '@/shared/hooks/useFavoriteUniversity';
import { scrollMainToTop } from '@/shared/lib/scrollMain';

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

export function useUniversities() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [page, setPage] = useState(1);
  // Skip the mount scroll — the user is already at the top on first paint.
  const didMount = useRef(false);

  // Debounced: the catalogue is server-side filtered, so every keystroke would
  // otherwise be its own request against a ~250-row table.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any filter change restarts paging — page 3 of the old filter is
  // meaningless (and usually empty) under the new one.
  useEffect(() => {
    setPage(1);
  }, [search, activeCountry, onlyFavorites]);

  // Pagination and filter swaps keep the same route, so AppLayout never
  // resets scroll. Jump back to the top of <main> so the new page of cards
  // (or a new filter result) is not revealed from the pager at the bottom.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    scrollMainToTop();
  }, [page, search, activeCountry, onlyFavorites]);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(activeCountry ? { country: activeCountry } : {}),
      ...(onlyFavorites ? { only_favorites: true } : {}),
    }),
    [page, search, activeCountry, onlyFavorites],
  );

  const { data, isLoading, isFetching, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ['universities', params] as const,
    queryFn: () => universityApi.list(params),
    // Keep the previous page only when the user is paging within the same
    // filter set. Crossing into "Избранные" (or changing country/search)
    // must NOT reuse the unfiltered 252-row page — that made the filter
    // look broken: the button flipped on, but the old full list stayed
    // on screen until the refetch landed.
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      const prevParams = previousQuery.queryKey[1] as typeof params | undefined;
      if (!prevParams) return undefined;
      const sameFilters =
        prevParams.search === params.search &&
        prevParams.country === params.country &&
        prevParams.only_favorites === params.only_favorites &&
        prevParams.limit === params.limit;
      return sameFilters ? previousData : undefined;
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['universityCountries'] as const,
    queryFn: () => universityApi.listCountries(),
    staleTime: 5 * 60 * 1000,
  });

  // Казахстан first — the product's primary market — then the rest in the
  // API's order so the horizontal filter strip starts with the most useful
  // chip instead of Australia.
  const sortedCountries = useMemo(() => {
    const kz = countries.filter(c => c.country === 'Казахстан');
    const rest = countries.filter(c => c.country !== 'Казахстан');
    return [...kz, ...rest];
  }, [countries]);

  const { toggleFavorite } = useFavoriteUniversity();

  const handleOpen = useCallback(
    (id: string) => navigate(`/universities/${id}`),
    [navigate],
  );

  const handleCountryChange = useCallback((country: string | undefined) => {
    setActiveCountry(country);
  }, []);

  const toggleOnlyFavorites = useCallback(() => setOnlyFavorites(prev => !prev), []);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Belt-and-suspenders with the backend's favourite-first ORDER BY: if a
  // star was just toggled on Results, the cached page may already have
  // `is_favorite` flipped while the refetch (new sort order) is still in
  // flight — keep favourites visually first so the two tabs feel linked.
  const universities = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort((a, b) => {
      if (a.is_favorite === b.is_favorite) return 0;
      return a.is_favorite ? -1 : 1;
    });
  }, [data?.items]);

  return {
    universities,
    total,
    page,
    totalPages,
    setPage,
    isLoading: isLoading || (isPlaceholderData && onlyFavorites),
    isFetching,
    error: error ? 'Не удалось загрузить университеты. Попробуй ещё раз.' : null,
    refetch,
    searchInput,
    setSearchInput,
    countries: sortedCountries,
    activeCountry,
    setActiveCountry: handleCountryChange,
    onlyFavorites,
    toggleOnlyFavorites,
    handleOpen,
    toggleFavorite,
  };
}
