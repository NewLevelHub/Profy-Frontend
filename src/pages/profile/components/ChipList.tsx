import { Chip } from './Chip';

export interface ChipListProps {
  label: string;
  items: string[];
  accent?: 'green' | 'orange';
}

export function ChipList({ label, items, accent }: ChipListProps) {
  if (!items?.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-extrabold text-primary text-sm mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-[9px]">
        {items.map((item) => (
          <Chip key={item} label={item} accent={accent} />
        ))}
      </div>
    </div>
  );
}
