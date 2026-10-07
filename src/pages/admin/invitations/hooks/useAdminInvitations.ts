import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/admin';
import { confirm } from '@/shared/lib/confirm';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import type { AdminInvitation, AdminInvitationStatus } from '@/shared/types';
import type { InvitationLinkKind } from '../components/InvitationLinkPanel';
import { invitationErrorMessage } from '../utils/invitationErrorMessage';

export const ADMIN_INVITATIONS_KEY = ['adminInvitations'] as const;
export const INVITATIONS_PAGE_SIZE = 20;
export const INVITATION_STATUSES: readonly AdminInvitationStatus[] = ['pending', 'accepted', 'expired', 'revoked'];

const FILTER_KEYS = ['search', 'status'] as const;
const COPIED_MS = 2000;

/** A link shown in the result dialog: after a resend, or when copying it
 *  straight from a row wasn't possible. */
export interface InvitationLinkDialogState {
  kind: Exclude<InvitationLinkKind, 'created'>;
  email: string;
  inviteUrl: string;
  expiresAt: string;
  emailSent?: boolean;
}

function parseStatus(value: string): AdminInvitationStatus | undefined {
  return (INVITATION_STATUSES as readonly string[]).includes(value) ? (value as AdminInvitationStatus) : undefined;
}

/** /admin/invitations — list (filters in the URL), link, resend and revoke. */
export function useAdminInvitations() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const { page, values, setFilter, setFilters, setPage } = useAdminListParams(FILTER_KEYS);
  const search = values.search;
  const status = parseStatus(values.status);

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkDialog, setLinkDialog] = useState<InvitationLinkDialogState | null>(null);
  /** Row whose link was just copied — its button reads "Скопировано". */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!copiedId) return;
    const id = window.setTimeout(() => setCopiedId(null), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copiedId]);

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

  const copyLink = useMutation({
    mutationFn: (invitation: AdminInvitation) => adminApi.getInvitationLink(invitation.id),
    onMutate: () => setActionError(''),
    onSuccess: async (link, invitation) => {
      try {
        await navigator.clipboard.writeText(link.invite_url);
        setCopiedId(invitation.id);
      } catch {
        // No clipboard access — show the link to copy by hand.
        setLinkDialog({ kind: 'link', email: invitation.email, inviteUrl: link.invite_url, expiresAt: link.expires_at });
      }
    },
    onError: handleActionError,
  });

  const resend = useMutation({
    mutationFn: (invitation: AdminInvitation) => adminApi.resendInvitation(invitation.id),
    onMutate: () => setActionError(''),
    onSuccess: (sent) => {
      setLinkDialog({
        kind: 'resent',
        email: sent.email,
        inviteUrl: sent.invite_url,
        expiresAt: sent.expires_at,
        emailSent: sent.email_sent,
      });
      void refreshList();
    },
    onError: handleActionError,
  });

  const revoke = useMutation({
    mutationFn: (invitation: AdminInvitation) => adminApi.revokeInvitation(invitation.id),
    onMutate: () => setActionError(''),
    onSuccess: () => void refreshList(),
    onError: handleActionError,
  });

  async function handleRevoke(invitation: AdminInvitation) {
    const isConfirmed = await confirm({
      title: t('invitations.revokeConfirm.title'),
      body: t('invitations.revokeConfirm.body', { email: invitation.email }),
      confirmLabel: t('invitations.actions.revoke'),
      cancelLabel: t('invitations.cancel'),
    });
    if (isConfirmed) revoke.mutate(invitation);
  }

  const pending = [copyLink, resend, revoke].find((mutation) => mutation.isPending);

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
    linkDialog,
    closeLinkDialog: () => setLinkDialog(null),
    actionError,
    busyId: pending?.variables?.id ?? null,
    copiedId,
    handleCopyLink: (invitation: AdminInvitation) => copyLink.mutate(invitation),
    handleResend: (invitation: AdminInvitation) => resend.mutate(invitation),
    handleRevoke,
  };
}
