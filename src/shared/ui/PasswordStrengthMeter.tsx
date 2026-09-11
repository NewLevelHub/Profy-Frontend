import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

export interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const SEGMENTS = 4;

const LABEL_KEYS = [
  'passwordStrength.weak',
  'passwordStrength.medium',
  'passwordStrength.good',
  'passwordStrength.excellent',
] as const;

/**
 * Real (if simple) strength heuristic — length + character-class variety.
 * Not cryptographically rigorous, just an honest reflection of the live
 * password field rather than a fabricated/static bar.
 */
function computeStrength(password: string): { score: number; labelKey: string } {
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  const score = Math.min(points, SEGMENTS);
  const labelIndex = Math.max(0, Math.min(LABEL_KEYS.length - 1, score - 1));
  return { score, labelKey: score === 0 ? LABEL_KEYS[0] : LABEL_KEYS[labelIndex] };
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { t } = useTranslation('common');
  if (!password) return null;

  const { score, labelKey } = computeStrength(password);

  return (
    <div className={cn('mt-2', className)} role="status" aria-live="polite">
      <div className="flex" style={{ gap: 4 }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="flex-1 rounded-full transition-colors duration-200 ease-out"
            style={{ height: 3, background: i < score ? 'var(--pine)' : 'var(--line)' }}
          />
        ))}
      </div>
      <p className="font-mono text-mono-xs tracking-label uppercase text-muted mt-1.5">
        {t(labelKey)} · {t('passwordStrength.count', { count: password.length })}
      </p>
    </div>
  );
}
