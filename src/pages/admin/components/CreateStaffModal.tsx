import { useEffect, useState } from 'react';
import axios from 'axios';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { Button } from '@/shared/ui/Button';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { ADMIN_INPUT, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminStaffRole, AdminUserDetail } from '@/shared/types';

const STAFF_ROLES: AdminStaffRole[] = ['admin', 'psychologist'];

/** Same rule as self-registration (`RegisterPage.validatePassword`) — the
 *  backend enforces its own version anyway, this just avoids a round trip
 *  for the obvious cases. */
function validatePassword(password: string): string {
  if (password.length < 8) return 'Минимум 8 символов';
  if (!/[A-Za-z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву';
  if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  return '';
}

/** 400s here carry a plain string `detail`; 422s (pydantic validation) carry
 *  an array of `{msg, loc, ...}` objects instead — both need to end up as one
 *  readable line. */
function extractErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Не удалось создать сотрудника';
  const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === 'string') {
    return detail === 'Email already exists' ? 'Этот email уже занят' : detail;
  }
  if (Array.isArray(detail) && detail.length) {
    return detail.map((item) => (typeof item?.msg === 'string' ? item.msg : String(item))).join('; ');
  }
  return 'Не удалось создать сотрудника';
}

interface CreateStaffModalProps {
  open: boolean;
  onClose: () => void;
  /** The endpoint returns the full `AdminUserDetailResponse` for the new
   *  account — handed back so the caller can, e.g., link straight to it. */
  onCreated: (user: AdminUserDetail) => void;
}

/**
 * "Создать сотрудника" — the only way to mint `admin`/`psychologist`
 * accounts (docs/frontend-admin-users-api-contract.md §1.1). Deliberately
 * cannot create `student` accounts — that endpoint rejects `role: "student"`
 * with 422 by design, self-registration is the only path for students.
 *
 * Not wired into `useAdminForm` — that hook is PATCH-diff machinery for
 * editing an existing row, this is a one-shot POST with no baseline to diff
 * against.
 */
export function CreateStaffModal({ open, onClose, onCreated }: CreateStaffModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminStaffRole>('psychologist');
  const [isVerified, setIsVerified] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fresh form every time the modal opens, not just on first mount.
  useEffect(() => {
    if (!open) return;
    setEmail('');
    setPassword('');
    setRole('psychologist');
    setIsVerified(true);
    setEmailError('');
    setPasswordError('');
    setSubmitError('');
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const eErr = trimmedEmail && /\S+@\S+\.\S+/.test(trimmedEmail) ? '' : 'Введите корректный email';
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const created = await adminApi.createUser({
        email: trimmedEmail,
        password,
        role,
        is_verified: isVerified,
      });
      onCreated(created);
      onClose();
    } catch (error) {
      setSubmitError(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-staff-title"
      onClick={submitting ? undefined : onClose}
    >
      <form
        className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div>
          <h2 id="create-staff-title" className="text-title font-black text-primary m-0">
            Создать сотрудника
          </h2>
          <p className={cn(ADMIN_TEXT, 'text-muted mt-1')}>
            Только для админов и психологов — ученики регистрируются сами.
          </p>
        </div>

        <AdminField label="Email" error={emailError}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="email"
              className={ADMIN_INPUT}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              autoComplete="off"
              autoFocus
              disabled={submitting}
            />
          )}
        </AdminField>

        <AdminField label="Пароль" error={passwordError} hint="Минимум 8 символов, буква и цифра">
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="password"
              className={ADMIN_INPUT}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              autoComplete="new-password"
              disabled={submitting}
            />
          )}
        </AdminField>

        <AdminField label="Роль">
          {({ id }) => (
            <AdminSelect
              id={id}
              value={role}
              onChange={(e) => setRole(e.target.value as AdminStaffRole)}
              disabled={submitting}
            >
              {STAFF_ROLES.map((value) => (
                <option key={value} value={value}>
                  {USER_ROLE_LABELS[value]}
                </option>
              ))}
            </AdminSelect>
          )}
        </AdminField>

        <label className={cn(ADMIN_TEXT, 'flex items-center gap-2 text-secondary cursor-pointer')}>
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            disabled={submitting}
            className="w-4 h-4 accent-brand"
          />
          Email уже подтверждён
        </label>

        {submitError && (
          <p role="alert" className={cn(ADMIN_TEXT, 'text-danger m-0')}>
            {submitError}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="md" className="flex-1" isLoading={submitting} muteSound>
            Создать
          </Button>
          <Button type="button" variant="ghost" size="md" muteSound onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
