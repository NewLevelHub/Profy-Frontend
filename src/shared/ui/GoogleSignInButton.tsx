import { useEffect, useRef, useState } from 'react';
import { env } from '@/shared/config/env';
import { loadGoogleIdentityScript } from '@/shared/lib/googleIdentity';
import { resolveLocale, useLocaleStore } from '@/shared/store/locale';
import { useTheme } from '@/shared/hooks/useTheme';

const MAX_WIDTH = 400;

export interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
  onLoadError?: () => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with';
}

export function GoogleSignInButton({ onCredential, onLoadError, disabled, text = 'signin_with' }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [gisLocale, setGisLocale] = useState<string | null>(null);
  const locale = useLocaleStore((s) => resolveLocale(s.locale));
  // Кнопку рисует сам Google, темы у неё свои. На тёмном холсте светлый
  // вариант читается как единственное белое пятно на экране, поэтому в
  // тёмной теме берём filled_black — это предусмотренный Google вариант,
  // а не перекраска его кнопки своими цветами.
  const { theme } = useTheme();

  // Kept in refs so the GIS callback always calls the latest handler.
  // initialize() re-runs only when the app locale changes (GIS script reload).
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const onLoadErrorRef = useRef(onLoadError);
  onLoadErrorRef.current = onLoadError;

  useEffect(() => {
    if (!env.GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogleIdentityScript(locale)
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential),
        });
        setGisLocale(locale);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) onLoadErrorRef.current?.();
      });
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    if (!ready || gisLocale !== locale || !containerRef.current || !window.google) return;
    const container = containerRef.current;
    let renderedWidth = 0;
    const render = () => {
      const width = Math.min(container.offsetWidth || MAX_WIDTH, MAX_WIDTH);
      if (width === renderedWidth || !window.google) return;
      renderedWidth = width;
      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'rectangular',
        locale,
        text,
        width,
      });
    };
    render();
    // GIS embeds a fixed-width iframe; redraw when the form changes width.
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [ready, gisLocale, locale, text, theme]);

  if (!env.GOOGLE_CLIENT_ID) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center${disabled ? ' pointer-events-none opacity-40' : ''}`}
    />
  );
}
