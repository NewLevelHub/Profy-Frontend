import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { authApi } from '@/shared/api/auth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

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
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
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
      <h1 className="auth-headline-sm mt-[20px]">Пришлём код на почту</h1>
      <p className="auth-sub">
        Введите почту — отправим 6-значный код для создания нового пароля.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[32px]">
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

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[28px]">
          {isLoading ? 'Отправляем...' : 'Отправить код'}
        </Button>
      </form>

      <p className="text-caption text-muted mt-[16px]">
        Код действует 30 минут. Прогресс ребёнка и результаты диагностики при смене пароля не теряются.
      </p>

      <div className="text-center mt-[20px]">
        <Link
          to="/login"
          className="text-caption text-muted hover:opacity-70 transition-opacity"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </>
  );
}
