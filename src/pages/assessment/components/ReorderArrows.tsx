import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReorderArrowsProps {
  /** The item's text — goes into the buttons' aria-labels. */
  label: string;
  position: number;
  total: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

const ARROW_CLASS =
  'size-9 flex-none flex items-center justify-center rounded-lg text-secondary transition-colors hover:text-primary hover:bg-brand-subtle ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)] ' +
  'disabled:opacity-30 disabled:hover:bg-transparent';

/** Up/down buttons beside a sortable row's drag handle — for everyone who
 *  can't or doesn't want to drag (TripletRanking, АСТУР's hierarchy). */
export function ReorderArrows({ label, position, total, onMove, disabled = false }: ReorderArrowsProps) {
  const { t } = useTranslation('assessment');
  return (
    <>
      <button
        type="button"
        onClick={() => onMove(position, position - 1)}
        disabled={disabled || position === 0}
        className={ARROW_CLASS}
        aria-label={t('reorder.moveUp', { item: label })}
      >
        <ArrowUp size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(position, position + 1)}
        disabled={disabled || position === total - 1}
        className={ARROW_CLASS}
        aria-label={t('reorder.moveDown', { item: label })}
      >
        <ArrowDown size={16} aria-hidden />
      </button>
    </>
  );
}
