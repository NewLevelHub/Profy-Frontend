// Token lives in Zustand persist (localStorage under 'profy-auth').
// This module is kept for any non-store storage needs.

export function getLocalItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function setLocalItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function removeLocalItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
