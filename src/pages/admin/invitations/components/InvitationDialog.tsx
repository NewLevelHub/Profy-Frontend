import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { AdminOverlay } from '@/shared/ui/admin/AdminOverlay';

interface InvitationDialogProps {
  titleId: string;
  /** While a request is in flight the dialog can't be dismissed. */
  locked?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Dialog shell of the invitations page: the invite form, the "sent" result
 *  and a row's link all open in it, so the three look and close the same. */
export function InvitationDialog({ titleId, locked = false, onClose, children }: InvitationDialogProps) {
  const { t } = useTranslation('admin');
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !locked) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, locked]);

  // Back to the control that opened the dialog, like a native dialog.
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    return () => returnFocusRef.current?.focus?.();
  }, []);

  return (
    <AdminOverlay>
      <div
        className="rd-admin-dialog fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={locked ? undefined : onClose}
      >
        <div className="rd-invite-dialog" onClick={(event) => event.stopPropagation()}>
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
