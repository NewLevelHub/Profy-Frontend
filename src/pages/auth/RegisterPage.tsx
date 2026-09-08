import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth';
import { AuthStepper } from '@/shared/ui/AuthStepper';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { Input } from '@/shared/ui/Input';
import { PasswordStrengthMeter } from '@/shared/ui/PasswordStrengthMeter';

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

  // Шаги 1 и 2 живут здесь, третий — на /verify-email: там уже реализован ввод
  // кода, повторная отправка и обратный отсчёт.
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleEmailStep(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;
    setFormError('');
    setStep('password');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pErr = validatePassword(password);
    setPasswordError(pErr);
    const cErr = password !== confirm ? 'Пароли не совпадают' : '';
    setConfirmError(cErr);
    if (pErr || cErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.register(email.trim(), password);
      // Аккаунт уже создан — возвращаться к форме регистрации незачем.
      // Без replace «назад» с экрана кода показывал форму заново (и
      // только потом RequireGuest уводил дальше), что читалось как
      // «регистрация не прошла».
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}&step=3`, { replace: true });
    } catch (err) {
      setPassword('');
      setConfirm('');
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message: string = err.response?.data?.detail ?? err.response?.data?.message ?? '';
        if (status === 409 || (status === 400 && message.toLowerCase().includes('already'))) {
          // Занятость почты выясняется только здесь: отдельной проверки на
          // бэкенде нет. Возвращаем на первый шаг — ошибка про почту на экране
          // пароля стояла бы там, где её никто не ждёт, и исправить её было бы
          // негде.
          setStep('email');
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

  const loginLink = (
    <div className="text-center mt-[20px] text-body-sm">
      <span className="text-muted">Уже есть аккаунт? </span>
      <Link to="/login" className="text-brand underline underline-offset-2 hover:opacity-70 transition-opacity">
        Войти
      </Link>
    </div>
  );

  if (step === 'email') {
    return (
      <>
        <AuthStepper current={1} />
        <h1 className="auth-card-title">Почта</h1>
        <p className="auth-card-sub">На неё придёт код подтверждения.</p>

        <form onSubmit={handleEmailStep} noValidate>
          <div className="mt-[26px]">
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

          <Button type="submit" size="lg" className="w-full mt-[32px]">
            Далее
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
                  disabled={googleSubmitting}
                  onCredential={handleGoogleCredential}
                />
              </div>
            </>
          )}

          {formError && (
            <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
          )}

          {loginLink}
        </form>
      </>
    );
  }

  return (
    <>
      <AuthStepper current={2} />
      <h1 className="auth-card-title">Пароль</h1>
      <p className="auth-card-sub">Минимум 8 символов, буква и цифра.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[26px]">
          <Input
            ref={passwordRef}
            label="Пароль"
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
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          {!passwordError && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="mt-[24px]">
          <Input
            label="Повторите пароль"
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
                aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        <div className="flex items-center gap-4 mt-[30px]">
          <button
            type="button"
            onClick={() => { setStep('email'); setFormError(''); }}
            className="text-body-sm text-muted underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Назад
          </button>
          <Button type="submit" isLoading={isLoading} size="lg" className="flex-1">
            {isLoading ? 'Создаём...' : 'Создать аккаунт'}
          </Button>
        </div>

        {loginLink}
      </form>
    </>
  );
}
