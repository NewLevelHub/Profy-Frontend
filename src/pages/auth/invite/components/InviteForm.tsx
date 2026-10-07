import { useTranslation } from 'react-i18next';
import { env } from '@/shared/config/env';
import type { InvitationPreview } from '@/shared/types';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { PasswordStrengthMeter } from '@/shared/ui/PasswordStrengthMeter';

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
      <h1 className="auth-card-title">{t('auth:invite.title')}</h1>
      <p className="auth-card-sub">{t(`auth:invite.subtitle.${invitation.role}`)}</p>

      <form onSubmit={onSubmit} noValidate>
        <div className="mt-[28px]">
          {/* The account is created for the invited address only. */}
          <Input
            label={t('auth:field.email')}
            type="email"
            value={invitation.email}
            readOnly
            aria-readonly="true"
            className="text-secondary"
          />
        </div>

        <div className="mt-[24px]">
          <PasswordInput
            label={t('auth:field.password')}
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            error={passwordError}
            autoComplete="new-password"
            autoFocus
          />
          {!passwordError && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="mt-[24px]">
          <PasswordInput
            label={t('auth:field.passwordRepeat')}
            value={confirm}
            onChange={e => onConfirmChange(e.target.value)}
            error={confirmError}
            autoComplete="new-password"
          />
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} disabled={isGoogleSubmitting} size="lg" className="w-full mt-[30px]">
          {isSubmitting ? t('auth:invite.submitting') : t('auth:invite.submit')}
        </Button>

        {env.GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 mt-[24px]">
              <div className="h-px flex-1 bg-[var(--hairline)]" />
              <span className="text-body-sm text-muted">{t('auth:divider')}</span>
              <div className="h-px flex-1 bg-[var(--hairline)]" />
            </div>
            <div className="mt-[16px]">
              <GoogleSignInButton text="signin_with" disabled={isBusy} onCredential={onGoogleCredential} />
            </div>
            <p className="text-caption text-muted text-center mt-[12px]">
              {t('auth:invite.googleHint', { email: invitation.email })}
            </p>
          </>
        )}
      </form>
    </>
  );
}
