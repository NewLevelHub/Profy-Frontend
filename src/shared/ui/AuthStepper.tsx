import { useTranslation } from 'react-i18next';

/**
 * Индикатор шагов регистрации. Живёт отдельным компонентом, потому что шаги
 * разложены по двум маршрутам: почта и пароль — на /register, код из письма —
 * на /verify-email (там уже есть вся логика OTP, дублировать её ради мастера
 * было бы хуже, чем провести индикатор через два экрана).
 */
export function AuthStepper({ current, total = 3 }: { current: number; total?: number }) {
  const { t } = useTranslation('auth');
  return (
    <div className="flex items-center justify-between mb-[26px]">
      <span className="font-mono text-mono-xs tracking-label uppercase text-muted">
        {t('stepper.step', { current, total })}
      </span>
      <span className="flex gap-[5px]" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="block w-[26px] h-[3px] rounded-pill"
            style={{ background: i < current ? 'var(--brand)' : 'var(--border)' }}
          />
        ))}
      </span>
    </div>
  );
}
