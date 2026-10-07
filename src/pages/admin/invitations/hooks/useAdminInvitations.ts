import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/admin';
import { confirm } from '@/shared/lib/confirm';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import type { AdminInvitation, AdminInvitationSent, AdminInvitationStatus } from '@/shared/types';
import { invitationErrorMessage } from '../utils/invitationErrorMessage';

export const ADMIN_INVITATIONS_KEY = ['adminInvitations'] as const;
export const INVITATIONS_PAGE_SIZE = 20;
export const INVITATION_STATUSES: readonly AdminInvitationStatus[] = ['pending', 'accepted', 'expired', 'revoked'];

const FILTER_KEYS = ['search', 'status'] as const;

function parseStatus(value: string): AdminInvitationStatus | undefined {
  return (INVITATION_STATUSES as readonly string[]).includes(value) ? (value as AdminInvitationStatus) : undefined;
}

/** /admin/invitations — list (filters in the URL), resend and revoke. */
export function useAdminInvitations() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const { page, values, setFilter, setFilters, setPage } = useAdminListParams(FILTER_KEYS);
  const search = values.search;
  const status = parseStatus(values.status);

  const [isInviteOpen, setInviteOpen] = useState(false);
  /** Last resend result — its link can only be copied right now. */
  const [lastSent, setLastSent] = useState<AdminInvitationSent | null>(null);
  const [actionError, setActionError] = useState('');

  const list = useQuery({
    queryKey: [...ADMIN_INVITATIONS_KEY, { page, status, search }],
    queryFn: () =>
      adminApi.listInvitations({ page, limit: INVITATIONS_PAGE_SIZE, status, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const refreshList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ADMIN_INVITATIONS_KEY }),
    [queryClient],
  );

  // On failure the row is usually stale (accepted or revoked meanwhile) —
  // refresh it so the actions match the real status.
  function handleActionError(error: unknown) {
    setActionError(invitationErrorMessage(error, t));
    void refreshList();
  }

  const resend = useMutation({
    mutationFn: adminApi.resendInvitation,
    onMutate: () => setActionError(''),
    onSuccess: (sent) => {
      setLastSent(sent);
      void refreshList();
    },
    onError: handleActionError,
  });

  const revoke = useMutation({
    mutationFn: adminApi.revokeInvitation,
    onMutate: () => setActionError(''),
    onSuccess: (revoked) => {
      setLastSent((prev) => (prev?.id === revoked.id ? null : prev));
      void refreshList();
    },
    onError: handleActionError,
  });

  async function handleRevoke(invitation: AdminInvitation) {
    const isConfirmed = await confirm({
      title: t('invitations.revokeConfirm.title'),
      body: t('invitations.revokeConfirm.body', { email: invitation.email }),
      confirmLabel: t('invitations.actions.revoke'),
      cancelLabel: t('invitations.cancel'),
    });
    if (isConfirmed) revoke.mutate(invitation.id);
  }

  const busyId = resend.isPending ? resend.variables : revoke.isPending ? revoke.variables : null;

  return {
    rows: list.data?.items ?? [],
    total: list.data?.total ?? 0,
    page,
    isLoading: list.isLoading,
    isError: list.isError,
    retry: () => void list.refetch(),
    search,
    status: status ?? '',
    setSearch: (value: string) => setFilter('search', value),
    setStatus: (value: string) => setFilter('status', value),
    clearFilters: () => setFilters({ search: '', status: '' }),
    setPage,
    isInviteOpen,
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
    lastSent,
    dismissLastSent: () => setLastSent(null),
    actionError,
    busyId,
    handleResend: (invitation: AdminInvitation) => resend.mutate(invitation.id),
    handleRevoke,
  };
}
