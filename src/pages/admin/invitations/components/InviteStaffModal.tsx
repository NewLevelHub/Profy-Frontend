import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { UserPlus } from 'lucide-react';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { Button } from '@/shared/ui/Button';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { ADMIN_INPUT } from '@/shared/ui/admin/density';
import type { AdminStaffRole } from '@/shared/types';
import { useInviteStaff, type EmailLocale } from '../hooks/useInviteStaff';
import { InvitationDialog } from './InvitationDialog';
import { InvitationLinkPanel } from './InvitationLinkPanel';

const STAFF_ROLES: readonly AdminStaffRole[] = [
  'psychologist',
  'admin',
  'owner',
  'sales_head',
  'sales_manager',
  'marketer',
];
const EMAIL_LOCALES: readonly EmailLocale[] = ['ru', 'kk'];

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Link to /admin/invitations in the "sent" view — off on that page itself. */
  showListLink?: boolean;
}

interface SegmentedProps<T extends string> {
  labelId: string;
  options: readonly T[];
  value: T;
  label: (value: T) => string;
  disabled: boolean;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ labelId, options, value, label, disabled, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="admin-role-tabs rd-invite-segmented">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          disabled={disabled}
          onClick={() => onChange(option)}
        >
          {label(option)}
        </button>
      ))}
    </div>
  );
}

/** "Пригласить сотрудника" (PRO-464). The account itself is created only
 *  when the invitee accepts — students never come through here. Mounted only
 *  while open, so its state (and the last invite's link) dies on close. */
export function InviteStaffModal({ isOpen, ...props }: InviteStaffModalProps) {
  return isOpen ? <InviteStaffDialog {...props} /> : null;
}

function InviteStaffDialog({ onClose, showListLink = false }: Omit<InviteStaffModalProps, 'isOpen'>) {
  const { t } = useTranslation('admin');
  const titleId = useId();
  const localeLabelId = useId();
  const form = useInviteStaff();
  const { isSubmitting } = form;

  return (
    <InvitationDialog titleId={titleId} locked={isSubmitting} contentKey={form.sent ? 'sent' : 'form'} onClose={onClose}>
      {form.sent ? (
        <>
          <InvitationLinkPanel
            titleId={titleId}
            kind="created"
            email={form.sent.email}
            inviteUrl={form.sent.invite_url}
            expiresAt={form.sent.expires_at}
            emailSent={form.sent.email_sent}
          />
          <div className="rd-invite-footer">
            {showListLink && (
              <Link to="/admin/invitations" className="rd-invite-footer-link">
                {t('invitations.sent.toList')}
              </Link>
            )}
            <Button type="button" size="md" muteSound onClick={onClose}>
              {t('invitations.sent.done')}
            </Button>
          </div>
        </>
      ) : (
        <form className="rd-invite-form" onSubmit={form.handleSubmit} noValidate>
          <div className="rd-invite-head">
            <span className="rd-invite-icon">
              <UserPlus size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id={titleId}>{t('invitations.form.title')}</h2>
              <p>{t('invitations.form.subtitle')}</p>
            </div>
          </div>

          <AdminField label={t('invitations.form.email')} error={form.emailError}>
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="email"
                className={ADMIN_INPUT}
                placeholder={t('invitations.form.emailPlaceholder')}
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                autoComplete="off"
                data-autofocus
                disabled={isSubmitting}
              />
            )}
          </AdminField>

          <AdminField label={t('invitations.form.fullName')}>
            {({ id, describedBy }) => (
              <input
                id={id}
                type="text"
                className={ADMIN_INPUT}
                placeholder={t('invitations.form.fullNamePlaceholder')}
                value={form.fullName}
                onChange={(e) => form.setFullName(e.target.value)}
                aria-describedby={describedBy}
                autoComplete="off"
                maxLength={255}
                disabled={isSubmitting}
              />
            )}
          </AdminField>

          {/* Six roles no longer fit a segmented strip. */}
          <AdminField label={t('invitations.form.role')}>
            {({ id, describedBy }) => (
              <AdminSelect
                id={id}
                value={form.role}
                aria-describedby={describedBy}
                disabled={isSubmitting}
                onChange={(e) => form.setRole(e.target.value as AdminStaffRole)}
              >
                {STAFF_ROLES.map((value) => (
                  <option key={value} value={value}>
                    {t(USER_ROLE_LABELS[value])}
                  </option>
                ))}
              </AdminSelect>
            )}
          </AdminField>

          <div className="admin-field flex flex-col">
            <span className="rd-invite-field-label" id={localeLabelId}>{t('invitations.form.locale')}</span>
            <Segmented
              labelId={localeLabelId}
              options={EMAIL_LOCALES}
              value={form.locale}
              label={(value) => t(`locale.${value}`)}
              disabled={isSubmitting}
              onChange={form.setLocale}
            />
            <p className="rd-invite-hint">{t('invitations.form.localeHint')}</p>
          </div>

          {form.submitError && (
            <p role="alert" className="rd-invite-error">
              {form.submitError}
            </p>
          )}

          <div className="rd-invite-footer">
            <Button type="button" variant="ghost" size="md" muteSound onClick={onClose} disabled={isSubmitting}>
              {t('invitations.cancel')}
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting} muteSound>
              {t('invitations.form.submit')}
            </Button>
          </div>
        </form>
      )}
    </InvitationDialog>
  );
}
