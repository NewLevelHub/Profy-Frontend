import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { AuthStepper } from '@/shared/ui/AuthStepper';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';

const RESEND_SECONDS = 60;
// OtpInput pads not-yet-filled cells with a space to preserve gap position —
// a complete code has no spaces, so length alone can't tell "done" from
// "mid-edit with a gap".
const CODE_COMPLETE = /^\d{6}$/;

// ─── Token mode (link from email) ────────────────────────────────────────────

type TokenStatus = 'loading' | 'success' | 'error';

function TokenVerify({ token }: { token: string }) {
  const { t } = useTranslation('auth');
  const storeLogin = useAuthStore(s => s.login);
  const [status, setStatus] = useState<TokenStatus>('loading');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    authApi.verifyEmailByToken(token)
      .then(({ access_token, user }) => {
        storeLogin(access_token, user);
        setStatus('success');
        // Navigation is handled by RequireGuest — it detects the token
        // and renders <Navigate to="/welcome" replace /> declaratively.
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <Loader2 size={40} className="text-brand animate-spin" />
        <p className="text-body font-semibold text-primary">{t('verify.confirming')}</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <CheckCircle size={40} className="text-success" />
        <p className="text-body font-semibold text-primary">{t('verify.confirmedTitle')}</p>
        <p className="text-caption text-secondary">{t('verify.redirecting')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <XCircle size={40} className="text-danger" />
      <h1 className="auth-headline-sm">{t('verify.linkExpiredTitle')}</h1>
      <p className="text-body text-secondary">{t('verify.linkExpiredBody')}</p>
      <Link
        to="/register"
        className="mt-1 inline-flex items-center justify-center w-full min-h-12 px-6 bg-brand text-on-brand font-medium text-label rounded-[var(--radius)] hover:bg-brand-hover transition-colors press-scale"
      >
        {t('verify.registerAgain')}
      </Link>
      <Link to="/login" className="text-caption text-muted hover:opacity-70 transition-opacity">
        {t('backToLogin')}
      </Link>
    </div>
  );
}

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
      // and renders <Navigate to="/results" replace /> declaratively.
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setFormError(t('error.tooManyAttempts'));
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
      {/* Индикатор только когда пришли из регистрации: на этот же экран
          попадают со входа, если почта не подтверждена, — там мастера нет. */}
      {showStepper && <AuthStepper current={3} />}
      <h1 className="auth-headline-sm mt-[20px]">
        {t('verify.otpTitle', { email })}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[32px]">
          <OtpInput
            length={6}
            value={code}
            onChange={(v) => { setCode(v); setCodeError(''); }}
            error={!!codeError}
            disabled={isLoading}
            autoFocus
            aria-label={t('verify.otpAria')}
          />
          {codeError && (
            <p className="field-error-in text-body-sm text-danger mt-[8px]" role="alert">
              {codeError}
            </p>
          )}
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        <Button type="submit" isLoading={isLoading} disabled={!CODE_COMPLETE.test(code)} size="lg" className="w-full mt-[28px]">
          {isLoading ? t('verify.submitting') : t('verify.submit')}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 mt-[24px]">
        {resendCountdown > 0 ? (
          <p className="font-mono text-mono-xs tracking-label uppercase text-muted">
            {t('verify.resendIn', { seconds: resendCountdown })}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-mono text-mono-xs tracking-label uppercase text-brand hover:opacity-70 transition-opacity"
          >
            {t('verify.resend')}
          </button>
        )}
        {resendMessage && (
          <p className="text-small text-secondary text-center">{resendMessage}</p>
        )}
        <p className="text-caption text-muted text-center mt-1">{t('checkSpam')}</p>
        <Link
          to="/login"
          className="text-caption text-muted hover:opacity-70 transition-opacity mt-2"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (token) return <TokenVerify token={token} />;

  if (email) return <OtpVerify email={email} showStepper={searchParams.get('step') === '3'} />;

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <XCircle size={40} className="text-danger" />
      <h1 className="auth-headline-sm">{t('verify.linkInvalidTitle')}</h1>
      <p className="text-body text-secondary">{t('verify.linkInvalidBody')}</p>
      <Link to="/login" className="text-caption text-brand hover:opacity-70 transition-opacity">
        {t('backToLogin')}
      </Link>
    </div>
  );
}
