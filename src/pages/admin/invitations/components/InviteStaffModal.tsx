import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { Button } from '@/shared/ui/Button';
import { AdminOverlay } from '@/shared/ui/admin/AdminOverlay';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { ADMIN_INPUT, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminStaffRole } from '@/shared/types';
import { useInviteStaff } from '../hooks/useInviteStaff';
import { InvitationLinkNotice } from './InvitationLinkNotice';

const STAFF_ROLES: readonly AdminStaffRole[] = ['psychologist', 'admin'];
const EMAIL_LOCALES = ['ru', 'kk'] as const;

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Link to /admin/invitations in the "sent" view — off on that page itself. */
  showListLink?: boolean;
}

/** "Пригласить сотрудника" (PRO-464). The account itself is created only
 *  when the invitee accepts — students never come through here. */
export function InviteStaffModal({ isOpen, onClose, showListLink = false }: InviteStaffModalProps) {
  const { t } = useTranslation('admin');
  const form = useInviteStaff(isOpen);
  const { isSubmitting } = form;

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  return (
    <AdminOverlay><div
      className="rd-admin-dialog fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-staff-title"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2 id="invite-staff-title" className="text-title font-black text-primary m-0">
            {form.sent ? t('invitations.sent.title') : t('invitations.form.title')}
          </h2>
          {!form.sent && <p className={cn(ADMIN_TEXT, 'text-muted mt-1')}>{t('invitations.form.subtitle')}</p>}
        </div>

        {form.sent ? (
          <>
            <InvitationLinkNotice invitation={form.sent} />
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" size="md" className="flex-1" muteSound onClick={onClose}>
                {t('invitations.sent.done')}
              </Button>
              {showListLink && (
                <Link to="/admin/invitations" className={cn(ADMIN_TEXT, 'text-brand font-semibold underline px-2')}>
                  {t('invitations.sent.toList')}
                </Link>
              )}
            </div>
          </>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit} noValidate>
            <AdminField label={t('invitations.form.email')} error={form.emailError}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  type="email"
                  className={ADMIN_INPUT}
                  value={form.email}
                  onChange={(e) => form.setEmail(e.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  autoComplete="off"
                  autoFocus
                  disabled={isSubmitting}
                />
              )}
            </AdminField>

            <AdminField label={t('invitations.form.role')}>
              {({ id }) => (
                <AdminSelect
                  id={id}
                  value={form.role}
                  onChange={(e) => form.setRole(e.target.value as AdminStaffRole)}
                  disabled={isSubmitting}
                >
                  {STAFF_ROLES.map((value) => (
                    <option key={value} value={value}>
                      {t(USER_ROLE_LABELS[value])}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            <AdminField label={t('invitations.form.locale')} hint={t('invitations.form.localeHint')}>
              {({ id, describedBy }) => (
                <AdminSelect
                  id={id}
                  value={form.locale}
                  onChange={(e) => form.setLocale(e.target.value as (typeof EMAIL_LOCALES)[number])}
                  aria-describedby={describedBy}
                  disabled={isSubmitting}
                >
                  {EMAIL_LOCALES.map((value) => (
                    <option key={value} value={value}>
                      {t(`locale.${value}`)}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            {form.submitError && (
              <p role="alert" className={cn(ADMIN_TEXT, 'text-danger m-0')}>
                {form.submitError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="md" className="flex-1" isLoading={isSubmitting} muteSound>
                {t('invitations.form.submit')}
              </Button>
              <Button type="button" variant="ghost" size="md" muteSound onClick={onClose} disabled={isSubmitting}>
                {t('invitations.cancel')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div></AdminOverlay>
  );
}
