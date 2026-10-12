// Minimal ambient types for the bits of Google Identity Services (GIS) we use.
// No official @types package for the gsi/client script — see
// https://developers.google.com/identity/gsi/web/reference/js-reference

export interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: string | number;
  locale?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
        };
      };
    };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const SCRIPT_ID = 'google-identity-services';

let loadedLocale: string | null = null;
let requestedLocale: string | null = null;
let scriptPromise: Promise<void> | null = null;

/**
 * GIS uses both the library's hl and the button's locale for its copy.
 * Serialize locale loads and share pending work across StrictMode mounts.
 * Finish the previous load before replacing GIS, so an older script cannot
 * overwrite the runtime after the current locale is initialized.
 */
export function loadGoogleIdentityScript(locale: string): Promise<void> {
  if (scriptPromise && requestedLocale === locale) return scriptPromise;
  requestedLocale = locale;
  const previous = scriptPromise ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(() => {
    if (window.google?.accounts?.id && loadedLocale === locale) return;
    document.getElementById(SCRIPT_ID)?.remove();
    delete window.google;
    loadedLocale = null;
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `${SCRIPT_SRC}?hl=${encodeURIComponent(locale)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        loadedLocale = locale;
        resolve();
      };
      script.onerror = () => {
        script.remove();
        if (scriptPromise === next) {
          scriptPromise = null;
          requestedLocale = null;
        }
        reject(new Error('Failed to load Google Identity script'));
      };
      document.head.appendChild(script);
    });
  });
  scriptPromise = next;
  return next;
}
