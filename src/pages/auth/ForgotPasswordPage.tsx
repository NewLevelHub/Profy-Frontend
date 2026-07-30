import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { ROUTES } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      navigate(`${ROUTES.resetPassword}?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setFormError('Слишком много запросов. Попробуйте позже');
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-h1 font-black text-primary mb-2">Сброс пароля</h1>
      <p className="text-caption text-secondary mb-6">
        Введите почту — мы отправим 6-значный код для создания нового пароля
      </p>

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
            autoFocus
          />
          {emailError && <p className="text-small text-danger mt-1 px-1">{emailError}</p>}
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
          {isLoading ? 'Отправляем...' : 'Отправить код'}
        </button>
      </form>

      <div className="text-center mt-5">
        <Link
          to={ROUTES.login}
          className="text-caption text-muted hover:text-secondary transition-colors"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </>
  );
}
