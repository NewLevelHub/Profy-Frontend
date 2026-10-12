import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Copy, Link2, MailCheck } from 'lucide-react';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';

const COPIED_MS = 2000;

/** Why the link is on screen: right after creating, after a resend, or
 *  asked for from a row (when copying straight from the row failed). */
export type InvitationLinkKind = 'created' | 'resent' | 'link';

interface InvitationLinkPanelProps {
  titleId: string;
  kind: InvitationLinkKind;
  email: string;
  inviteUrl: string;
  expiresAt: string;
  /** created / resent: whether the email went out. */
  emailSent?: boolean;
}

/** Result of an invitation action: what happened to the email, and the link
 *  itself, shown in full so it can be checked and copied by hand. */
export function InvitationLinkPanel({ titleId, kind, email, inviteUrl, expiresAt, emailSent = true }: InvitationLinkPanelProps) {
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
      await navigator.clipboard.writeText(inviteUrl);
      setCopyFailed(false);
      setIsCopied(true);
    } catch {
      // Insecure context / denied permission — the link stays selectable.
      setCopyFailed(true);
    }
  }

  const failed = kind !== 'link' && !emailSent;
  const Icon = failed ? AlertTriangle : kind === 'link' ? Link2 : MailCheck;
  const title = failed
    ? t('invitations.sent.titleFailed')
    : t(kind === 'created' ? 'invitations.sent.title' : kind === 'resent' ? 'invitations.sent.titleResent' : 'invitations.sent.titleLink');
  const textKey = kind === 'link' ? 'invitations.sent.linkFor' : failed ? 'invitations.sent.emailFailed' : 'invitations.sent.emailSent';
  const expires = formatDate(expiresAt, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="rd-invite-head">
        <span className="rd-invite-icon" data-tone={failed ? 'danger' : undefined}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <h2 id={titleId}>{title}</h2>
      </div>

      <div className="rd-invite-text" role="status">
        <p>
          <Trans t={t} i18nKey={textKey} values={{ email }} components={{ b: <b /> }} />
        </p>
        {kind === 'resent' && <p>{t('invitations.sent.resentNote')}</p>}
      </div>

      <div className="rd-invite-link">
        <span className="rd-invite-link-label" id={`${titleId}-link`}>{t('invitations.sent.linkLabel')}</span>
        <p className="rd-invite-link-url" aria-labelledby={`${titleId}-link`}>{inviteUrl}</p>
        <Button type="button" variant="ghost" size="md" muteSound onClick={handleCopy} className="rd-invite-copy">
          {isCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {isCopied ? t('invitations.sent.copied') : t('invitations.sent.copy')}
        </Button>
      </div>

      <p className="rd-invite-hint" aria-live="polite">
        {copyFailed ? t('invitations.sent.copyFailed') : t('invitations.sent.linkHint', { date: expires })}
      </p>
    </>
  );
}
