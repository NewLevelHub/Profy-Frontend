import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { CONTENT_LOCALE_LABELS, CONTENT_LOCALE_SHORT } from '@/shared/lib/contentLabels';
import { MONO_LABEL } from '@/shared/ui/admin/density';
import { KNOWN_LOCALES, type Locale } from '@/shared/store/locale';

interface LocaleTabsProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  /** Which locales already have a real (non-empty) translation for the row
   *  being edited — an empty dot on the tab, not a guess, so a blank kk tab
   *  reads as "not translated yet" rather than "translated to nothing". */
  translated: ReadonlySet<Locale>;
  /** While a draft is unsaved, switching tabs would silently discard it (each
   *  tab holds one locale's own form draft, not saved elsewhere) — disable
   *  the inactive tab instead of losing the edit. */
  dirty?: boolean;
}

/**
 * Which language of a single-row content item (question/pair/statement/
 * direction — one row per item since the KZ-301 row-per-locale redesign) is
 * being viewed/edited right now. Replaces the old per-row `LocaleBadge`,
 * which named which physical row a table entry was; there is only one row
 * now, so the language is a view choice, not a row property.
 */
export function LocaleTabs({ value, onChange, translated, dirty }: LocaleTabsProps) {
  const { t } = useTranslation('admin');
  return (
    <div role="tablist" aria-label={t('locale.ru') + ' / ' + t('locale.kk')} className="inline-flex gap-1">
      {KNOWN_LOCALES.map((locale) => {
        const active = locale === value;
        const disabled = dirty && !active;
        return (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            title={disabled ? t('common.switchLocaleDisabled') : t(CONTENT_LOCALE_LABELS[locale])}
            onClick={() => onChange(locale)}
            className={cn(
              MONO_LABEL,
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] border transition-colors',
              active
                ? 'bg-brand-subtle text-brand border-brand'
                : 'bg-raised text-muted border-default hover:text-secondary',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {CONTENT_LOCALE_SHORT[locale]}
            {!translated.has(locale) && (
              <span
                aria-label={t('common.untranslated')}
                title={t('common.untranslated')}
                className="w-1.5 h-1.5 rounded-full bg-muted"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
