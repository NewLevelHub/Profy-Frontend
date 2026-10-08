import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRight, Clock, LogIn, UserCheck, XCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import type { InviteBlocker } from '../hooks/useInvite';

type Action = 'signIn' | 'retry' | 'signOut' | null;

// blocker -> auth:invite.blocked.<key> + icon + primary action
const BLOCKERS: Record<InviteBlocker, { key: string; icon: LucideIcon; action: Action }> = {
  invitation_invalid: { key: 'invalid', icon: XCircle, action: null },
  invitation_expired: { key: 'expired', icon: Clock, action: null },
  invitation_revoked: { key: 'revoked', icon: XCircle, action: null },
  invitation_used: { key: 'used', icon: UserCheck, action: 'signIn' },
  user_exists: { key: 'userExists', icon: UserCheck, action: 'signIn' },
  rate_limited: { key: 'rateLimited', icon: Clock, action: null },
  load_failed: { key: 'loadFailed', icon: XCircle, action: 'retry' },
  signed_in: { key: 'signedIn', icon: LogIn, action: 'signOut' },
};

interface InviteBlockedStateProps {
  blocker: InviteBlocker;
  signedInEmail: string;
  homePath: string;
  onRetry: () => void;
  onSignOut: () => void;
}

export function InviteBlockedState({ blocker, signedInEmail, homePath, onRetry, onSignOut }: InviteBlockedStateProps) {
  const { t } = useTranslation();
  const { key, icon: Icon, action } = BLOCKERS[blocker];

  return (
    <div className="rd-auth-state" role="status">
      <AuthHeading title={t(`auth:invite.blocked.${key}.title`)} icon={<Icon />}>
        <Trans
          i18nKey={`auth:invite.blocked.${key}.body`}
          values={{ email: signedInEmail }}
          components={{ b: <strong className="rd-email-value" /> }}
        />
      </AuthHeading>

      {action === 'signIn' && (
        <Link to="/login" className="rd-button rd-login-submit">
          {t('auth:invite.signIn')}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      )}
      {action === 'retry' && (
        <Button size="lg" className="rd-button rd-login-submit" onClick={onRetry}>
          {t('auth:invite.retry')}
        </Button>
      )}
      {action === 'signOut' && (
        <Button size="lg" className="rd-button rd-login-submit" onClick={onSignOut}>
          {t('auth:invite.signOut')}
        </Button>
      )}

      {action === 'signOut' && (
        <p className="rd-login-switch"><Link to={homePath}>{t('auth:invite.toCabinet')}</Link></p>
      )}
      {action !== 'signOut' && action !== 'signIn' && (
        <p className="rd-login-switch"><Link to="/login">{t('auth:backToLogin')}</Link></p>
      )}
    </div>
  );
}
