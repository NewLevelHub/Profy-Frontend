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

// Locales actually offered right now — ['ru', 'kk'] since KZ-603. If this ever
// has ≤1 entry (KZ-603 reverted) the component renders nothing.
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
  const [pending, setPending] = useState(false);

  if (OPTIONS.length <= 1) return null;

  async function choose(next: Locale) {
    if (next === locale || pending) return;
    setFailed(false);

    // For a signed-in user the results report — and the directions/descriptions
    // it carries — is rendered in the *account* language (backend reads
    // users.locale, not Accept-Language: KZ-403/405). The server must commit
    // the new locale BEFORE the UI flips, otherwise the immediate `/result`
    // re-fetch races the PATCH and caches the old-language report under the new
    // key. So persist first, then switch.
    if (isAuthenticated) {
      setPending(true);
      try {
        await apiClient.patch(API.auth.me, { locale: next });
        if (user) setUser({ ...user, locale: next });
      } catch {
        setFailed(true);
        setPending(false);
        return;
      }
      setPending(false);
    }

    setLocale(next);
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border border-strong p-0.5',
        className,
      )}
      role="group"
      aria-label={t('languageSwitcherAria')}
      aria-busy={pending}
    >
      {OPTIONS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          disabled={pending}
          aria-pressed={l === locale}
          className={cn(
            'rounded-pill px-2 py-0.5 text-caption font-bold transition-colors press-scale',
            pending && 'opacity-60',
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
