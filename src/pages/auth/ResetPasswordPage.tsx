import { useState } from 'react';
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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  function validatePassword(): boolean {
    let valid = true;
    const pwdErr = (() => {
      if (password.length < 8) return 'Минимум 8 символов';
      if (!/[A-Za-z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву';
      if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
      return '';
    })();
    if (pwdErr) {
      setPasswordError(pwdErr);
      valid = false;
    } else {
      setPasswordError('');
    }
    if (password !== confirm) {
      setConfirmError('Пароли не совпадают');
      valid = false;
    } else {
      setConfirmError('');
    }
    return valid;
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!CODE_COMPLETE.test(code)) {
      setCodeError('Введите 6-значный код');
      return;
    }
    setCodeError('');
    setIsCodeLoading(true);
    try {
      await authApi.verifyResetCode(email!, code.trim());
      setStep('password');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setCodeError('Слишком много попыток. Подождите и попробуйте снова');
      } else {
        setCodeError('Неверный или истёкший код');
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
        setFormError('Слишком много попыток. Подождите и попробуйте снова');
      } else {
        // Код прошёл проверку на шаге 1, но успел истечь (>15 минут) или был
        // погашен параллельной попыткой — возвращаем на ввод кода, а не
        // показываем ошибку в форме пароля, где пользователь её не ждёт.
        setStep('code');
        setCodeError('Код истёк. Запросите новый и попробуйте снова');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResendMessage('');
    setResendDisabled(true);
    try {
      await authApi.forgotPassword(email);
      setResendMessage('Новый код отправлен на почту');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setResendMessage('Подождите перед повторной отправкой');
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setResendMessage('Аккаунт с таким email не найден');
      } else {
        setResendMessage('Не удалось отправить код. Попробуйте позже');
      }
    } finally {
      setTimeout(() => setResendDisabled(false), RESEND_SECONDS * 1000);
    }
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <XCircle size={40} className="text-danger" />
        <h1 className="auth-headline-sm">Что-то пошло не так</h1>
        <p className="text-body text-secondary">
          Запросите код для сброса пароля заново.
        </p>
        <Link
          to="/forgot-password"
          className="mt-1 inline-flex items-center justify-center w-full min-h-12 px-6 bg-brand text-on-brand font-medium text-label rounded-[var(--radius)] hover:bg-brand-hover transition-colors press-scale"
        >
          Запросить код заново
        </Link>
        <Link to="/login" className="text-caption text-muted hover:opacity-70 transition-opacity">
          ← Вернуться ко входу
        </Link>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <>
        <h1 className="auth-headline-sm mt-[20px]">Введите код</h1>
        <p className="auth-sub">
          Код отправлен на <span className="font-semibold text-primary">{email}</span>.
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
              aria-label="Код из письма"
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
            {isCodeLoading ? 'Проверяем...' : 'Подтвердить код'}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-1 mt-[24px]">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendDisabled}
            className="font-mono text-mono-xs tracking-label uppercase text-brand hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Отправить код повторно
          </button>
          {resendMessage && (
            <p className="text-small text-secondary text-center">{resendMessage}</p>
          )}
          <Link
            to="/login"
            className="text-caption text-muted hover:opacity-70 transition-opacity mt-2"
          >
            ← Вернуться ко входу
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="auth-headline-sm mt-[20px]">Новый пароль</h1>
      <p className="auth-sub">Придумайте новый пароль для входа.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[32px] relative">
          <Input
            label="Новый пароль"
            className="pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
            error={passwordError}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-0 bottom-[11px] text-muted hover:text-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {!passwordError && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="mt-[24px] relative">
          <Input
            label="Повторите пароль"
            className="pr-10"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
            error={confirmError}
            autoComplete="new-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-0 bottom-[11px] text-muted hover:text-secondary transition-colors"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[28px]">
          {isLoading ? 'Сохраняем...' : 'Сохранить пароль'}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-1 mt-[24px]">
        {resendMessage && (
          <p className="text-small text-secondary text-center">{resendMessage}</p>
        )}
        <Link
          to="/login"
          className="text-caption text-muted hover:opacity-70 transition-opacity mt-2"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </>
  );
}
