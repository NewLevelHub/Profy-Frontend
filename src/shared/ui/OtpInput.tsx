import { ClipboardEvent, KeyboardEvent, ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

// Placeholder for a not-yet-filled cell within the fixed-length code string.
// A plain string can't represent "cell 3 is empty, cell 4 has a digit"
// without *some* character reserved for the gap — join()-ing an array with
// bare '' entries silently collapses them and shifts everything after left,
// which corrupts the code the moment a user edits a middle cell (backspaces
// it, or clicks into an empty cell that isn't the next one in sequence)
// while later cells still hold digits. Consumers should treat completeness
// as "matches /^\d{length}$/", not "length === n".
const EMPTY_CELL = ' ';

export interface OtpInputProps {
  /** Number of digit cells. Defaults to 6. */
  length?: number;
  /**
   * Canonical code string, fixed at `length` once any cell has been touched
   * (space-padded at not-yet-filled positions to preserve gaps). Test
   * completeness with `/^\d+$/.test(value)` at the expected length, not
   * `value.length === length` — a mid-edit gap keeps the string that long.
   */
  value: string;
  onChange: (value: string) => void;
  /** Renders every cell with a Clay accent — the system's one error color. */
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Six real, individually-focusable digit cells for OTP entry — not a hidden
 * text input styled to look like boxes. Auto-advances focus on digit entry,
 * moves back on backspace-from-empty, and supports pasting a full code.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  className,
  'aria-label': ariaLabel,
}: OtpInputProps) {
  const { t } = useTranslation('common');
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [justFilledIndex, setJustFilledIndex] = useState<number | null>(null);
  const popTimeoutRef = useRef<number | undefined>(undefined);

  const digits = Array.from({ length }, (_, i) => {
    const ch = value[i];
    return ch && ch !== EMPTY_CELL ? ch : '';
  });

  function commit(nextDigits: string[]) {
    // Always normalize to exactly `length` slots, padding with the gap
    // placeholder (never trimming trailing blanks) so every cell's position
    // survives the round-trip through the string prop — regardless of
    // whether the caller passed a full-length array or a shorter one (paste).
    const padded = Array.from({ length }, (_, i) => nextDigits[i] || EMPTY_CELL);
    onChange(padded.join(''));
  }

  function popCell(i: number) {
    window.clearTimeout(popTimeoutRef.current);
    setJustFilledIndex(i);
    popTimeoutRef.current = window.setTimeout(() => setJustFilledIndex(null), 150);
  }

  function handleChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const next = digits.slice();

    if (!raw) {
      next[i] = '';
      commit(next);
      return;
    }

    next[i] = raw[raw.length - 1];
    commit(next);
    popCell(i);

    if (i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      const next = digits.slice();
      next[i - 1] = '';
      commit(next);
      refs.current[i - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    commit(pasted.split(''));
    const focusIndex = Math.min(pasted.length, length - 1);
    requestAnimationFrame(() => refs.current[focusIndex]?.focus());
  }

  return (
    <div className={cn('flex', className)} style={{ gap: 8 }} role="group" aria-label={ariaLabel}>
      {digits.map((digit, i) => {
        const isFocused = focusedIndex === i;
        const filled = !!digit;

        let borderBottomColor = 'var(--hairline)';
        let borderBottomWidth = '1px';
        if (error) {
          borderBottomColor = 'var(--clay)';
          borderBottomWidth = '1.5px';
        } else if (isFocused) {
          borderBottomColor = 'var(--dawn)';
          borderBottomWidth = '1.5px';
        } else if (filled) {
          borderBottomColor = 'var(--pine)';
          borderBottomWidth = '1.5px';
        }

        return (
          <div
            key={i}
            className={cn(
              'flex-1 flex items-center justify-center rounded-[var(--radius)]',
              justFilledIndex === i && 'otp-cell-pop',
            )}
            style={{
              height: 56,
              background: 'var(--paper)',
              border: '1px solid var(--hairline)',
              borderBottomWidth,
              borderBottomColor,
              borderBottomStyle: 'solid',
              boxSizing: 'border-box',
              transition: 'border-color 160ms ease',
            }}
          >
            <input
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={disabled}
              autoFocus={autoFocus && i === 0}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => { setFocusedIndex(i); e.target.select(); }}
              onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
              aria-label={t('otp.cellLabel', { index: i + 1, total: length })}
              className="w-full h-full text-center bg-transparent border-0 outline-none font-mono text-display-sm text-[color:var(--text-heading)] disabled:opacity-50"
            />
          </div>
        );
      })}
    </div>
  );
}
