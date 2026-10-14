import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EMAIL_AS_TEXT } from '@/shared/i18n/transText';
import { Link, useSearchParams } from 'react-router';
import { AuthStepper } from '@/shared/ui/AuthStepper';
import axios from 'axios';
import { ArrowRight, Mail, XCircle } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { apiErrorCode } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import { OtpInput } from '@/shared/ui/OtpInput';

const RESEND_SECONDS = 60;
// OtpInput pads not-yet-filled cells with a space to preserve gap position —
// a complete code has no spaces, so length alone can't tell "done" from
// "mid-edit with a gap".
const CODE_COMPLETE = /^\d{6}$/;

// ─── OTP mode (code from email, after registration) ───────────────────────────

function OtpVerify({ email, showStepper }: { email: string; showStepper: boolean }) {
  const { t } = useTranslation('auth');
  const storeLogin = useAuthStore(s => s.login);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = window.setTimeout(() => setResendCountdown(s => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [resendCountdown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!CODE_COMPLETE.test(code)) {
      setCodeError(t('validation.codeIncomplete'));
      return;
    }
    setCodeError('');
    setFormError('');
    setIsLoading(true);
    try {
      const { access_token, user } = await authApi.verifyEmailByCode(email, code.trim());
      storeLogin(access_token, user);
      // Navigation is handled by RequireGuest — it detects the token
      // and sends the user to homePathForUser (role home).
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setFormError(t('error.tooManyAttempts'));
        } else if (apiErrorCode(err) === 'invited_email_register') {
          // The code is right, but the address has an open staff invitation:
          // it is confirmed by the link from that email, never by this code.
          setFormError(t('error.invitedEmailRegister'));
        } else {
          setCodeError(t('error.invalidOrExpiredCode'));
        }
      } else {
        setFormError(t('error.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setResendMessage('');
    setResendCountdown(RESEND_SECONDS);
    try {
      await authApi.resendVerification(email);
      // Бэкенд всегда отвечает 204 независимо от того, существует ли
      // аккаунт с этим email — не утверждаем, что письмо точно ушло.
      setResendMessage(t('verify.resentMaybe'));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setResendMessage(t('error.waitBeforeResend'));
      } else {
        setResendMessage(t('error.resendFailed'));
      }
    }
  }

  return (
    <>
      {showStepper && <AuthStepper current={3} />}
      <AuthHeading title={t('redesign.verify.title')} icon={<Mail />}>
        <Trans i18nKey="auth:redesign.verify.subtitle" values={{ email }} components={{ b: <strong className="rd-email-value" /> }} {...EMAIL_AS_TEXT} />
      </AuthHeading>
      <form className="rd-login-fields rd-auth-fields" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
        <p className="rd-code-label">{t('verify.otpAria')}</p>
        <OtpInput
          className="rd-auth-otp"
          length={6}
          value={code}
          onChange={v => { setCode(v); setCodeError(''); }}
          error={!!codeError}
          disabled={isLoading}
          aria-label={t('verify.otpAria')}
          aria-describedby={codeError ? 'verify-code-error' : undefined}
        />
        {codeError && <p id="verify-code-error" className="rd-form-error" role="alert">{codeError}</p>}
        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        <Button type="submit" isLoading={isLoading} disabled={!CODE_COMPLETE.test(code)} size="lg" className="rd-button rd-login-submit">
          {isLoading ? t('verify.submitting') : t('verify.submit')}
          {!isLoading && <ArrowRight size={20} aria-hidden="true" />}
        </Button>
      </form>
      <div className="rd-auth-actions">
        {resendCountdown > 0 ? (
          <p className="rd-resend-countdown">{t('verify.resendIn', { seconds: resendCountdown })}</p>
        ) : (
          <button type="button" onClick={handleResend} disabled={isLoading} className="rd-text-link">{t('verify.resend')}</button>
        )}
        {resendMessage && <p className="rd-auth-feedback" role="status">{resendMessage}</p>}
        <p className="rd-auth-hint">{t('redesign.checkSpam')}</p>
      </div>
      <p className="rd-login-switch"><Link to="/login">{t('backToLogin')}</Link></p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  if (email) return <OtpVerify email={email} showStepper={searchParams.get('step') === '3'} />;

  return (
    <div className="rd-auth-state">
      <AuthHeading title={t('verify.linkInvalidTitle')} icon={<XCircle />}>
        {t('verify.linkInvalidBody')}
      </AuthHeading>
      <Link to="/login" className="rd-button rd-login-submit">{t('backToLogin')}</Link>
    </div>
  );
}
