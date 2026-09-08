import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useFavoriteUniversity } from '@/shared/hooks/useFavoriteUniversity';
import { scrollMainToTop } from '@/shared/lib/scrollMain';

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

export function useUniversities() {
  const navigate = useNavigate();
  // Состояние каталога живёт в адресе, а не в useState: иначе отфильтрованный
  // список нельзя ни переслать, ни открыть в новой вкладке, а возврат из
  // карточки вуза каждый раз сбрасывал фильтры и страницу на первую.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q')?.trim() ?? '';
  const activeCountry = searchParams.get('country') ?? undefined;
  const onlyFavorites = searchParams.get('favorites') === '1';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  // Skip the mount scroll — the user is already at the top on first paint.
  const didMount = useRef(false);

  const updateParams = useCallback(
    (patch: Record<string, string | null>, options?: { replace?: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          }
          // Any filter change restarts paging — page 3 of the old filter is
          // meaningless (and usually empty) under the new one.
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [setSearchParams],
  );

  // Debounced: the catalogue is server-side filtered, so every keystroke would
  // otherwise be its own request against a ~250-row table. Пишем поиск в адрес
  // через replace — иначе каждая буква стала бы отдельной записью в истории.
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      if (value !== search) updateParams({ q: value || null }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // Возврат «назад» меняет адрес — поле ввода должно догнать его, иначе в
  // строке останется старый запрос, а список уже другой.
  useEffect(() => {
    setSearchInput((prev) => (prev.trim() === search ? prev : search));
  }, [search]);

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

  const handleCountryChange = useCallback(
    (country: string | undefined) => updateParams({ country: country ?? null }),
    [updateParams],
  );

  const toggleOnlyFavorites = useCallback(
    () => updateParams({ favorites: onlyFavorites ? null : '1' }),
    [updateParams, onlyFavorites],
  );

  const setPage = useCallback(
    (next: number) => updateParams({ page: next > 1 ? String(next) : null }),
    [updateParams],
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Номер страницы теперь можно переслать ссылкой, а значит и промахнуться:
  // под фильтром страниц меньше, чем было без него. Пустой экран вместо
  // списка выглядит поломкой, поэтому возвращаемся к первой странице,
  // сохранив сам фильтр.
  useEffect(() => {
    if (data && page > totalPages) updateParams({ page: null }, { replace: true });
  }, [data, page, totalPages, updateParams]);

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
