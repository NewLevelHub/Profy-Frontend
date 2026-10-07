import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { ArrowRight, KeyRound, Mail, XCircle } from 'lucide-react';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import { PasswordInput } from '@/shared/ui/redesign/PasswordInput';
import { AuthStepper } from '@/shared/ui/AuthStepper';
import { authApi } from '@/shared/api/auth';
import { Button } from '@/shared/ui/Button';
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
      navigate('/login', { replace: true, state: { passwordReset: true } });
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
      <div className="rd-auth-state">
        <AuthHeading title={t('auth:reset.noEmailTitle')} icon={<XCircle />}>
          {t('auth:reset.noEmailBody')}
        </AuthHeading>
        <Link to="/forgot-password" className="rd-button rd-login-submit">{t('auth:reset.requestAgain')}<ArrowRight size={20} aria-hidden="true" /></Link>
        <p className="rd-login-switch"><Link to="/login">{t('auth:backToLogin')}</Link></p>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <>
        <AuthStepper current={2} kind="recovery" />
        <AuthHeading title={t('auth:redesign.verify.title')} icon={<Mail />}>
          <Trans i18nKey="auth:reset.codeSubtitle" values={{ email }} components={{ b: <strong className="rd-email-value" /> }} />
        </AuthHeading>
        <form className="rd-login-fields rd-auth-fields" onSubmit={handleVerifyCode} noValidate aria-busy={isCodeLoading}>
          <p className="rd-code-label">{t('auth:verify.otpAria')}</p>
          <OtpInput
            className="rd-auth-otp"
            length={6}
            value={code}
            onChange={v => { setCode(v); setCodeError(''); }}
            error={!!codeError}
            disabled={isCodeLoading}
            aria-label={t('auth:verify.otpAria')}
            aria-describedby={codeError ? 'reset-code-error' : undefined}
          />
          {codeError && <p id="reset-code-error" className="rd-form-error" role="alert">{codeError}</p>}
          <Button type="submit" isLoading={isCodeLoading} disabled={!CODE_COMPLETE.test(code)} size="lg" className="rd-button rd-login-submit">
            {isCodeLoading ? t('auth:reset.codeSubmitting') : t('auth:reset.codeSubmit')}
            {!isCodeLoading && <ArrowRight size={20} aria-hidden="true" />}
          </Button>
        </form>
        <div className="rd-auth-actions">
          {resendCountdown > 0 ? (
            <p className="rd-resend-countdown">{t('auth:verify.resendIn', { seconds: resendCountdown })}</p>
          ) : (
            <button type="button" onClick={handleResend} disabled={isCodeLoading} className="rd-text-link">{t('auth:verify.resend')}</button>
          )}
          {resendMessage && <p className="rd-auth-feedback" role="status">{resendMessage}</p>}
          <p className="rd-auth-hint">{t('auth:redesign.checkSpam')}</p>
          <Link to="/forgot-password" className="rd-text-link">{t('auth:redesign.changeEmail')}</Link>
        </div>
        <p className="rd-login-switch"><Link to="/login">{t('auth:backToLogin')}</Link></p>
      </>
    );
  }

  return (
    <>
      <AuthStepper current={3} kind="recovery" />
      <AuthHeading title={t('auth:redesign.recovery.passwordTitle')} icon={<KeyRound />}>
        {t('auth:redesign.passwordHint')}
      </AuthHeading>
      <div className="rd-auth-address"><Mail size={18} aria-hidden="true" /><span>{email}</span></div>
      <form className="rd-login-fields rd-auth-fields" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
        <div className="rd-auth-password">
          <PasswordInput
            label={t('auth:reset.newLabel')}
            name="password"
            placeholder={t('auth:redesign.newPasswordPlaceholder')}
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
            error={passwordError}
            autoComplete="new-password"
            disabled={isLoading}
            autoFocus
            required
          />
          {!passwordError && <PasswordStrengthMeter password={password} className="rd-password-strength" />}
        </div>
        <div className="rd-login-password">
          <PasswordInput
            label={t('auth:reset.confirmLabel')}
            name="confirm-password"
            placeholder={t('auth:redesign.confirmPlaceholder')}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
            error={confirmError}
            autoComplete="new-password"
            disabled={isLoading}
            required
          />
        </div>
        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        <Button type="submit" isLoading={isLoading} size="lg" className="rd-button rd-login-submit">
          {isLoading ? t('auth:reset.submitting') : t('auth:reset.submit')}
          {!isLoading && <ArrowRight size={20} aria-hidden="true" />}
        </Button>
      </form>
      <p className="rd-login-switch"><Link to="/login">{t('auth:backToLogin')}</Link></p>
    </>
  );
}
