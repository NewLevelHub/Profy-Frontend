import { useState, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { env } from '@/shared/config/env';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { resolveReturnTo } from '@/shared/lib/returnTo';
import { Button } from '@/shared/ui/Button';
import { GoogleSignInButton } from '@/shared/ui/GoogleSignInButton';
import { Input } from '@/shared/ui/Input';

function validateEmailKey(email: string): string {
  return email.includes('@') ? '' : 'auth:validation.emailInvalid';
}

function validatePasswordKey(password: string): string {
  return password.length >= 6 ? '' : 'auth:validation.passwordMin6';
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const storeLogin = useAuthStore(s => s.login);
  const tErr = (key: string) => (key ? t(key) : '');

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
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmailKey(email);
    const pErr = validatePasswordKey(password);
    setEmailError(tErr(eErr));
    setPasswordError(tErr(pErr));
    if (eErr || pErr) return;

    setFormError('');
    setNeedsVerification(false);
    setResendDone(false);
    setIsLoading(true);
    try {
      const { access_token, user } = await authApi.login(email.trim(), password);
      storeLogin(access_token, user);
      // Один и тот же разбор адреса назначения, что и в RequireGuest —
      // гварда перерисуется от нового токена и уведёт туда же, так что
      // неважно, кто из них сработает первым. Явный возврат важнее роли:
      // на него человек шёл осознанно, а домашний экран роли — это ответ
      // на «вести некуда».
      navigate(resolveReturnTo(location) ?? homePathForUser(user), { replace: true });
    } catch (err) {
      setPassword('');
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setFormError(t('auth:error.invalidCredentials'));
          setTimeout(() => passwordRef.current?.focus(), 0);
        } else if (status === 403) {
          const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
          if (typeof detail === 'object' && detail !== null && (detail as { detail?: string }).detail === 'google_account') {
            setFormError(t('auth:error.googleAccount'));
            setTimeout(() => passwordRef.current?.focus(), 0);
          } else {
            setNeedsVerification(true);
          }
        } else {
          setFormError(t('auth:error.generic'));
          setTimeout(() => passwordRef.current?.focus(), 0);
        }
      } else {
        setFormError(t('auth:error.generic'));
        setTimeout(() => passwordRef.current?.focus(), 0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setFormError('');
    setNeedsVerification(false);
    setResendDone(false);
    setGoogleSubmitting(true);
    try {
      const { access_token, user } = await authApi.googleLogin(idToken);
      storeLogin(access_token, user);
      navigate(resolveReturnTo(location) ?? homePathForUser(user), { replace: true });
    } catch {
      setFormError(t('auth:error.googleSignInFailed'));
    } finally {
      setGoogleSubmitting(false);
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

  const busy = isLoading || googleSubmitting;

  return (
    <>
      <p className="rd-eyebrow">{t('auth:redesign.welcome')}</p>
      <h1>{t('auth:redesign.title')}<span className="rd-orange" aria-hidden="true">.</span></h1>
      <p className="rd-login-intro">{t('auth:redesign.subtitle')}</p>

      <form className="rd-login-fields" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        <Input
          label={t('auth:field.emailLong')}
          type="email"
          name="email"
          placeholder={t('auth:redesign.emailPlaceholder')}
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
          error={emailError}
          autoCapitalize="none"
          autoComplete="username"
          disabled={busy}
          required
        />
        <div className="rd-login-password">
          <Input
            ref={passwordRef}
            label={t('auth:field.password')}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder={t('auth:redesign.passwordPlaceholder')}
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
            error={passwordError}
            autoComplete="current-password"
            disabled={busy}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="rd-password-toggle"
                aria-label={t(showPassword ? 'auth:field.hidePassword' : 'auth:field.showPassword')}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            }
          />
        </div>
        <div className="rd-login-help"><Link to="/forgot-password" className="rd-text-link">{t('auth:login.forgotPassword')}</Link></div>

        {formError && <p className="rd-form-error" role="alert">{formError}</p>}
        {needsVerification && (
          <div className="rd-verification" role="status">
            <Mail size={21} aria-hidden="true" />
            <div>
              <strong>{t('auth:verifyBanner.title')}</strong>
              <p><Trans i18nKey="auth:verifyBanner.body" values={{ email }} components={{ b: <strong /> }} /></p>
              {resendDone ? (
                <p className="rd-form-error" role="alert">{t('auth:verifyBanner.failed')}</p>
              ) : (
                <Button type="button" onClick={handleResendVerification} isLoading={resendLoading} size="sm" className="rd-button">
                  {resendLoading ? t('auth:verifyBanner.resending') : t('auth:verifyBanner.resend')}
                </Button>
              )}
            </div>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} disabled={googleSubmitting} size="lg" className="rd-button rd-login-submit">
          {isLoading ? t('auth:login.submitting') : t('auth:redesign.submit')}
          {!isLoading && <ArrowRight size={20} aria-hidden="true" />}
        </Button>

        {env.GOOGLE_CLIENT_ID && (
          <>
            <div className="rd-login-divider"><span>{t('auth:divider')}</span></div>
            <GoogleSignInButton text="signin_with" disabled={busy} onCredential={handleGoogleCredential} />
          </>
        )}
        <p className="rd-login-switch">{t('auth:redesign.newHere')} <Link to="/register">{t('auth:login.createAccount')}</Link></p>
      </form>
    </>
  );
}
