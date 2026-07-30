import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  function validate(): boolean {
    let valid = true;
    if (code.length !== 6) {
      setCodeError('Введите 6-значный код');
      valid = false;
    } else {
      setCodeError('');
    }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(email!, code.trim(), password);
      navigate(ROUTES.login, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setFormError('Слишком много попыток. Подождите и попробуйте снова');
        } else {
          setCodeError('Неверный или истёкший код');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
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
      } else {
        setResendMessage('Не удалось отправить код. Попробуйте позже');
      }
    } finally {
      setTimeout(() => setResendDisabled(false), 60_000);
    }
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <XCircle size={40} className="text-danger" />
        <h1 className="text-h1 font-black text-primary">Что-то пошло не так</h1>
        <p className="text-body text-secondary">
          Запросите код для сброса пароля заново.
        </p>
        <Link
          to={ROUTES.forgotPassword}
          className="mt-1 inline-block w-full text-center h-12 leading-[3rem] bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button"
        >
          Запросить код заново
        </Link>
        <Link to={ROUTES.login} className="text-caption text-muted hover:text-secondary transition-colors">
          ← Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-h1 font-black text-primary mb-2">Новый пароль</h1>
      <p className="text-caption text-secondary mb-6">
        Мы отправили 6-значный код на{' '}
        <span className="text-brand font-semibold">{email}</span>.
        {' '}Введите его и придумайте новый пароль.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <input
            className={cn(
              'w-full h-12 px-4 rounded-[10px] bg-page border text-primary text-body font-semibold tracking-[0.25em] text-center placeholder:text-placeholder placeholder:tracking-normal focus:outline-none focus:border-brand ring-brand transition-colors',
              codeError ? 'border-danger' : 'border-default',
            )}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              setCodeError('');
            }}
            autoComplete="one-time-code"
            autoFocus
          />
          {codeError && <p className="text-small text-danger mt-1 px-1">{codeError}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              className={cn(
                'w-full h-12 px-4 pr-12 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
                passwordError ? 'border-danger' : 'border-default',
              )}
              type={showPassword ? 'text' : 'password'}
              placeholder="Новый пароль"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && <p className="text-small text-danger mt-1 px-1">{passwordError}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              className={cn(
                'w-full h-12 px-4 pr-12 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
                confirmError ? 'border-danger' : 'border-default',
              )}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {confirmError && <p className="text-small text-danger mt-1 px-1">{confirmError}</p>}
        </div>

        {formError && <p className="text-caption text-danger text-center">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full h-12 bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button transition-opacity mt-1',
            isLoading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isLoading ? 'Сохраняем...' : 'Сохранить пароль'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-1 mt-5">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled}
          className={cn(
            'text-caption text-brand font-semibold hover:text-brand-hover transition-colors',
            resendDisabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          Отправить код повторно
        </button>
        {resendMessage && (
          <p className="text-small text-secondary text-center">{resendMessage}</p>
        )}
        <Link
          to={ROUTES.login}
          className="text-caption text-muted hover:text-secondary transition-colors mt-2"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </>
  );
}
