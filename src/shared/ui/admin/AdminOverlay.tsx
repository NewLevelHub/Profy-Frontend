import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Keep dialogs outside the workspace scroller and inside its theme. */
export function AdminOverlay({ children }: { children: ReactNode }) {
  return createPortal(children, document.getElementById('admin-overlays') ?? document.body);
}
