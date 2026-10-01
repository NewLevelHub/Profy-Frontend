import { REVIEW_TEXTAREA } from './reviewFieldStyles';

interface ReviewTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

/** One free-text block of the report (summary, final analysis). The block
 *  title is visible above it, so the label is for screen readers only. */
export function ReviewTextField({ label, value, onChange, disabled, rows = 4 }: ReviewTextFieldProps) {
  return (
    <textarea
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={rows}
      className={REVIEW_TEXTAREA}
    />
  );
}
