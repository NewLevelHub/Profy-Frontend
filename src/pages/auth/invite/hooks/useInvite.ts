import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { authApi } from '@/shared/api/auth';
import { apiErrorCode } from '@/shared/api/client';
import { homePathForUser } from '@/shared/lib/homePath';
import { passwordRuleErrorKey } from '@/shared/lib/passwordRules';
import { useAuthStore } from '@/shared/store/auth';
import { useLocaleStore } from '@/shared/store/locale';
import type { TokenResponse } from '@/shared/types';

/** Backend `error_code`s that end the flow — contract §2.3. */
const INVITATION_ERROR_CODES = [
  'invitation_invalid',
  'invitation_expired',
  'invitation_revoked',
  'invitation_used',
  'user_exists',
] as const;

type InvitationErrorCode = (typeof INVITATION_ERROR_CODES)[number];

/** Why the password form can't be shown. */
export type InviteBlocker = InvitationErrorCode | 'rate_limited' | 'load_failed' | 'signed_in';

function invitationErrorCode(err: unknown): InvitationErrorCode | null {
  const code = apiErrorCode(err);
  return (INVITATION_ERROR_CODES as readonly string[]).includes(code ?? '')
    ? (code as InvitationErrorCode)
    : null;
}

function isRateLimited(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 429;
}

export function useInvite() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const authToken = useAuthStore(s => s.token);
  const currentUser = useAuthStore(s => s.user);
  const storeLogin = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);
  const setLocale = useLocaleStore(s => s.setLocale);

  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirmValue] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [acceptBlocker, setAcceptBlocker] = useState<InviteBlocker | null>(null);
  // Set right before our own login, so the "already signed in" state doesn't
  // flash between storing the token and leaving the page.
  const isFinishingRef = useRef(false);

  const preview = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => authApi.getInvitation(token),
    enabled: Boolean(token) && !authToken,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const invitation = preview.data;

  // Open the page in the language the admin picked for the email — once per
  // invitation, the switcher in the header still wins afterwards.
  const appliedLocaleForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!invitation || appliedLocaleForRef.current === token) return;
    appliedLocaleForRef.current = token;
    setLocale(invitation.locale);
  }, [invitation, token, setLocale]);

  function finish({ access_token, user }: TokenResponse) {
    isFinishingRef.current = true;
    storeLogin(access_token, user);
    navigate(homePathForUser(user), { replace: true });
  }

  const accept = useMutation({
    mutationFn: (value: string) => authApi.acceptInvitation(token, value),
    onSuccess: finish,
    onError: err => {
      const code = invitationErrorCode(err);
      if (code) return setAcceptBlocker(code);
      setFormError(t(isRateLimited(err) ? 'auth:error.tooManyAttempts' : 'auth:error.generic'));
    },
  });

  const google = useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: response => {
      if (!invitation) return;
      // The backend accepts the invitation only for the invited address; any
      // other Google account just signs in as itself — don't keep that session.
      if (response.user.email !== invitation.email) {
        setFormError(
          t('auth:invite.googleMismatch', { googleEmail: response.user.email, email: invitation.email }),
        );
        return;
      }
      if (response.user.role !== invitation.role) return setAcceptBlocker('user_exists');
      finish(response);
    },
    onError: () => setFormError(t('auth:error.googleSignInFailed')),
  });

  function setPassword(value: string) {
    setPasswordValue(value);
    setPasswordError('');
    setConfirmError('');
  }

  function setConfirm(value: string) {
    setConfirmValue(value);
    setConfirmError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const passwordKey = passwordRuleErrorKey(password);
    const confirmKey = password !== confirm ? 'auth:validation.passwordsMismatch' : '';
    setPasswordError(passwordKey ? t(passwordKey) : '');
    setConfirmError(confirmKey ? t(confirmKey) : '');
    if (passwordKey || confirmKey) return;

    setFormError('');
    accept.mutate(password);
  }

  function handleGoogleCredential(idToken: string) {
    setFormError('');
    google.mutate(idToken);
  }

  function previewBlocker(): InviteBlocker | null {
    if (!preview.isError) return null;
    if (isRateLimited(preview.error)) return 'rate_limited';
    return invitationErrorCode(preview.error) ?? 'load_failed';
  }

  const blocker: InviteBlocker | null = !token
    ? 'invitation_invalid'
    : authToken && !isFinishingRef.current
      ? 'signed_in'
      : (acceptBlocker ?? previewBlocker());

  const view: 'loading' | 'blocked' | 'form' = blocker ? 'blocked' : invitation ? 'form' : 'loading';

  return {
    view,
    blocker,
    invitation,
    signedInEmail: currentUser?.email ?? '',
    homePath: homePathForUser(currentUser),
    password,
    confirm,
    passwordError,
    confirmError,
    formError,
    isSubmitting: accept.isPending,
    isGoogleSubmitting: google.isPending,
    setPassword,
    setConfirm,
    handleSubmit,
    handleGoogleCredential,
    retry: () => void preview.refetch(),
    signOut: logout,
  };
}
