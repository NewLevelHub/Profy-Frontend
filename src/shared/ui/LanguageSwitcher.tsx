import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
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

// Compact codes — same convention as jinaq.kz (EN / RU / KZ). Not UI copy.
const LABEL: Record<Locale, string> = {
  ru: 'RU',
  kk: 'KZ',
};

const OPTIONS = KNOWN_LOCALES.filter((l) => (SUPPORTED_LOCALES as readonly string[]).includes(l));

export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Language dropdown (RU / KZ today; EN when the catalog lands).
 *
 * UI locale always flips locally via the store → LocaleGate → i18next.
 * If the user is signed in we also best-effort PATCH /auth/me so the
 * account preference sticks — but a missing/older backend without `locale`
 * must not block the switch or flash a cryptic "!" (that was the bug).
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (OPTIONS.length <= 1) return null;

  async function choose(next: Locale) {
    if (next === locale || pending) {
      setOpen(false);
      return;
    }

    // Flip the UI immediately — translations live on the client.
    setLocale(next);
    setOpen(false);

    if (!isAuthenticated) return;

    // Persist on the account when the API supports it. Failure is non-fatal:
    // the session keeps the new UI language in localStorage.
    setPending(true);
    try {
      await apiClient.patch(API.auth.me, { locale: next });
      if (user) setUser({ ...user, locale: next });
    } catch {
      // Backend may not accept `locale` yet (frontend ahead of deploy).
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('languageSwitcherAria')}
        aria-busy={pending}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 rounded-[10px] px-2.5 py-1.5',
          'text-body-sm font-semibold text-[color:var(--text-heading)]',
          'hover:bg-hover transition-colors press-scale',
          pending && 'opacity-60',
        )}
      >
        {LABEL[locale]}
        <ChevronDown
          size={14}
          strokeWidth={2.25}
          aria-hidden="true"
          className={cn('text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('languageSwitcherAria')}
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-50 min-w-[7.5rem]',
            'flex flex-col gap-0.5 p-1.5 rounded-[14px]',
            'bg-[color-mix(in_srgb,var(--paper)_94%,transparent)] backdrop-blur-md',
            'border border-[color:color-mix(in_srgb,#fff_55%,var(--border))]',
            'shadow-[0_16px_36px_color-mix(in_srgb,var(--midnight)_10%,transparent)]',
          )}
        >
          {OPTIONS.map((l) => {
            const active = l === locale;
            return (
              <li key={l} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={pending}
                  onClick={() => choose(l)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-[10px] px-3 py-2',
                    'text-body-sm font-semibold transition-colors',
                    active
                      ? 'bg-[color:var(--bg-raised)] text-[color:var(--text-heading)]'
                      : 'text-secondary hover:bg-hover hover:text-primary',
                  )}
                >
                  <span>{LABEL[l]}</span>
                  {active && <Check size={14} strokeWidth={2.5} aria-hidden="true" className="text-brand" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
