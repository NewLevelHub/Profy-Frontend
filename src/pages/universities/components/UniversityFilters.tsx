import { Search, Star, X } from 'lucide-react';
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
            className="w-full h-11 pl-11 pr-10 rounded-pill bg-[color-mix(in_srgb,var(--paper)_78%,transparent)] border border-[color:color-mix(in_srgb,#fff_50%,var(--border))] text-sm font-semibold text-primary placeholder:text-muted focus:border-brand focus:outline-none transition-colors backdrop-blur-sm"
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
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
    </div>
  );
}
