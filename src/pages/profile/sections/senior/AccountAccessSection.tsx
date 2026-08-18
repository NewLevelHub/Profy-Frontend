import { useNavigate } from 'react-router';
import { Card } from '@/shared/ui/Card';
import { Tooltip } from '@/shared/ui/Tooltip';

export interface AccountAccessSectionProps {
  email?: string;
  grade?: number;
}

function DisabledLink({ label, reason }: { label: string; reason: string }) {
  return (
    <Tooltip content={reason}>
      <span
        tabIndex={0}
        className="text-caption font-bold text-muted cursor-not-allowed select-none"
        aria-disabled="true"
      >
        {label}
      </span>
    </Tooltip>
  );
}

/**
 * "ДАННЫЕ И ВХОД" — investigated whether email-change / password-change /
 * grade-change flows already exist elsewhere before building anything new:
 *
 * - КЛАСС · "изменить" links to the real, existing `/onboarding/profile` edit
 *   flow (same one `PersonalInfoSection` already uses) — no duplicate built.
 * - EMAIL · "изменить" and ПАРОЛЬ · "сменить": grepped the whole app for an
 *   in-app change-email/change-password flow — none exists. The only password
 *   flow is the logged-out `/forgot-password` recovery flow, which isn't the
 *   same as an authenticated "change password" action, and there's no
 *   "password last updated" timestamp anywhere in the `User` type to show
 *   instead of a fake one. Rendered disabled with an honest tooltip rather
 *   than linking to a flow that doesn't do what the label promises.
 * - "СВОИ ДАННЫЕ" (export/delete) · Clay is correct here per the design
 *   system's rule (destructive action) — but no export/delete-account
 *   endpoint exists either, so this is disabled the same way, not wired to a
 *   fake confirmation.
 */
export function AccountAccessSection({ email, grade }: AccountAccessSectionProps) {
  const navigate = useNavigate();

  return (
    <div>
      <p className="font-mono text-tiny font-bold uppercase tracking-label text-muted mb-3">
        ДАННЫЕ И ВХОД
      </p>
      <Card className="p-0 overflow-hidden">
        <Row label="EMAIL" value={email ?? '—'}>
          <DisabledLink label="изменить" reason="Смена email пока не подключена" />
        </Row>
        <Row label="ПАРОЛЬ" value="—" divider>
          <DisabledLink label="сменить" reason="Смена пароля из профиля пока не подключена" />
        </Row>
        <Row label="КЛАСС" value={grade ? `${grade} класс` : '—'} divider>
          <button
            type="button"
            onClick={() => navigate('/onboarding/profile')}
            className="text-caption font-bold text-brand hover:opacity-75 transition-opacity"
          >
            изменить
          </button>
        </Row>
        <Row label="СВОИ ДАННЫЕ" value="Экспорт и удаление аккаунта" divider>
          <Tooltip content="Экспорт и удаление аккаунта пока не подключены">
            <span
              tabIndex={0}
              className="text-caption font-bold cursor-not-allowed select-none"
              style={{ color: 'var(--clay)' }}
              aria-disabled="true"
            >
              открыть
            </span>
          </Tooltip>
        </Row>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  divider,
  children,
}: {
  label: string;
  value: string;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5"
      style={divider ? { borderTop: '1px solid var(--hairline)' } : undefined}
    >
      <div>
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted mb-0.5">
          {label}
        </p>
        <p className="text-label font-medium" style={{ color: 'var(--midnight)' }}>
          {value}
        </p>
      </div>
      {children}
    </div>
  );
}
