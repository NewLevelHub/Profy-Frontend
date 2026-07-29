import { cn } from '@/shared/lib/cn';
import { Chip } from './Chip';

export interface ChipListProps {
  label: string;
  items: string[];
  accent?: 'green' | 'orange';
}

export function ChipList({ label, items, accent }: ChipListProps) {
  if (!items?.length) return null;
  return (
    <div className="mb-5 last:mb-0">
      <p
        className={cn(
          'font-extrabold text-[15px] mb-2.5',
          accent === 'green' && 'text-success-text',
          accent === 'orange' && 'text-accent-text',
          !accent && 'text-primary',
        )}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item} label={item} accent={accent} />
        ))}
      </div>
    </div>
  );
}
