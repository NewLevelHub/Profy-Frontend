import { Search, Star, X } from 'lucide-react';
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
  'shrink-0 px-4 py-2 rounded-pill text-sm font-bold border-[1.5px] cursor-pointer transition-colors whitespace-nowrap';
const PILL_ON = 'bg-brand text-on-brand border-transparent';
const PILL_OFF = 'bg-surface text-secondary border-strong hover:border-brand';

export function UniversityFilters({
  searchInput,
  onSearchChange,
  countries,
  activeCountry,
  onCountryChange,
  onlyFavorites,
  onToggleOnlyFavorites,
}: UniversityFiltersProps) {
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
            placeholder="Название, аббревиатура или город"
            aria-label="Поиск университета"
            className="w-full h-11 pl-11 pr-10 rounded-pill bg-surface border-[1.5px] border-strong text-sm font-semibold text-primary placeholder:text-muted focus:border-brand focus:outline-none transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Очистить поиск"
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
          Избранные
        </button>
      </div>

      {/* One horizontal strip instead of a wrapping wall of ~30 pills — the
          catalogue has dozens of countries, and a multi-row chip cloud eats
          the first viewport before any card appears. */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Фильтр по стране"
      >
        <button
          type="button"
          onClick={() => onCountryChange(undefined)}
          aria-pressed={activeCountry === undefined}
          className={cn(PILL_BASE, activeCountry === undefined ? PILL_ON : PILL_OFF)}
        >
          Все
        </button>
        {countries.map(({ country, count }) => (
          <button
            key={country}
            type="button"
            onClick={() => onCountryChange(country)}
            aria-pressed={activeCountry === country}
            className={cn(PILL_BASE, activeCountry === country ? PILL_ON : PILL_OFF)}
          >
            {country}
            <span className="ml-1.5 opacity-60">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
