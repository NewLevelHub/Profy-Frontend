import { Mono } from '@/shared/ui/typography';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Square monogram in the students list — a scanning anchor, not an avatar. */
export function StudentInitials({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="rd-psych-initials w-9 h-9 flex-none inline-flex items-center justify-center rounded-[8px] border border-strong text-secondary"
    >
      <Mono variant="sm">{initialsOf(name) || '—'}</Mono>
    </span>
  );
}
