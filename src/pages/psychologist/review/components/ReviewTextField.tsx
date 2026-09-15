import { ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';

interface ReviewTextFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

/** One free-text block of the report (summary, final analysis). */
export function ReviewTextField({ label, value, onChange, disabled, rows = 4 }: ReviewTextFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className={ADMIN_META}>{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={ADMIN_TEXTAREA}
      />
    </label>
  );
}
