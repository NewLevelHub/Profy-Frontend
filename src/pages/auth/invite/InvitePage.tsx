import { InviteBlockedState } from './components/InviteBlockedState';
import { InviteForm } from './components/InviteForm';
import { InviteSkeleton } from './components/InviteSkeleton';
import { useInvite } from './hooks/useInvite';

/** /invite?token=… — staff account from an email invitation (PRO-465).
 *  Contract: docs/frontend-admin-invitations-api-contract.md §4–§5 (backend repo). */
export default function InvitePage() {
  const invite = useInvite();

  if (invite.view === 'blocked' && invite.blocker) {
    return (
      <InviteBlockedState
        blocker={invite.blocker}
        signedInEmail={invite.signedInEmail}
        homePath={invite.homePath}
        onRetry={invite.retry}
        onSignOut={invite.signOut}
      />
    );
  }
  if (invite.view === 'loading' || !invite.invitation) return <InviteSkeleton />;

  return (
    <InviteForm
      invitation={invite.invitation}
      password={invite.password}
      confirm={invite.confirm}
      passwordError={invite.passwordError}
      confirmError={invite.confirmError}
      formError={invite.formError}
      isSubmitting={invite.isSubmitting}
      isGoogleSubmitting={invite.isGoogleSubmitting}
      onPasswordChange={invite.setPassword}
      onConfirmChange={invite.setConfirm}
      onSubmit={invite.handleSubmit}
      onGoogleCredential={invite.handleGoogleCredential}
    />
  );
}
