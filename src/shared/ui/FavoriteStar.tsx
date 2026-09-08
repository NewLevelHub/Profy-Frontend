import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface FavoriteStarProps {
  universityId: string;
  isFavorite: boolean;
  onToggle: (id: string, isFavorite: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * The star itself — a real toggle button, not a decorative icon: it carries
 * `aria-pressed` so a screen reader announces the current state rather than
 * just "button", and stops propagation so tapping it inside a clickable card
 * never also navigates.
 */
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
        'inline-flex items-center justify-center rounded-full border-none cursor-pointer transition-colors',
        'bg-surface/90 backdrop-blur-sm shadow-card',
        isFavorite ? 'text-accent' : 'text-muted hover:text-accent',
        className,
      )}
    >
      <Star className={cn(icon, isFavorite && 'fill-current')} />
    </button>
  );
});
