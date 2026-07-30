import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import type { LoginState } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';
import { useTypedLocationState } from '@/shared/hooks/useTypedLocationState';

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

function validatePassword(password: string): string {
  return password.length >= 6 ? '' : 'Минимум 6 символов';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { from } = useTypedLocationState<LoginState>();
  const storeLogin = useAuthStore(s => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormError('');
    setNeedsVerification(false);
    setResendDone(false);
    setIsLoading(true);
    try {
      const { access_token, user } = await authApi.login(email.trim(), password);
      storeLogin(access_token, user);
      navigate(from ?? ROUTES.welcome, { replace: true });
    } catch (err) {
      setPassword('');
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setFormError('Неверный email или пароль');
          setTimeout(() => passwordRef.current?.focus(), 0);
        } else if (status === 403) {
          setNeedsVerification(true);
        } else {
          setFormError('Ошибка. Попробуйте позже');
          setTimeout(() => passwordRef.current?.focus(), 0);
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
        setTimeout(() => passwordRef.current?.focus(), 0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    setResendLoading(true);
    try {
      await authApi.resendVerification(email.trim());
      navigate(`${ROUTES.verifyEmail}?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setResendDone(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <h2 className="font-black text-primary mb-1.5 tracking-[-0.01em]" style={{ fontSize: 30 }}>Вход</h2>
      <p className="text-muted font-semibold mb-[26px]" style={{ fontSize: 14 }}>С возвращением! Продолжим путь 🎯</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label className="block font-extrabold text-secondary mb-[7px]" style={{ fontSize: 13 }}>
            Электронная почта
          </label>
          <input
            className={cn(
              'w-full h-[52px] px-4 text-primary font-semibold placeholder:text-placeholder focus:outline-none transition-colors',
              emailError ? 'border-danger' : 'border-default focus:border-brand',
            )}
            style={{ border: '1.5px solid', borderRadius: 14, background: 'var(--bg-page)', fontSize: 15 }}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError && <p className="text-small text-danger mt-1 px-1">{emailError}</p>}
        </div>

        <div>
          <label className="block font-extrabold text-secondary mb-[7px]" style={{ fontSize: 13 }}>
            Пароль
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              className={cn(
                'w-full h-[52px] pl-4 pr-12 text-primary font-semibold placeholder:text-placeholder focus:outline-none transition-colors',
                passwordError ? 'border-danger' : 'border-default focus:border-brand',
              )}
              style={{ border: '1.5px solid', borderRadius: 14, background: 'var(--bg-page)', fontSize: 15 }}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
              autoComplete="current-password"
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

        {formError && <p className="text-caption text-danger text-center">{formError}</p>}

        {needsVerification && (
          <div className="rounded-xl border border-default bg-raised p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-caption font-semibold text-primary">Email не подтверждён</p>
                <p className="text-small text-secondary mt-0.5">
                  Отправим код подтверждения на{' '}
                  <span className="font-semibold text-primary">{email}</span>
                </p>
              </div>
            </div>
            {resendDone ? (
              <p className="text-small text-danger text-center">Не удалось отправить код. Попробуйте позже</p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={cn(
                  'w-full h-10 bg-brand text-on-brand font-semibold text-caption rounded-[10px] transition-opacity',
                  resendLoading && 'opacity-60 cursor-not-allowed',
                )}
              >
                {resendLoading ? 'Отправляем...' : 'Выслать код подтверждения'}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full h-[54px] text-on-brand font-extrabold rounded-pill border-none transition-opacity mt-1',
            isLoading && 'opacity-60 cursor-not-allowed',
          )}
          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', fontSize: 17, boxShadow: '0 8px 18px rgba(124,58,237,.32)' }}
        >
          {isLoading ? 'Входим...' : 'Войти'}
        </button>

        <div className="text-center mt-1">
          <Link
            to={ROUTES.forgotPassword}
            className="font-extrabold text-brand hover:text-brand-hover transition-colors"
            style={{ fontSize: 14 }}
          >
            Забыли пароль?
          </Link>
        </div>
      </form>

      <p className="text-center text-muted font-semibold mt-5 pt-[18px] border-t border-default" style={{ fontSize: 14 }}>
        Нет аккаунта?{' '}
        <Link to={ROUTES.register} className="text-brand font-extrabold hover:text-brand-hover transition-colors">
          Зарегистрироваться
        </Link>
      </p>
    </>
  );
}
