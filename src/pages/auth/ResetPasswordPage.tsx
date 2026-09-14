import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OtpInput } from '@/shared/ui/OtpInput';
import { PasswordStrengthMeter } from '@/shared/ui/PasswordStrengthMeter';

const RESEND_SECONDS = 60;
// OtpInput pads not-yet-filled cells with a space to preserve gap position —
// a complete code has no spaces, so length alone can't tell "done" from
// "mid-edit with a gap".
const CODE_COMPLETE = /^\d{6}$/;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  // Код подтверждается отдельным шагом (/verify-reset-code) до того, как
  // пользователь вообще увидит форму нового пароля — иначе он мог набрать
  // пароль и только на сабмите узнать, что код уже не тот.
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = window.setTimeout(() => setResendCountdown(s => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [resendCountdown]);

  function validatePassword(): boolean {
    let valid = true;
    const pwdErrKey = (() => {
      if (password.length < 8) return 'auth:validation.passwordMin8';
      if (!/[A-Za-z]/.test(password)) return 'auth:validation.passwordNeedsLetter';
      if (!/\d/.test(password)) return 'auth:validation.passwordNeedsDigit';
      return '';
    })();
    if (pwdErrKey) {
      setPasswordError(t(pwdErrKey));
      valid = false;
    } else {
      setPasswordError('');
    }
    if (password !== confirm) {
      setConfirmError(t('auth:validation.passwordsMismatch'));
      valid = false;
    } else {
      setConfirmError('');
    }
    return valid;
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!CODE_COMPLETE.test(code)) {
      setCodeError(t('auth:validation.codeIncomplete'));
      return;
    }
    setCodeError('');
    setIsCodeLoading(true);
    try {
      await authApi.verifyResetCode(email!, code.trim());
      setStep('password');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setCodeError(t('auth:error.tooManyAttempts'));
      } else {
        setCodeError(t('auth:error.invalidOrExpiredCode'));
      }
    } finally {
      setIsCodeLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(email!, code.trim(), password);
      navigate('/login', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setFormError(t('auth:error.tooManyAttempts'));
      } else if (axios.isAxiosError(err) && err.response?.status === 400) {
        // Код прошёл проверку на шаге 1, но успел истечь (>15 минут) или был
        // погашен параллельной попыткой — возвращаем на ввод кода, а не
        // показываем ошибку в форме пароля, где пользователь её не ждёт.
        // Поле чистим: старые цифры уже недействительны, а кнопка шага 1
        // активна по заполненности — иначе повторный сабмит даст ту же ошибку.
        setStep('code');
        setCode('');
        setCodeError(t('auth:error.codeExpiredRetry'));
      } else {
        // Сеть или 5xx — код тут ни при чём. Не выбрасываем с шага пароля:
        // введённый пароль сохраняется, человек просто повторяет отправку.
        setFormError(t('auth:error.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResendMessage('');
    setResendCountdown(RESEND_SECONDS);
    // Прошлый код бэкенд гасит при выдаче нового — не оставляем его в поле.
    setCode('');
    setCodeError('');
    try {
      await authApi.forgotPassword(email);
      setResendMessage(t('auth:reset.resentMaybe'));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setResendMessage(t('auth:error.waitBeforeResend'));
      } else {
        setResendMessage(t('auth:error.resendFailed'));
      }
    }
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <XCircle size={40} className="text-danger" />
        <h1 className="auth-headline-sm">{t('auth:reset.noEmailTitle')}</h1>
        <p className="text-body text-secondary">{t('auth:reset.noEmailBody')}</p>
        <Link
          to="/forgot-password"
          className="mt-1 inline-flex items-center justify-center w-full min-h-12 px-6 bg-brand text-on-brand font-medium text-label rounded-[var(--radius)] hover:bg-brand-hover transition-colors press-scale"
        >
          {t('auth:reset.requestAgain')}
        </Link>
        <Link to="/login" className="text-caption text-muted hover:opacity-70 transition-opacity">
          {t('auth:backToLogin')}
        </Link>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <>
        <h1 className="auth-headline-sm mt-[20px]">{t('auth:reset.codeTitle')}</h1>
        <p className="auth-sub">
          <Trans
            i18nKey="auth:reset.codeSubtitle"
            values={{ email }}
            components={{ b: <span className="font-semibold text-primary" /> }}
          />
        </p>

        <form onSubmit={handleVerifyCode} noValidate>
          <div className="mt-[32px]">
            <OtpInput
              length={6}
              value={code}
              onChange={(v) => { setCode(v); setCodeError(''); }}
              error={!!codeError}
              disabled={isCodeLoading}
              autoFocus
              aria-label={t('auth:verify.otpAria')}
            />
            {codeError && (
              <p className="field-error-in text-body-sm text-danger mt-[8px]" role="alert">
                {codeError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isCodeLoading}
            disabled={!CODE_COMPLETE.test(code)}
            size="lg"
            className="w-full mt-[28px]"
          >
            {isCodeLoading ? t('auth:reset.codeSubmitting') : t('auth:reset.codeSubmit')}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-1 mt-[24px]">
          {resendCountdown > 0 ? (
            <p className="font-mono text-mono-xs tracking-label uppercase text-muted">
              {t('auth:verify.resendIn', { seconds: resendCountdown })}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-mono text-mono-xs tracking-label uppercase text-brand hover:opacity-70 transition-opacity"
            >
              {t('auth:verify.resend')}
            </button>
          )}
          {resendMessage && (
            <p className="text-small text-secondary text-center">{resendMessage}</p>
          )}
          <p className="text-caption text-muted text-center mt-1">{t('auth:checkSpamAddress')}</p>
          <Link
            to="/login"
            className="text-caption text-muted hover:opacity-70 transition-opacity mt-2"
          >
            {t('auth:backToLogin')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="auth-headline-sm mt-[20px]">{t('auth:reset.passwordTitle')}</h1>
      <p className="auth-sub">{t('auth:reset.passwordSubtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[32px]">
          <Input
            label={t('auth:reset.newLabel')}
            className="pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
            error={passwordError}
            autoComplete="new-password"
            autoFocus
            rightSlot={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="text-muted hover:text-secondary transition-colors"
                aria-label={t(showPassword ? 'auth:field.hidePassword' : 'auth:field.showPassword')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          {!passwordError && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="mt-[24px]">
          <Input
            label={t('auth:reset.confirmLabel')}
            className="pr-10"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
            error={confirmError}
            autoComplete="new-password"
            rightSlot={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(v => !v)}
                className="text-muted hover:text-secondary transition-colors"
                aria-label={t(showConfirm ? 'auth:field.hidePassword' : 'auth:field.showPassword')}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[28px]">
          {isLoading ? t('auth:reset.submitting') : t('auth:reset.submit')}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-1 mt-[24px]">
        <Link
          to="/login"
          className="text-caption text-muted hover:opacity-70 transition-opacity mt-2"
        >
          {t('auth:backToLogin')}
        </Link>
      </div>
    </>
  );
}
