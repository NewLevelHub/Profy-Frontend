import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { authApi } from '@/shared/api/auth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

function validateEmailKey(email: string): string {
  return email.includes('@') ? '' : 'auth:validation.emailInvalid';
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmailKey(email);
    setEmailError(eErr ? t(eErr) : '');
    if (eErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setFormError(t('auth:error.tooManyRequests'));
      } else {
        setFormError(t('auth:error.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-headline-sm mt-[20px]">{t('auth:forgot.title')}</h1>
      <p className="auth-sub">{t('auth:forgot.subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[32px]">
          <Input
            label={t('auth:field.emailLong')}
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
          {isLoading ? t('auth:forgot.submitting') : t('auth:forgot.submit')}
        </Button>
      </form>

      <p className="text-caption text-muted mt-[16px]">{t('auth:forgot.note')}</p>

      <div className="text-center mt-[20px]">
        <Link
          to="/login"
          className="text-caption text-muted hover:opacity-70 transition-opacity"
        >
          {t('auth:backToLogin')}
        </Link>
      </div>
    </>
  );
}
