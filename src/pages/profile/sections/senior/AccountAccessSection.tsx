import { Card } from '@/shared/ui/Card';
import { Tooltip } from '@/shared/ui/Tooltip';

export interface AccountAccessSectionProps {
  email?: string;
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
 * "ДАННЫЕ И ВХОД" — investigated whether email-change / password-change
 * flows already exist elsewhere before building anything new:
 *
 * - EMAIL · "изменить" and ПАРОЛЬ · "сменить": grepped the whole app for an
 *   in-app change-email/change-password flow — none exists. The only password
 *   flow is the logged-out `/forgot-password` recovery flow, which isn't the
 *   same as an authenticated "change password" action, and there's no
 *   "password last updated" timestamp anywhere in the `User` type to show
 *   instead of a fake one. Rendered disabled with an honest tooltip rather
 *   than linking to a flow that doesn't do what the label promises.
 */
export function AccountAccessSection({ email }: AccountAccessSectionProps) {
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
