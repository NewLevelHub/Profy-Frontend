import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import { AuthStepper } from '@/shared/ui/AuthStepper';
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
      <AuthStepper current={1} kind="recovery" />
      <AuthHeading title={t('auth:redesign.recovery.title')} icon={<KeyRound />}>
        {t('auth:redesign.recovery.subtitle')}
      </AuthHeading>
      <form className="rd-login-fields rd-auth-fields" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
        <Input
          label={t('auth:field.emailLong')}
          type="email"
          name="email"
          placeholder={t('auth:redesign.emailPlaceholder')}
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
          error={emailError}
          autoCapitalize="none"
          autoComplete="email"
          disabled={isLoading}
          required
        />
        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        <Button type="submit" isLoading={isLoading} size="lg" className="rd-button rd-login-submit">
          {isLoading ? t('auth:forgot.submitting') : t('auth:forgot.submit')}
          {!isLoading && <ArrowRight size={20} aria-hidden="true" />}
        </Button>
      </form>
      <div className="rd-auth-callout"><ShieldCheck size={19} aria-hidden="true" /><p>{t('auth:redesign.recovery.note')}</p></div>
      <p className="rd-login-switch"><Link to="/login">{t('auth:redesign.recovery.remembered')}</Link></p>
    </>
  );
}
