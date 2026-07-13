import { memo } from 'react';

export interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
}

function InfoRowBase({ label, value }: InfoRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-caption text-secondary font-semibold mb-0.5">{label}</p>
      <p className="text-body text-primary font-bold">{value}</p>
    </div>
  );
}

export const InfoRow = memo(InfoRowBase);
