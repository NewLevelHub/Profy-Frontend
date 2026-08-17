import { cn } from '@/shared/lib/cn';

export interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const SEGMENTS = 4;

const LABELS = ['СЛАБЫЙ ПАРОЛЬ', 'СРЕДНИЙ ПАРОЛЬ', 'ХОРОШИЙ ПАРОЛЬ', 'ОТЛИЧНЫЙ ПАРОЛЬ'] as const;

/**
 * Real (if simple) strength heuristic — length + character-class variety.
 * Not cryptographically rigorous, just an honest reflection of the live
 * password field rather than a fabricated/static bar.
 */
function computeStrength(password: string): { score: number; label: string } {
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  const score = Math.min(points, SEGMENTS);
  const labelIndex = Math.max(0, Math.min(LABELS.length - 1, score - 1));
  const label = score === 0 ? LABELS[0] : LABELS[labelIndex];
  return { score, label };
}

function pluralCharacters(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'символ';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'символа';
  return 'символов';
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label } = computeStrength(password);

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
      <p className="font-mono text-[11px] tracking-[.08em] uppercase text-muted mt-1.5">
        {label} · {password.length} {pluralCharacters(password.length)}
      </p>
    </div>
  );
}
