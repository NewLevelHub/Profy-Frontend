import { useState, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, Mail } from 'lucide-react';
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

  return (
    <>
      <h1 className="auth-card-title">{t('auth:login.title')}</h1>
      {/* Дублирует мысль левой колонки — она нужна на телефоне, где колонка скрыта. */}
      <p className="auth-card-sub">{t('auth:login.subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-[28px]">
          <Input
            label={t('auth:field.email')}
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
            label={t('auth:field.password')}
            className="pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
            error={passwordError}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="text-muted hover:text-secondary transition-colors"
                aria-label={t(showPassword ? 'auth:field.hidePassword' : 'auth:field.showPassword')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        {formError && (
          <p className="field-error-in text-body-sm text-danger text-center mt-[16px]">{formError}</p>
        )}

        {needsVerification && (
          <div className="rounded-[var(--radius)] border border-default bg-raised p-4 flex flex-col gap-3 mt-[16px]">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-caption font-semibold text-primary">{t('auth:verifyBanner.title')}</p>
                <p className="text-small text-secondary mt-0.5">
                  <Trans
                    i18nKey="auth:verifyBanner.body"
                    values={{ email }}
                    components={{ b: <span className="font-semibold text-primary" /> }}
                  />
                </p>
              </div>
            </div>
            {resendDone ? (
              <p className="text-small text-danger text-center">{t('auth:verifyBanner.failed')}</p>
            ) : (
              <Button
                type="button"
                onClick={handleResendVerification}
                isLoading={resendLoading}
                className="w-full"
                size="sm"
              >
                {resendLoading ? t('auth:verifyBanner.resending') : t('auth:verifyBanner.resend')}
              </Button>
            )}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-[34px]">
          {isLoading ? t('auth:login.submitting') : t('auth:login.submit')}
        </Button>

        {env.GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 mt-[24px]">
              <div className="h-px flex-1 bg-[var(--hairline)]" />
              <span className="text-body-sm text-muted">{t('auth:divider')}</span>
              <div className="h-px flex-1 bg-[var(--hairline)]" />
            </div>

            <div className="mt-[16px]">
              <GoogleSignInButton
                text="signin_with"
                disabled={isLoading || googleSubmitting}
                onCredential={handleGoogleCredential}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between mt-[20px] text-body-sm">
          <Link
            to="/forgot-password"
            className="text-muted underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {t('auth:login.forgotPassword')}
          </Link>
          <Link
            to="/register"
            className="text-brand underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {t('auth:login.createAccount')}
          </Link>
        </div>
      </form>
    </>
  );
}
