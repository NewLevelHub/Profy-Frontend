import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/admin';
import { apiErrorCode } from '@/shared/api/client';
import { useLocaleStore } from '@/shared/store/locale';
import type { AdminStaffRole } from '@/shared/types';
import { invitationErrorMessage } from '../utils/invitationErrorMessage';
import { ADMIN_INVITATIONS_KEY } from './useAdminInvitations';

export type EmailLocale = 'ru' | 'kk';

/** Server errors about the address itself — shown under the email field. */
const EMAIL_ERROR_CODES = ['invitation_email_undeliverable', 'user_exists', 'invitation_pending'];

/** "Пригласить сотрудника" form: fresh on every open, shows the sent
 *  invitation and its link once created. */
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
    onError: (error) => {
      if (EMAIL_ERROR_CODES.includes(apiErrorCode(error) ?? '')) setEmailError(invitationErrorMessage(error, t));
    },
  });
  const isEmailError = EMAIL_ERROR_CODES.includes(apiErrorCode(create.error) ?? '');
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
    if (isEmailError) create.reset();
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
    submitError: create.error && !isEmailError ? invitationErrorMessage(create.error, t) : '',
    isSubmitting: create.isPending,
    sent: create.data ?? null,
    setEmail,
    setRole,
    setLocale,
    handleSubmit,
  };
}
