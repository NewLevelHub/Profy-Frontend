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
let loadGeneration = 0;

/**
 * GIS localizes the rendered button only when the client library is loaded
 * with a matching `hl` (see Google JS reference for `renderButton.locale`).
 * A language switch therefore drops the previous script and `window.google`
 * before loading the bundle for the new locale.
 */
export function loadGoogleIdentityScript(locale: string): Promise<void> {
  if (window.google?.accounts?.id && loadedLocale === locale) return Promise.resolve();

  const generation = ++loadGeneration;
  document.getElementById(SCRIPT_ID)?.remove();
  delete window.google;
  loadedLocale = null;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `${SCRIPT_SRC}?hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (generation !== loadGeneration) return;
      loadedLocale = locale;
      resolve();
    };
    script.onerror = () => {
      if (generation !== loadGeneration) return;
      reject(new Error('Failed to load Google Identity script'));
    };
    document.head.appendChild(script);
  });
}
