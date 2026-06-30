import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';

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
      const from = (location.state as { from?: string })?.from ?? '/welcome';
      navigate(from, { replace: true });
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
      <h1 className="text-h1 font-black text-primary mb-6">Вход</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <input
            className={cn(
              'w-full h-12 px-4 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
              emailError ? 'border-danger' : 'border-default',
            )}
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError && <p className="text-small text-danger mt-1 px-1">{emailError}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              ref={passwordRef}
              className={cn(
                'w-full h-12 px-4 pr-12 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
                passwordError ? 'border-danger' : 'border-default',
              )}
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
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
            'w-full h-12 bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button transition-opacity mt-1',
            isLoading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isLoading ? 'Входим...' : 'Войти'}
        </button>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-caption text-brand font-semibold hover:text-brand-hover transition-colors"
          >
            Забыли пароль?
          </Link>
        </div>
      </form>

      <p className="text-caption text-center text-secondary mt-5">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-brand font-extrabold hover:text-brand-hover transition-colors">
          Зарегистрироваться
        </Link>
      </p>
    </>
  );
}
