import type { TFunction } from 'i18next';
import { RotateCw, XCircle } from 'lucide-react';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { Button } from '@/shared/ui/Button';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import type { AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminInvitation, AdminInvitationStatus } from '@/shared/types';

const STATUS_TONES: Record<AdminInvitationStatus, AdminBadgeTone> = {
  pending: 'accent',
  accepted: 'brand',
  expired: 'quiet',
  revoked: 'danger',
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

interface InvitationRowHandlers {
  /** Row whose resend/revoke is in flight. */
  busyId: string | null;
  onResend: (invitation: AdminInvitation) => void;
  onRevoke: (invitation: AdminInvitation) => void;
}

/** Columns of the /admin/invitations table. Actions follow the status:
 *  resend for pending/expired, revoke for pending only (contract §3.4–§3.5). */
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
      width: '110px',
      mobile: 'field',
      cell: (item) => <span className={ADMIN_TEXT}>{t(USER_ROLE_LABELS[item.role])}</span>,
    },
    {
      key: 'status',
      header: t('invitations.col.status'),
      width: '142px',
      mobile: 'badge',
      cell: (item) => (
        <AdminBadge tone={STATUS_TONES[item.status]} dot>
          {t(`invitations.status.${item.status}`)}
        </AdminBadge>
      ),
    },
    {
      key: 'created',
      header: t('invitations.col.created'),
      width: '118px',
      align: 'right',
      mobile: 'field',
      cell: (item) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(item.created_at, DATE_FORMAT)}</span>,
    },
    {
      key: 'expires',
      header: t('invitations.col.expires'),
      headerTitle: t('invitations.col.expiresHint'),
      width: '128px',
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
      mobileLabel: t('invitations.col.actions'),
      width: '196px',
      align: 'right',
      mobile: 'field',
      cell: (item) => {
        const canResend = item.status === 'pending' || item.status === 'expired';
        const canRevoke = item.status === 'pending';
        if (!canResend && !canRevoke) return <span className={ADMIN_META}>—</span>;
        const isBusy = handlers.busyId === item.id;
        return (
          <span className="flex flex-wrap justify-end gap-1">
            {canResend && (
              <Button
                variant="ghost"
                size="sm"
                muteSound
                disabled={isBusy}
                onClick={() => handlers.onResend(item)}
              >
                <RotateCw size={14} aria-hidden="true" />
                {t('invitations.actions.resend')}
              </Button>
            )}
            {canRevoke && (
              <Button
                variant="ghost"
                size="sm"
                muteSound
                disabled={isBusy}
                onClick={() => handlers.onRevoke(item)}
              >
                <XCircle size={14} aria-hidden="true" />
                {t('invitations.actions.revoke')}
              </Button>
            )}
          </span>
        );
      },
    },
  ];
}
