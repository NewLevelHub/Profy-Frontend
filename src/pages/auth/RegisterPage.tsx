import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { passwordRuleErrorKey } from '@/shared/lib/passwordRules';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';
import { PasswordInput } from '@/shared/ui/redesign/PasswordInput';
import { authApi } from '@/shared/api/auth';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth';
import { AuthStepper } from '@/shared/ui/AuthStepper';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { Input } from '@/shared/ui/Input';
import { PasswordStrengthMeter } from '@/shared/ui/PasswordStrengthMeter';

// Validators return an i18n key (or '') — the component resolves it with t().
function validateEmailKey(email: string): string {
  return email.includes('@') ? '' : 'validation.emailInvalid';
}

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const storeLogin = useAuthStore(s => s.login);
  const tErr = (key: string) => (key ? t(key) : '');

  // Шаги 1 и 2 живут здесь, третий — на /verify-email: там уже реализован ввод
  // кода, повторная отправка и обратный отсчёт.
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleEmailStep(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmailKey(email);
    setEmailError(tErr(eErr));
    if (eErr) return;
    setFormError('');
    setStep('password');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pErr = passwordRuleErrorKey(password);
    setPasswordError(tErr(pErr));
    const cErr = password !== confirm ? 'validation.passwordsMismatch' : '';
    setConfirmError(tErr(cErr));
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
          setEmailError(t('error.emailTaken'));
        } else {
          setFormError(t('error.registerGeneric'));
          setTimeout(() => passwordRef.current?.focus(), 0);
        }
      } else {
        setFormError(t('error.generic'));
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
      setFormError(t('error.googleSignUpFailed'));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  const busy = isLoading || googleSubmitting;
  const loginLink = (
    <p className="rd-login-switch">
      {t('register.haveAccount')} <Link to="/login">{t('register.signIn')}</Link>
    </p>
  );

  if (step === 'email') {
    return (
      <>
        <AuthStepper current={1} />
        <AuthHeading title={t('redesign.register.title')}>
          {t('redesign.register.subtitle')}
        </AuthHeading>
        <form className="rd-login-fields rd-auth-fields" onSubmit={handleEmailStep} noValidate aria-busy={busy}>
          <Input
            label={t('field.emailLong')}
            type="email"
            name="email"
            placeholder={t('redesign.emailPlaceholder')}
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            error={emailError}
            hint={t('redesign.register.emailHint')}
            autoCapitalize="none"
            autoComplete="email"
            disabled={busy}
            required
          />
          <Button type="submit" disabled={busy} size="lg" className="rd-button rd-login-submit">
            {t('redesign.continue')}<ArrowRight size={20} aria-hidden="true" />
          </Button>
          {env.GOOGLE_CLIENT_ID && (
            <>
              <div className="rd-login-divider"><span>{t('divider')}</span></div>
              <GoogleSignInButton text="signup_with" disabled={busy} onCredential={handleGoogleCredential} />
            </>
          )}
          {formError && <p className="rd-form-error" role="alert">{formError}</p>}
          {loginLink}
        </form>
      </>
    );
  }

  return (
    <>
      <AuthStepper current={2} />
      <AuthHeading title={t('redesign.register.passwordTitle')}>
        {t('redesign.passwordHint')}
      </AuthHeading>
      <div className="rd-auth-address">
        <Mail size={18} aria-hidden="true" /><span>{email.trim()}</span>
        <button type="button" disabled={busy} className="rd-text-link" onClick={() => { setStep('email'); setFormError(''); }}>
          {t('redesign.change')}
        </button>
      </div>
      <form className="rd-login-fields rd-auth-fields" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        <div className="rd-auth-password">
          <PasswordInput
            ref={passwordRef}
            label={t('field.password')}
            name="password"
            placeholder={t('redesign.newPasswordPlaceholder')}
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
            error={passwordError}
            autoComplete="new-password"
            disabled={busy}
            required
            autoFocus
          />
          {!passwordError && <PasswordStrengthMeter password={password} className="rd-password-strength" />}
        </div>
        <div className="rd-login-password">
          <PasswordInput
            label={t('field.passwordRepeat')}
            name="confirm-password"
            placeholder={t('redesign.confirmPlaceholder')}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
            error={confirmError}
            autoComplete="new-password"
            disabled={busy}
            required
          />
        </div>
        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        <Button type="submit" isLoading={isLoading} disabled={googleSubmitting} size="lg" className="rd-button rd-login-submit">
          {isLoading ? t('register.submitCreating') : t('register.submitCreate')}
          {!isLoading && <ArrowRight size={20} aria-hidden="true" />}
        </Button>
        <div className="rd-auth-actions">
          <button type="button" disabled={busy} className="rd-text-link" onClick={() => { setStep('email'); setFormError(''); }}>
            <ArrowLeft size={16} aria-hidden="true" />{t('redesign.changeEmail')}
          </button>
        </div>
        {loginLink}
      </form>
    </>
  );
}
