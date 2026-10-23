import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Clock, UserPlus, XCircle } from 'lucide-react';
import { apiErrorCode } from '@/shared/api/client';
import { pendingStudentInvite, studentInviteApi } from '@/shared/api/studentInvite';
import { homePathForUser, isStaffUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { AuthHeading } from '@/shared/ui/redesign/AuthHeading';

type State = 'idle' | 'accepting' | 'done' | 'invalid' | 'failed';

function tokenFromHash(): string | null {
  const match = window.location.hash.match(/token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** /student-invite#token=… — the link the sales manager sends from the CRM
 *  (ТЗ §4.4). A guest signs up or signs in first; the token waits in storage
 *  and RequireStudent ties the account afterwards. A signed-in student is
 *  tied right here. Contract: backend docs/frontend-crm-api-contract.md §13. */
export default function StudentInvitePage() {
  const { t } = useTranslation('auth');
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [token] = useState(() => tokenFromHash() ?? pendingStudentInvite.get());
  const [state, setState] = useState<State>('idle');

  useEffect(() => {
    if (!tokenFromHash() || !token) return;
    pendingStudentInvite.set(token);
    // Out of the address bar and the history once stored.
    window.history.replaceState(null, '', window.location.pathname);
  }, [token]);

  const student = user?.role === 'student';
  const accept = () => {
    if (!token) return;
    setState('accepting');
    studentInviteApi.accept(token).then(
      () => {
        pendingStudentInvite.clear();
        setState('done');
      },
      (error: unknown) => {
        const code = apiErrorCode(error);
        if (code === 'student_invite_invalid') pendingStudentInvite.clear();
        setState(code === 'student_invite_invalid' ? 'invalid' : 'failed');
      },
    );
  };

  useEffect(() => {
    if (hasHydrated && student && state === 'idle' && token) accept();
    // Accept once, when the signed-in student is known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, student]);

  if (!hasHydrated) return null;

  if (!token || state === 'invalid') {
    return (
      <div className="rd-auth-state" role="status">
        <AuthHeading title={t('studentInvite.invalid.title')} icon={<XCircle />}>
          {t('studentInvite.invalid.body')}
        </AuthHeading>
        <p className="rd-login-switch"><Link to="/login">{t('backToLogin')}</Link></p>
      </div>
    );
  }

  if (user && isStaffUser(user)) {
    return (
      <div className="rd-auth-state" role="status">
        <AuthHeading title={t('studentInvite.staff.title')} icon={<XCircle />}>
          {t('studentInvite.staff.body')}
        </AuthHeading>
        <p className="rd-login-switch"><Link to={homePathForUser(user)}>{t('invite.toCabinet')}</Link></p>
      </div>
    );
  }

  if (student) {
    if (state === 'done') {
      return (
        <div className="rd-auth-state" role="status">
          <AuthHeading title={t('studentInvite.done.title')} icon={<CheckCircle2 />}>
            {t('studentInvite.done.body')}
          </AuthHeading>
          <Link to={homePathForUser(user)} className="rd-button rd-login-submit">
            {t('studentInvite.done.action')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      );
    }
    if (state === 'failed') {
      return (
        <div className="rd-auth-state" role="status">
          <AuthHeading title={t('studentInvite.failed.title')} icon={<Clock />}>
            {t('studentInvite.failed.body')}
          </AuthHeading>
          <Button size="lg" className="rd-button rd-login-submit" onClick={accept}>
            {t('invite.retry')}
          </Button>
        </div>
      );
    }
    return (
      <div className="rd-auth-state" role="status" aria-busy="true">
        <AuthHeading title={t('studentInvite.accepting')} icon={<UserPlus />} />
      </div>
    );
  }

  return (
    <div className="rd-auth-state">
      <AuthHeading title={t('studentInvite.guest.title')} icon={<UserPlus />}>
        {t('studentInvite.guest.body')}
      </AuthHeading>
      <Link to="/register" className="rd-button rd-login-submit">
        {t('studentInvite.guest.register')}
        <ArrowRight size={20} aria-hidden="true" />
      </Link>
      <p className="rd-login-switch">
        {t('studentInvite.guest.haveAccount')} <Link to="/login">{t('studentInvite.guest.login')}</Link>
      </p>
    </div>
  );
}
