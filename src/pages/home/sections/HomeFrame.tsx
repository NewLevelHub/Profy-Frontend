import type { ReactNode } from 'react';
import { type as typeClass } from '@/shared/ui/typography/tokens';

/**
 * "/home" — spec §04. ONE unified home page for every age; age differences
 * live entirely in copy/content selection inside this frame, never in
 * structure (verbatim: "Раньше здесь стояли два экрана ... Теперь экран
 * один."). This is the single Fog-bordered, Paper-ish card every state
 * (completed / in-progress / not-started) renders inside.
 *
 * The spec's mockup draws its own header row at the top of this card, but
 * that's the mockup's flattened stand-in for app chrome — the real app
 * already has one shared nav surface (`TopRail`, rendered once by
 * `AppLayout` above every page's <main>), so no second header is rendered
 * here. Content starts directly with the page's own top row.
 */
export function HomeFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--fog)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius)',
        padding: '30px 26px 34px',
      }}
    >
      {children}
    </div>
  );
}

/** Shared mono kicker style for section labels ("БЛИЖАЙШИЙ ШАГ" etc.) — matches the
 *  convention already established on GoalSelectionPage/GoalCheckPage/RestStopPage. */
export const KICKER_CLASS = `${typeClass.monoLabel} text-muted`;
