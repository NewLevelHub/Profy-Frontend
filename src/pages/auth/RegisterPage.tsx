import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { Input } from '@/shared/ui/Input';

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

function validatePassword(password: string): string {
  if (password.length < 8) return 'Минимум 8 символов';
  if (!/[A-Za-z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву';
  if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  return '';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const storeLogin = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.register(email.trim(), password);
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setPassword('');
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message: string = err.response?.data?.detail ?? err.response?.data?.message ?? '';
        if (status === 409 || (status === 400 && message.toLowerCase().includes('already'))) {
          setEmailError('Этот email уже зарегистрирован');
        } else {
          setFormError('Ошибка регистрации. Попробуйте позже');
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

  async function handleGoogleCredential(idToken: string) {
    setFormError('');
    setGoogleSubmitting(true);
    try {
      const { access_token, user } = await authApi.googleLogin(idToken);
      storeLogin(access_token, user);
      navigate('/results', { replace: true });
    } catch {
      setFormError('Не удалось зарегистрироваться через Google. Попробуйте ещё раз');
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="auth-card-title">Создать аккаунт</h1>
      <p className="auth-card-sub">Займёт меньше минуты — профиль настроим на следующем шаге.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[28px]">
          <Input
            label="Электронная почта"
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
            autoComplete="new-password"
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

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[34px]">
          {isLoading ? 'Регистрируемся...' : 'Зарегистрироваться'}
        </Button>

        {env.GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 mt-[24px]">
              <div className="h-px flex-1 bg-[var(--hairline)]" />
              <span className="text-body-sm text-muted">или</span>
              <div className="h-px flex-1 bg-[var(--hairline)]" />
            </div>

            <div className="mt-[16px]">
              <GoogleSignInButton
                text="signup_with"
                disabled={isLoading || googleSubmitting}
                onCredential={handleGoogleCredential}
              />
            </div>
          </>
        )}

        <div className="text-center mt-[20px] text-body-sm">
          <span className="text-muted">Уже есть аккаунт? </span>
          <Link to="/login" className="text-brand underline underline-offset-2 hover:opacity-70 transition-opacity">
            Войти
          </Link>
        </div>
      </form>
    </>
  );
}
