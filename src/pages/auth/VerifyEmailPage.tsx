import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';

// ─── Token mode (link from email) ────────────────────────────────────────────

type TokenStatus = 'loading' | 'success' | 'error';

function TokenVerify({ token }: { token: string }) {
  const navigate = useNavigate();
  const storeLogin = useAuthStore(s => s.login);
  const [status, setStatus] = useState<TokenStatus>('loading');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    authApi.verifyEmailByToken(token)
      .then(({ access_token, user }) => {
        storeLogin(access_token, user);
        setStatus('success');
        navigate('/welcome', { replace: true });
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <Loader2 size={40} className="text-brand animate-spin" />
        <p className="text-body font-semibold text-primary">Подтверждаем email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <CheckCircle size={40} className="text-success" />
        <p className="text-body font-semibold text-primary">Email подтверждён!</p>
        <p className="text-caption text-secondary">Перенаправляем вас...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <XCircle size={40} className="text-danger" />
      <h1 className="text-h1 font-black text-primary">Ссылка устарела</h1>
      <p className="text-body text-secondary">
        Ссылка недействительна или срок её действия истёк.
      </p>
      <Link
        to="/register"
        className="mt-1 inline-block w-full text-center h-12 leading-[3rem] bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button"
      >
        Зарегистрироваться заново
      </Link>
      <Link to="/login" className="text-caption text-muted hover:text-secondary transition-colors">
        ← Вернуться ко входу
      </Link>
    </div>
  );
}

// ─── OTP mode (code from email, after registration) ───────────────────────────

function OtpVerify({ email }: { email: string }) {
  const navigate = useNavigate();
  const storeLogin = useAuthStore(s => s.login);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setCodeError('Введите 6-значный код');
      return;
    }
    setCodeError('');
    setFormError('');
    setIsLoading(true);
    try {
      const { access_token, user } = await authApi.verifyEmailByCode(email, code.trim());
      storeLogin(access_token, user);
      navigate('/welcome', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setFormError('Слишком много попыток. Подождите и попробуйте снова');
        } else {
          setCodeError('Неверный или истёкший код');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setResendMessage('');
    setResendDisabled(true);
    try {
      await authApi.resendVerification(email);
      setResendMessage('Новый код отправлен на почту');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setResendMessage('Подождите 60 секунд перед повторной отправкой');
      } else {
        setResendMessage('Не удалось отправить код. Попробуйте позже');
      }
    } finally {
      setTimeout(() => setResendDisabled(false), 60_000);
    }
  }

  return (
    <>
      <h1 className="text-h1 font-black text-primary mb-2">Подтверждение почты</h1>
      <p className="text-caption text-secondary mb-6">
        Мы отправили 6-значный код на{' '}
        <span className="text-brand font-semibold">{email}</span>
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <input
            className={cn(
              'w-full h-12 px-4 rounded-[10px] bg-page border text-primary text-body font-semibold tracking-[0.25em] text-center placeholder:text-placeholder placeholder:tracking-normal focus:outline-none focus:border-brand ring-brand transition-colors',
              codeError ? 'border-danger' : 'border-default',
            )}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              setCodeError('');
            }}
            autoComplete="one-time-code"
            autoFocus
          />
          {codeError && <p className="text-small text-danger mt-1 px-1">{codeError}</p>}
        </div>

        {formError && <p className="text-caption text-danger text-center">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className={cn(
            'w-full h-12 bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button transition-opacity mt-1',
            (isLoading || code.length !== 6) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {isLoading ? 'Проверяем...' : 'Подтвердить'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-1 mt-5">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled}
          className={cn(
            'text-caption text-brand font-semibold hover:text-brand-hover transition-colors',
            resendDisabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          Отправить код повторно
        </button>
        {resendMessage && (
          <p className="text-small text-secondary text-center">{resendMessage}</p>
        )}
        <Link
          to="/login"
          className="text-caption text-muted hover:text-secondary transition-colors mt-2"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (token) return <TokenVerify token={token} />;

  if (email) return <OtpVerify email={email} />;

  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <XCircle size={40} className="text-danger" />
      <h1 className="text-h1 font-black text-primary">Ссылка недействительна</h1>
      <p className="text-body text-secondary">
        Проверьте письмо или зарегистрируйтесь заново.
      </p>
      <Link to="/login" className="text-caption text-brand font-semibold hover:text-brand-hover transition-colors">
        ← Вернуться ко входу
      </Link>
    </div>
  );
}
