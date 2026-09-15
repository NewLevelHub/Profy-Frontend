import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

interface FavoriteStarProps {
  universityId: string;
  isFavorite: boolean;
  onToggle: (id: string, isFavorite: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

function ClassicStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
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
  const { t } = useTranslation('common');
  const [burst, setBurst] = useState(false);
  const box = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';
  const label = isFavorite ? t('favoriteRemove') : t('favoriteAdd');

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isFavorite) {
          setBurst(true);
          window.setTimeout(() => setBurst(false), 420);
        }
        onToggle(universityId, isFavorite);
      }}
      className={cn(
        box,
        'relative inline-flex items-center justify-center rounded-full cursor-pointer transition-colors press-scale',
        'border border-[color:color-mix(in_srgb,#fff_55%,var(--border))]',
        'bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-sm',
        'shadow-[0_6px_14px_color-mix(in_srgb,var(--midnight)_6%,transparent)]',
        isFavorite
          ? 'text-[color:var(--pine)]'
          : 'text-muted hover:text-[color:var(--pine)]',
        burst && 'favorite-burst',
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
