import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { AdminOverlay } from '@/shared/ui/admin/AdminOverlay';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface InvitationDialogProps {
  titleId: string;
  /** While a request is in flight the dialog can't be dismissed. */
  locked?: boolean;
  /** Changes when the dialog swaps its content (form → result): focus moves
   *  back into the dialog, since the control that had it is gone. */
  contentKey?: string;
  /** Where focus goes on close. Defaults to whatever had focus on open — pass
   *  it when that control was disabled by then (a row action in flight). */
  returnFocusTo?: HTMLElement | null;
  onClose: () => void;
  children: ReactNode;
}

/** Dialog shell of the invitations page: the invite form, the "sent" result
 *  and a row's link all open in it, so the three look and close the same. */
export function InvitationDialog({ titleId, locked = false, contentKey, returnFocusTo, onClose, children }: InvitationDialogProps) {
  const { t } = useTranslation('admin');
  const panelRef = useRef<HTMLDivElement>(null);
  // Read during the first render: by the time effects run, an `autoFocus`
  // field inside the dialog already holds focus.
  const [opener] = useState(() => returnFocusTo ?? (document.activeElement as HTMLElement | null));

  // Back to the control that opened the dialog once it closes, like a native dialog.
  useEffect(() => () => opener?.focus?.(), [opener]);

  // Into the dialog on open and on every content swap: the field marked
  // `data-autofocus`, else the panel itself — then a screen reader starts
  // from the dialog's title. (`autoFocus` doesn't hold inside the overlay.)
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const field = panel.querySelector<HTMLElement>('[data-autofocus]');
    (field ?? panel).focus();
  }, [contentKey]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !locked) {
        onClose();
        return;
      }
      // Tab cycles inside the dialog instead of walking into the page under the overlay.
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !panelRef.current.contains(active);
      if (event.shiftKey && (active === first || active === panelRef.current || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, locked]);

  return (
    <AdminOverlay>
      <div
        className="rd-admin-dialog fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
        onClick={locked ? undefined : onClose}
      >
        <div
          ref={panelRef}
          className="rd-invite-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="rd-invite-close"
            onClick={onClose}
            disabled={locked}
            aria-label={t('invitations.sent.close')}
          >
            <X size={18} aria-hidden="true" />
          </button>
          {children}
        </div>
      </div>
    </AdminOverlay>
  );
}
