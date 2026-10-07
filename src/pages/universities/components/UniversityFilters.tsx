import { ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { localizeGeo } from '@/shared/i18n/geo';
import { cn } from '@/shared/lib/cn';
import type { UniversityCountry } from '@/shared/types';

interface UniversityFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  countries: UniversityCountry[];
  activeCountry: string | undefined;
  onCountryChange: (country: string | undefined) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
}

const PILL_BASE =
  'shrink-0 px-4 py-2 rounded-pill text-sm font-semibold border cursor-pointer transition-colors whitespace-nowrap press-scale';
const PILL_ON = 'bg-brand text-on-brand border-transparent';
const PILL_OFF =
  'bg-[color-mix(in_srgb,var(--paper)_75%,transparent)] text-secondary border-[color:color-mix(in_srgb,#fff_50%,var(--border))] hover:border-brand hover:text-brand';
// Центр стрелки совпадает с центром чипа: у строки pb-1, поэтому bottom-1.
const STRIP_ARROW =
  'hidden pointer-fine:flex absolute top-0 bottom-1 my-auto w-9 h-9 items-center justify-center rounded-full border cursor-pointer transition-colors press-scale bg-[color:var(--paper)] text-secondary border-[color:var(--border)] shadow-sm hover:border-brand hover:text-brand';

export function UniversityFilters({
  searchInput,
  onSearchChange,
  countries,
  activeCountry,
  onCountryChange,
  onlyFavorites,
  onToggleOnlyFavorites,
}: UniversityFiltersProps) {
  const { t } = useTranslation('results');

  // Затухание показывается только с той стороны, где реально есть скрытые чипы:
  // статическая маска слева приглушала бы активный «Все», когда строка в покое.
  const stripRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const syncEdges = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft < max - 4 });
  }, []);

  // Пересчёт нужен и при смене набора стран (фильтр «Избранные» его сокращает),
  // и при изменении ширины — строка перестаёт переполняться, и маска не нужна.
  useEffect(() => {
    syncEdges();
    const el = stripRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncEdges, countries]);

  // Скроллбар у строки скрыт, а обычное колесо мыши крутит только по вертикали —
  // без этого на десктопе до стран за краем было не добраться. Колесо
  // перехватываем, лишь пока строке есть куда ехать в эту сторону: у края
  // событие уходит странице, и прокрутка вниз не залипает на фильтре.
  // Слушатель нативный, т.к. React вешает onWheel пассивным и preventDefault там не работает.
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const canMove = e.deltaY > 0 ? el.scrollLeft < max - 1 : el.scrollLeft > 1;
      if (!canMove) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scrollStrip = (direction: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            aria-label={t('catalog.searchAria')}
            className="w-full h-11 pl-11 pr-10 rounded-pill bg-[color-mix(in_srgb,var(--paper)_78%,transparent)] border border-[color:color-mix(in_srgb,#fff_50%,var(--border))] text-sm font-semibold text-primary placeholder:text-muted focus:border-brand focus:outline-none transition-colors backdrop-blur-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={t('catalog.clearSearchAria')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-primary border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleOnlyFavorites}
          aria-pressed={onlyFavorites}
          className={cn(
            PILL_BASE,
            'inline-flex items-center justify-center gap-2 h-11',
            onlyFavorites ? PILL_ON : PILL_OFF,
          )}
        >
          <Star className={cn('w-4 h-4', onlyFavorites && 'fill-current')} />
          {t('catalog.favorites')}
        </button>
      </div>

      {/* One horizontal strip instead of a wrapping wall of ~30 pills — the
          catalogue has dozens of countries, and a multi-row chip cloud eats
          the first viewport before any card appears. */}
      <div className="relative">
        <div
          ref={stripRef}
          onScroll={syncEdges}
          data-fade-start={edges.start ? '' : undefined}
          data-fade-end={edges.end ? '' : undefined}
          className="filter-strip-fade flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={t('programList.countryFilterAria')}
        >
          <button
            type="button"
            onClick={() => onCountryChange(undefined)}
            aria-pressed={activeCountry === undefined}
            className={cn(PILL_BASE, activeCountry === undefined ? PILL_ON : PILL_OFF)}
          >
            {t('programList.allCountries')}
          </button>
          {countries.map(({ country, count }) => (
            <button
              key={country}
              type="button"
              onClick={() => onCountryChange(country)}
              aria-pressed={activeCountry === country}
              className={cn(PILL_BASE, activeCountry === country ? PILL_ON : PILL_OFF)}
            >
              {localizeGeo(country)}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          ))}
        </div>

        {/* Стрелки — только для мыши (pointer-fine): на тачскрине строку и так
            листают свайпом, а кнопки перекрывали бы чипы. Стоят поверх зон
            затухания, поэтому не закрывают читаемые чипы. */}
        {edges.start && (
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            aria-label={t('catalog.scrollCountriesBackAria')}
            className={cn(STRIP_ARROW, '-left-1')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {edges.end && (
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            aria-label={t('catalog.scrollCountriesForwardAria')}
            className={cn(STRIP_ARROW, '-right-1')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
