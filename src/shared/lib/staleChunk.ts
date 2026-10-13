const RELOAD_KEY = 'profy-chunk-reload-at';
const RELOAD_COOLDOWN_MS = 60_000;

/**
 * After a deploy, a tab opened on the previous build still asks for chunks
 * whose hashed names are gone from the server. Chrome, Firefox and Safari
 * word a missing JS chunk differently; a missing stylesheet is Vite's own
 * preload error.
 */
function isChunkLoadError(error: unknown): boolean {
  return error instanceof Error
    && /dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(error.message);
}

/**
 * A chunk failed to load while the browser reports a connection — most
 * likely a deploy removed it. Offline, the same error means no network: a
 * reload would only land on the browser's offline page and lose our
 * «Обновить страницу» screen, so callers show that screen instead.
 */
export function looksLikeStaleChunk(error: unknown): boolean {
  return isChunkLoadError(error) && (typeof navigator === 'undefined' || navigator.onLine !== false);
}

/** Reload at most once a minute, so a chunk that is really missing can't loop. */
export function claimReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    if (last && Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}
