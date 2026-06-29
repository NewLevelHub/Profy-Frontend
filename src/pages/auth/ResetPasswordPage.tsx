import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { authApi } from '@/shared/api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (password.length < 6) {
      setPasswordError('Минимум 6 символов');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (password !== confirm) {
      setConfirmError('Пароли не совпадают');
      valid = false;
    } else {
      setConfirmError('');
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(token!, password);
      navigate('/login', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) {
          setFormError('Слишком много попыток. Подождите и попробуйте снова');
        } else {
          setFormError('Ссылка недействительна или срок действия истёк');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <XCircle size={40} className="text-danger" />
        <h1 className="text-h1 font-black text-primary">Ссылка недействительна</h1>
        <p className="text-body text-secondary">
          Ссылка для сброса пароля не найдена. Запросите новую ссылку.
        </p>
        <Link
          to="/forgot-password"
          className="mt-1 inline-block w-full text-center h-12 leading-[3rem] bg-brand text-on-brand font-extrabold text-label rounded-pill shadow-button"
        >
          Запросить ссылку заново
        </Link>
        <Link to="/login" className="text-caption text-muted hover:text-secondary transition-colors">
          ← Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-h1 font-black text-primary mb-2">Новый пароль</h1>
      <p className="text-caption text-secondary mb-6">
        Придумайте новый пароль для вашего аккаунта
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <div className="relative">
            <input
              className={cn(
                'w-full h-12 px-4 pr-12 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
                passwordError ? 'border-danger' : 'border-default',
              )}
              type={showPassword ? 'text' : 'password'}
              placeholder="Новый пароль"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); setConfirmError(''); }}
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

        <div>
          <div className="relative">
            <input
              className={cn(
                'w-full h-12 px-4 pr-12 rounded-[10px] bg-page border text-primary text-body font-semibold placeholder:text-placeholder focus:outline-none focus:border-brand ring-brand transition-colors',
                confirmError ? 'border-danger' : 'border-default',
              )}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setConfirmError(''); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {confirmError && <p className="text-small text-danger mt-1 px-1">{confirmError}</p>}
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
          {isLoading ? 'Сохраняем...' : 'Сохранить пароль'}
        </button>
      </form>

      <div className="text-center mt-5">
        <Link
          to="/forgot-password"
          className="text-caption text-muted hover:text-secondary transition-colors"
        >
          ← Запросить новую ссылку
        </Link>
      </div>
    </>
  );
}
