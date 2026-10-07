import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SegmentedTab<K extends string> {
  key: K;
  label: ReactNode;
}

/** Two-to-three way switch in one bordered strip (queue: общая / мои). */
export function SegmentedTabs<K extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: SegmentedTab<K>[];
  active: K;
  onChange: (key: K) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-[10px] border border-strong bg-surface overflow-hidden"
    >
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.key)}
            className={cn(
              'min-h-11 px-4 font-sans text-body-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--pine)]',
              on ? 'bg-brand text-on-brand' : 'bg-transparent text-secondary hover:text-primary hover:bg-hover',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
