import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Copy, X } from 'lucide-react';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminInvitationSent } from '@/shared/types';

const COPIED_MS = 2000;

interface InvitationLinkNoticeProps {
  invitation: AdminInvitationSent;
  onDismiss?: () => void;
}

/** The one-time `invite_url` of a just created / resent invitation — the
 *  fallback when the email lands in spam or the provider failed. */
export function InvitationLinkNotice({ invitation, onDismiss }: InvitationLinkNoticeProps) {
  const { t } = useTranslation('admin');
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const id = window.setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(invitation.invite_url);
      setCopyFailed(false);
      setIsCopied(true);
    } catch {
      // Insecure context / denied permission — the field below stays selectable.
      setCopyFailed(true);
    }
  }

  const expires = formatDate(invitation.expires_at, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 px-3.5 py-3 rounded-[3px] border',
        invitation.email_sent ? 'border-brand bg-brand-subtle' : 'border-danger bg-danger-subtle',
      )}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn(ADMIN_TEXT, 'm-0 flex items-start gap-2', invitation.email_sent ? 'text-brand' : 'text-danger')}>
          {!invitation.email_sent && <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
          {invitation.email_sent
            ? t('invitations.sent.emailSent', { email: invitation.email })
            : t('invitations.sent.emailFailed', { email: invitation.email })}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted hover:text-primary transition-colors"
            aria-label={t('invitations.sent.dismiss')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          className={cn(ADMIN_INPUT, 'flex-1 min-w-0 font-mono text-mono-sm')}
          value={invitation.invite_url}
          readOnly
          aria-label={t('invitations.sent.linkLabel')}
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button type="button" variant="ghost" size="sm" muteSound onClick={handleCopy}>
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? t('invitations.sent.copied') : t('invitations.actions.copyLink')}
        </Button>
      </div>

      <p className={cn(ADMIN_META, 'm-0')}>
        {copyFailed ? t('invitations.sent.copyFailed') : t('invitations.sent.linkHint', { date: expires })}
      </p>
    </div>
  );
}
