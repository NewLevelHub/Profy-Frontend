import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, UserRound } from 'lucide-react';
import { authApi } from '@/shared/api/auth';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';

/** /staff/name — the one onboarding step of an invited specialist whose
 *  invitation had no name: the name is how the owner, the sales team (CRM)
 *  and students see them. PsychologistArea sends a nameless account here. */
export default function StaffNamePage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  if (user.full_name?.trim()) return <Navigate to={homePathForUser(user)} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) {
      setError(t('staffName.tooShort'));
      return;
    }
    setBusy(true);
    try {
      const updated = await authApi.updateName(value);
      // The role guards keep /auth/me cached and write it back to the store:
      // the cached copy must have the name too.
      queryClient.setQueryData(['auth', 'me'], updated);
      setUser(updated);
      navigate(homePathForUser(updated), { replace: true });
    } catch {
      setError(t('staffName.failed'));
      setBusy(false);
    }
  };

  return (
    <div className="rd-auth-state">
      <AuthHeading title={t('staffName.title')} icon={<UserRound />}>
        {t('staffName.body')}
      </AuthHeading>
      <form className="rd-login-fields" onSubmit={submit} noValidate aria-busy={busy}>
        <Input
          label={t('staffName.label')}
          name="name"
          placeholder={t('staffName.placeholder')}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoComplete="name"
          maxLength={255}
          disabled={busy}
          autoFocus
          required
        />
        <Button type="submit" size="lg" className="rd-button rd-login-submit" isLoading={busy}>
          {t('staffName.submit')}
          <ArrowRight size={20} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
