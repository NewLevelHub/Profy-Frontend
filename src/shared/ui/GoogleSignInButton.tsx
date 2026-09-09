import { useEffect, useRef, useState } from 'react';
import { env } from '@/shared/config/env';
import { loadGoogleIdentityScript } from '@/shared/lib/googleIdentity';
import { resolveLocale, useLocaleStore } from '@/shared/store/locale';

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
    containerRef.current.innerHTML = '';
    const width = Math.min(containerRef.current.offsetWidth || MAX_WIDTH, MAX_WIDTH);
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      locale,
      text,
      width,
    });
  }, [ready, gisLocale, locale, text]);

  if (!env.GOOGLE_CLIENT_ID) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center${disabled ? ' pointer-events-none opacity-40' : ''}`}
    />
  );
}
