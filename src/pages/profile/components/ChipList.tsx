import { Chip, type ChipVariant } from './Chip';

export interface ChipListProps {
  label: string;
  items: string[];
  variant?: ChipVariant;
}

// Label + chip row — stacked on narrow screens, a fixed label column beside
// the chips from sm up, mirroring the ledger reference's subject rows.
export function ChipList({ label, items, variant }: ChipListProps) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-[132px_1fr] sm:items-start sm:gap-4">
      <p className="text-body-sm font-medium text-primary sm:pt-0.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Chip key={item} label={item} variant={variant} />
        ))}
      </div>
    </div>
  );
}
