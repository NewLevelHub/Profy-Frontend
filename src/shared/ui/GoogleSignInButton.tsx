import { useEffect, useRef, useState } from 'react';
import { env } from '@/shared/config/env';
import { loadGoogleIdentityScript } from '@/shared/lib/googleIdentity';
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
  // Кнопку рисует сам Google, темы у неё свои. На тёмном холсте светлый
  // вариант читается как единственное белое пятно на экране, поэтому в
  // тёмной теме берём filled_black — это предусмотренный Google вариант,
  // а не перекраска его кнопки своими цветами.
  const { theme } = useTheme();

  // Kept in refs so the GIS callback (registered once, on script load) always
  // calls the latest handler without forcing a re-init on every render.
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const onLoadErrorRef = useRef(onLoadError);
  onLoadErrorRef.current = onLoadError;

  useEffect(() => {
    if (!env.GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential),
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) onLoadErrorRef.current?.();
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google) return;
    containerRef.current.innerHTML = '';
    const width = Math.min(containerRef.current.offsetWidth || MAX_WIDTH, MAX_WIDTH);
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: theme === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'rectangular',
      locale: 'ru',
      text,
      width,
    });
  }, [ready, text, theme]);

  if (!env.GOOGLE_CLIENT_ID) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center${disabled ? ' pointer-events-none opacity-40' : ''}`}
    />
  );
}
