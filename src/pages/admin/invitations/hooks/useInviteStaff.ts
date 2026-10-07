import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/admin';
import { useLocaleStore } from '@/shared/store/locale';
import type { AdminStaffRole } from '@/shared/types';
import { invitationErrorMessage } from '../utils/invitationErrorMessage';
import { ADMIN_INVITATIONS_KEY } from './useAdminInvitations';

type EmailLocale = 'ru' | 'kk';

/** "Пригласить сотрудника" form: fresh on every open, shows the sent
 *  invitation (with its one-time link) once created. */
export function useInviteStaff(isOpen: boolean) {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const uiLocale = useLocaleStore((s) => s.locale);

  const [email, setEmailValue] = useState('');
  const [role, setRole] = useState<AdminStaffRole>('psychologist');
  const [locale, setLocale] = useState<EmailLocale>(uiLocale);
  const [emailError, setEmailError] = useState('');

  const create = useMutation({
    mutationFn: adminApi.createInvitation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ADMIN_INVITATIONS_KEY }),
  });
  const { reset } = create;

  useEffect(() => {
    if (!isOpen) return;
    setEmailValue('');
    setRole('psychologist');
    setLocale(uiLocale);
    setEmailError('');
    reset();
    // Only on open — the admin may switch the UI language while the form is up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset]);

  function setEmail(value: string) {
    setEmailValue(value);
    setEmailError('');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/\S+@\S+\.\S+/.test(trimmed)) return setEmailError(t('invitations.errors.email'));
    create.mutate({ email: trimmed, role, locale });
  }

  return {
    email,
    role,
    locale,
    emailError,
    submitError: create.error ? invitationErrorMessage(create.error, t) : '',
    isSubmitting: create.isPending,
    sent: create.data ?? null,
    setEmail,
    setRole,
    setLocale,
    handleSubmit,
  };
}
