import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { AdminDataTable } from '@/shared/ui/admin/AdminDataTable';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { invitationColumns } from './components/invitationColumns';
import { InvitationLinkNotice } from './components/InvitationLinkNotice';
import { InviteStaffModal } from './components/InviteStaffModal';
import { INVITATION_STATUSES, INVITATIONS_PAGE_SIZE, useAdminInvitations } from './hooks/useAdminInvitations';

/** /admin/invitations — staff invitations and their state (PRO-464). */
export default function AdminInvitationsPage() {
  const { t } = useTranslation('admin');
  const invitations = useAdminInvitations();

  const columns = invitationColumns(t, {
    busyId: invitations.busyId,
    onResend: invitations.handleResend,
    onRevoke: (item) => void invitations.handleRevoke(item),
  });

  return (
    <>
      <AdminListHeader
        title={t('nav.invitations')}
        description={t('invitations.description')}
        actions={
          <Button variant="ghost" size="sm" muteSound onClick={invitations.openInvite}>
            <UserPlus size={14} />
            {t('invitations.invite')}
          </Button>
        }
      />

      {invitations.lastSent && (
        <InvitationLinkNotice invitation={invitations.lastSent} onDismiss={invitations.dismissLastSent} />
      )}

      <AdminToolbar
        search={{ value: invitations.search, onChange: invitations.setSearch, placeholder: 'Email' }}
        selects={[
          {
            key: 'status',
            label: t('invitations.col.status'),
            value: invitations.status,
            options: INVITATION_STATUSES.map((value) => ({ value, label: t(`invitations.status.${value}`) })),
          },
        ]}
        onFilterChange={(_, value) => invitations.setStatus(value)}
        onClearAll={invitations.clearFilters}
      />

      {invitations.actionError && <AdminError message={invitations.actionError} />}
      {invitations.isError && <AdminError message={t('invitations.loadError')} onRetry={invitations.retry} />}

      <AdminDataTable
        label={t('nav.invitations')}
        columns={columns}
        rows={invitations.rows}
        rowKey={(item) => item.id}
        loading={invitations.isLoading}
        emptyTitle={t('invitations.empty')}
        emptyHint={t('invitations.emptyHint')}
      />

      <AdminPager
        page={invitations.page}
        total={invitations.total}
        pageSize={INVITATIONS_PAGE_SIZE}
        onPageChange={invitations.setPage}
        countKey="invitations"
      />

      <InviteStaffModal isOpen={invitations.isInviteOpen} onClose={invitations.closeInvite} />
    </>
  );
}
