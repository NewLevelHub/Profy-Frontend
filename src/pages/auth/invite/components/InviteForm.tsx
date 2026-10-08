import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, MailPlus } from 'lucide-react';
import { env } from '@/shared/config/env';
import type { InvitationPreview } from '@/shared/types';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { PasswordStrengthMeter } from '@/shared/ui/PasswordStrengthMeter';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import { PasswordInput } from '@/shared/ui/redesign/PasswordInput';

interface InviteFormProps {
  invitation: InvitationPreview;
  password: string;
  confirm: string;
  passwordError: string;
  confirmError: string;
  formError: string;
  isSubmitting: boolean;
  isGoogleSubmitting: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleCredential: (idToken: string) => void;
}

export function InviteForm({
  invitation,
  password,
  confirm,
  passwordError,
  confirmError,
  formError,
  isSubmitting,
  isGoogleSubmitting,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
  onGoogleCredential,
}: InviteFormProps) {
  const { t } = useTranslation();
  const isBusy = isSubmitting || isGoogleSubmitting;

  return (
    <>
      <AuthHeading title={t('auth:invite.title')} icon={<MailPlus />}>
        {t(`auth:invite.subtitle.${invitation.role}`)}
      </AuthHeading>
      {/* The account is created for the invited address only — shown, not editable. */}
      <div className="rd-auth-address">
        <Mail size={18} aria-hidden="true" />
        <span>{invitation.email}</span>
      </div>

      <form className="rd-login-fields rd-auth-fields" onSubmit={onSubmit} noValidate aria-busy={isBusy}>
        <div className="rd-auth-password">
          <PasswordInput
            label={t('auth:field.password')}
            name="password"
            placeholder={t('auth:invite.passwordPlaceholder')}
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            error={passwordError}
            autoComplete="new-password"
            disabled={isBusy}
            autoFocus
            required
          />
          {!passwordError && <PasswordStrengthMeter password={password} className="rd-password-strength" />}
        </div>
        <div className="rd-login-password">
          <PasswordInput
            label={t('auth:field.passwordRepeat')}
            name="confirm-password"
            placeholder={t('auth:invite.confirmPlaceholder')}
            value={confirm}
            onChange={e => onConfirmChange(e.target.value)}
            error={confirmError}
            autoComplete="new-password"
            disabled={isBusy}
            required
          />
        </div>
        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        <Button type="submit" isLoading={isSubmitting} disabled={isGoogleSubmitting} size="lg" className="rd-button rd-login-submit">
          {isSubmitting ? t('auth:invite.submitting') : t('auth:invite.submit')}
          {!isSubmitting && <ArrowRight size={20} aria-hidden="true" />}
        </Button>

        {env.GOOGLE_CLIENT_ID && (
          <>
            <div className="rd-login-divider"><span>{t('auth:divider')}</span></div>
            <GoogleSignInButton text="signin_with" disabled={isBusy} onCredential={onGoogleCredential} />
            <p className="rd-auth-hint rd-google-hint">{t('auth:invite.googleHint', { email: invitation.email })}</p>
          </>
        )}
      </form>
      {/* No way off this page: the account exists only once this form is
          sent, and coming back takes the emailed link. */}
    </>
  );
}
