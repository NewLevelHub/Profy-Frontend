import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import { useIsAuthenticated } from '@/shared/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/shared/store/auth';
import {
  KNOWN_LOCALES,
  SUPPORTED_LOCALES,
  useLocaleStore,
  type Locale,
} from '@/shared/store/locale';

// Each option is shown in its own script — a language picker convention, not
// translatable UI copy.
const LABEL: Record<Locale, string> = { ru: 'RU', kk: 'ҚАЗ' };

// Locales actually offered right now. While this has ≤1 entry (before KZ-603
// adds 'kk' to SUPPORTED_LOCALES) the component renders nothing.
const OPTIONS = KNOWN_LOCALES.filter((l) => (SUPPORTED_LOCALES as readonly string[]).includes(l));

export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * RU / ҚАЗ toggle. Anonymous: local + persisted (LocaleGate applies it to
 * i18next). Authenticated: also PATCH /auth/me; on failure the UI reverts.
 * Renders `null` until there is more than one supported locale.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [failed, setFailed] = useState(false);

  if (OPTIONS.length <= 1) return null;

  async function choose(next: Locale) {
    if (next === locale) return;
    const previous = locale;
    setFailed(false);
    setLocale(next);

    if (isAuthenticated) {
      try {
        await apiClient.patch(API.auth.me, { locale: next });
        if (user) setUser({ ...user, locale: next });
      } catch {
        setLocale(previous);
        setFailed(true);
      }
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border border-strong p-0.5',
        className,
      )}
      role="group"
      aria-label={t('languageSwitcherAria')}
    >
      {OPTIONS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          className={cn(
            'rounded-pill px-2 py-0.5 text-caption font-bold transition-colors press-scale',
            l === locale
              ? 'bg-brand text-on-brand'
              : 'text-muted hover:text-primary',
          )}
        >
          {LABEL[l]}
        </button>
      ))}
      {failed && (
        <span role="alert" className="ml-1 text-caption text-danger">
          !
        </span>
      )}
    </div>
  );
}
