import { memo } from 'react';

export interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

function InfoRowBase({ label, value, className }: InfoRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div className={className}>
      <p className="text-[13px] text-muted font-semibold mb-1">{label}</p>
      <p className="text-[16px] text-primary font-extrabold">{value}</p>
    </div>
  );
}

export const InfoRow = memo(InfoRowBase);
