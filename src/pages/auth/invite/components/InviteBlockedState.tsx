import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Clock, LogIn, UserCheck, XCircle, type LucideIcon } from 'lucide-react';
import { Button, buttonClasses } from '@/shared/ui/Button';
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
  const primaryClass = buttonClasses({ size: 'lg', className: 'w-full mt-1' });

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6" role="status">
      <Icon size={40} className={blocker === 'signed_in' ? 'text-brand' : 'text-danger'} aria-hidden="true" />
      <h1 className="auth-headline-sm">{t(`auth:invite.blocked.${key}.title`)}</h1>
      <p className="text-body text-secondary">
        <Trans
          i18nKey={`auth:invite.blocked.${key}.body`}
          values={{ email: signedInEmail }}
          components={{ b: <span className="font-semibold text-primary" /> }}
        />
      </p>

      {action === 'signIn' && (
        <Link to="/login" className={primaryClass}>
          {t('auth:invite.signIn')}
        </Link>
      )}
      {action === 'retry' && (
        <Button size="lg" className="w-full mt-1" onClick={onRetry}>
          {t('auth:invite.retry')}
        </Button>
      )}
      {action === 'signOut' && (
        <Button size="lg" className="w-full mt-1" onClick={onSignOut}>
          {t('auth:invite.signOut')}
        </Button>
      )}

      {action === 'signOut' && (
        <Link to={homePath} className="text-caption text-muted hover:opacity-70 transition-opacity">
          {t('auth:invite.toCabinet')}
        </Link>
      )}
      {action !== 'signOut' && action !== 'signIn' && (
        <Link to="/login" className="text-caption text-muted hover:opacity-70 transition-opacity">
          {t('auth:backToLogin')}
        </Link>
      )}
    </div>
  );
}
