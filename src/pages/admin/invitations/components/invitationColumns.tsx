import type { TFunction } from 'i18next';
import { Check, Link2, RotateCw, XCircle } from 'lucide-react';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import type { AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminInvitation, AdminInvitationEmailStatus, AdminInvitationStatus } from '@/shared/types';

const STATUS_TONES: Record<AdminInvitationStatus, AdminBadgeTone> = {
  pending: 'accent',
  accepted: 'brand',
  expired: 'quiet',
  revoked: 'danger',
};

/** How the last send-attempt line under the invitation status reads. */
const DELIVERY_TONES: Record<AdminInvitationEmailStatus, 'muted' | 'danger'> = {
  sent: 'muted',
  failed: 'danger',
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

interface InvitationRowHandlers {
  /** Row whose link / resend / revoke is in flight. */
  busyId: string | null;
  /** Row whose link was just copied. */
  copiedId: string | null;
  onCopyLink: (invitation: AdminInvitation) => void;
  onResend: (invitation: AdminInvitation) => void;
  onRevoke: (invitation: AdminInvitation) => void;
}

/** The last send attempt matters only while the invitation can be accepted. */
function showsDelivery(invitation: AdminInvitation): invitation is AdminInvitation & { email_status: AdminInvitationEmailStatus } {
  return invitation.email_status !== null && (invitation.status === 'pending' || invitation.status === 'expired');
}

/** Columns of the /admin/invitations table. Actions follow the status:
 *  link and revoke for pending, resend for pending/expired (contract §3.4–§3.6). */
export function invitationColumns(
  t: TFunction<'admin'>,
  handlers: InvitationRowHandlers,
): AdminColumn<AdminInvitation>[] {
  return [
    {
      key: 'email',
      header: t('invitations.col.email'),
      mobile: 'title',
      cell: (item) => (
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className={cn(ADMIN_TEXT, 'font-semibold text-primary truncate')}>{item.email}</span>
          {item.invited_by && (
            <span className={cn(ADMIN_META, 'truncate')}>
              {t('invitations.invitedBy', { email: item.invited_by.email })}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'role',
      header: t('invitations.col.role'),
      width: '104px',
      mobile: 'field',
      cell: (item) => <span className={ADMIN_TEXT}>{t(USER_ROLE_LABELS[item.role])}</span>,
    },
    {
      key: 'status',
      header: t('invitations.col.status'),
      width: '160px',
      wrap: true,
      mobile: 'badge',
      cell: (item) => (
        <span className="flex flex-col items-start">
          <AdminBadge tone={STATUS_TONES[item.status]} dot>
            {t(`invitations.status.${item.status}`)}
          </AdminBadge>
          {showsDelivery(item) && (
            <span
              className="rd-invite-delivery"
              data-tone={DELIVERY_TONES[item.email_status]}
              title={t(`invitations.deliveryHint.${item.email_status}`)}
            >
              {t(`invitations.delivery.${item.email_status}`)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'created',
      header: t('invitations.col.created'),
      width: '104px',
      align: 'right',
      mobile: 'field',
      cell: (item) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(item.created_at, DATE_FORMAT)}</span>,
    },
    {
      key: 'expires',
      header: t('invitations.col.expires'),
      headerTitle: t('invitations.col.expiresHint'),
      width: '120px',
      align: 'right',
      mobile: 'field',
      cell: (item) =>
        item.status === 'pending' || item.status === 'expired' ? (
          <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(item.expires_at, DATE_FORMAT)}</span>
        ) : (
          <span className={ADMIN_META}>—</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('invitations.col.actions')}</span>,
      width: '408px',
      align: 'right',
      mobile: 'action',
      className: 'admin-table-actions',
      cell: (item) => {
        const isPending = item.status === 'pending';
        const canResend = isPending || item.status === 'expired';
        if (!canResend) return <span className={ADMIN_META}>—</span>;
        const isBusy = handlers.busyId !== null;
        const isCopied = handlers.copiedId === item.id;
        return (
          <span className="rd-invite-actions">
            {isPending && (
              // The label stays put when copied — a wider "Скопировано" would
              // push the row's last action out of the column.
              <button
                type="button"
                className={ADMIN_BUTTON}
                data-copied={isCopied || undefined}
                disabled={isBusy}
                aria-busy={handlers.busyId === item.id}
                title={isCopied ? t('invitations.actions.linkCopied') : t('invitations.actions.copyLink')}
                aria-label={t('invitations.actions.copyLink')}
                onClick={() => handlers.onCopyLink(item)}
              >
                {isCopied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
                {t('invitations.actions.link')}
                <span className="sr-only" aria-live="polite">{isCopied ? t('invitations.actions.linkCopied') : ''}</span>
              </button>
            )}
            <button
              type="button"
              className={ADMIN_BUTTON}
              disabled={isBusy}
              onClick={() => handlers.onResend(item)}
            >
              <RotateCw size={14} aria-hidden="true" />
              {t('invitations.actions.resend')}
            </button>
            {isPending && (
              <button
                type="button"
                className={ADMIN_BUTTON}
                data-tone="danger"
                disabled={isBusy}
                onClick={() => handlers.onRevoke(item)}
              >
                <XCircle size={14} aria-hidden="true" />
                {t('invitations.actions.revoke')}
              </button>
            )}
          </span>
        );
      },
    },
  ];
}
