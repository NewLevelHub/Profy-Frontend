import { memo } from 'react';

export interface ChipProps {
  label: string;
  accent?: 'green' | 'orange';
}

function ChipBase({ label, accent }: ChipProps) {
  const style = accent === 'green'
    ? { background: 'var(--brand-subtle)', color: '#5B21B6' }
    : accent === 'orange'
    ? { background: 'var(--accent-soft)', color: 'var(--accent-text)' }
    : { background: 'var(--brand-subtle)', color: '#5B21B6' };

  return (
    <span className="px-[15px] py-[7px] rounded-pill font-extrabold text-sm" style={style}>
      {label}
    </span>
  );
}

export const Chip = memo(ChipBase);
