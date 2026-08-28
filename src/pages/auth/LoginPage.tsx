import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

function validatePassword(password: string): string {
  return password.length >= 6 ? '' : 'Минимум 6 символов';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
      const from = (location.state as { from?: string })?.from;
      // /welcome no longer doubles as the "just authenticated" landing spot
      // (it now only shows once, right before a user's first assessment —
      // see useGoalSelection) — RequireProfile at /results decides from here
      // whether onboarding is still needed.
      navigate(from ?? '/results', { replace: true });
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
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setResendDone(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-card-title">Вход</h1>
      {/* Дублирует мысль левой колонки — она нужна на телефоне, где колонка скрыта. */}
      <p className="auth-card-sub">Продолжим с того места, где остановились.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[28px]">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            error={emailError}
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="mt-[24px]">
          <Input
            ref={passwordRef}
            label="Пароль"
            className="pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
            error={passwordError}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="text-muted hover:text-secondary transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        {needsVerification && (
          <div className="rounded-[var(--radius)] border border-default bg-raised p-4 flex flex-col gap-3 mt-[16px]">
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
              <Button
                type="button"
                onClick={handleResendVerification}
                isLoading={resendLoading}
                className="w-full"
                size="sm"
              >
                {resendLoading ? 'Отправляем...' : 'Выслать код подтверждения'}
              </Button>
            )}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[34px]">
          {isLoading ? 'Входим...' : 'Войти'}
        </Button>

        <div className="flex items-center justify-between mt-[20px] text-body-sm">
          <Link
            to="/forgot-password"
            className="text-muted underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Забыли пароль?
          </Link>
          <Link
            to="/register"
            className="text-brand underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Создать аккаунт
          </Link>
        </div>
      </form>
    </>
  );
}
