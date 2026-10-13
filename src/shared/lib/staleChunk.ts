const RELOAD_KEY = 'profy-chunk-reload-at';
const RELOAD_COOLDOWN_MS = 60_000;

/**
 * After a deploy, a tab opened on the previous build still asks for chunks
 * whose hashed names are gone from the server. Chrome, Firefox and Safari
 * word a missing JS chunk differently; a missing stylesheet is Vite's own
 * preload error.
 */
export function isChunkLoadError(error: unknown): boolean {
  return error instanceof Error
    && /dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(error.message);
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
