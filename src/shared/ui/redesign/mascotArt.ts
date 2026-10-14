import book from '@/assets/mascot/book.webp';
import celebrate from '@/assets/mascot/celebrate.webp';
import graduate from '@/assets/mascot/graduate.webp';
import greeting from '@/assets/mascot/greeting.webp';
import notepad from '@/assets/mascot/notepad.webp';
import rest from '@/assets/mascot/rest.webp';

/**
 * The redesign's snow-leopard illustrations. WebP at 840px (the largest
 * placement, the landing hero, is ~420 CSS px): ~70 kB each instead of the
 * 0.8–1 MB 1254px PNG sources in design/mascot/redesign. Imported through
 * Vite, so the URLs carry a content hash and can be cached for a year.
 */
export const MASCOT = { book, celebrate, graduate, greeting, notepad, rest } as const;

export type MascotArt = keyof typeof MASCOT;
