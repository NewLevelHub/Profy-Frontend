import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

interface FavoriteStarProps {
  universityId: string;
  isFavorite: boolean;
  onToggle: (id: string, isFavorite: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Classic five-point star for «в избранное» — not Lucide's sharper mark,
 * which read as a sparkle/AI glyph on the university cards. Filled pine when
 * on; quiet muted outline when off (never dawn/orange).
 */
function ClassicStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2.6l2.55 6.2 6.7.55-5.1 4.4 1.55 6.5L12 16.9l-5.7 3.35 1.55-6.5-5.1-4.4 6.7-.55L12 2.6z" />
    </svg>
  );
}

function ClassicStarOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    >
      <path d="M12 3.2l2.35 5.7 6.15.5-4.7 4.05 1.4 6-5.2-3.05-5.2 3.05 1.4-6-4.7-4.05 6.15-.5L12 3.2z" />
    </svg>
  );
}

export const FavoriteStar = memo(function FavoriteStar({
  universityId,
  isFavorite,
  onToggle,
  className,
  size = 'md',
}: FavoriteStarProps) {
  const box = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle(universityId, isFavorite);
      }}
      className={cn(
        box,
        'inline-flex items-center justify-center rounded-full cursor-pointer transition-colors',
        'border border-[color:color-mix(in_srgb,#fff_55%,var(--border))]',
        'bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-sm',
        'shadow-[0_6px_14px_color-mix(in_srgb,var(--midnight)_6%,transparent)]',
        isFavorite
          ? 'text-[color:var(--pine)]'
          : 'text-muted hover:text-[color:var(--pine)]',
        className,
      )}
    >
      {isFavorite ? (
        <ClassicStar className={icon} />
      ) : (
        <ClassicStarOutline className={icon} />
      )}
    </button>
  );
});
