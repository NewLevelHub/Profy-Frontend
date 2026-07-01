import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <>
      <h1 className="text-h1 font-black text-primary mb-6">Регистрация</h1>

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

        {formError && <p className="text-caption text-danger text-center">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full h-12 bg-brand font-extrabold text-label rounded-pill shadow-button transition-opacity mt-1',
            isLoading && 'opacity-60 cursor-not-allowed',
          )}
          style={{ color: '#FFFFFF' }}
        >
          {isLoading ? 'Регистрируемся...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-caption text-center text-secondary mt-5">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-brand font-extrabold hover:text-brand-hover transition-colors">
          Войти
        </Link>
      </p>
    </>
  );
}
