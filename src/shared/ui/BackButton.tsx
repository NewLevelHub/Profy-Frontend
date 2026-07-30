import { cn } from '@/shared/lib/cn';
import { useAppNavigate } from '@/shared/hooks/useAppNavigate';

export interface BackButtonProps {
  /** Overrides the default smart "back" behavior (useAppNavigate().goBack) —
   * pass this when the button's target isn't "wherever I came from" but a
   * specific place (e.g. "back to goals"). */
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ onClick, label = 'Назад', className }: BackButtonProps) {
  const { goBack } = useAppNavigate();

  return (
    <button
      type="button"
      onClick={onClick ?? goBack}
      className={cn(
        'inline-flex items-center font-inherit bg-white border-2 border-[#DDD6FE] border-b-4 border-b-[#DDD6FE] rounded-pill px-[18px] py-2 cursor-pointer hover:bg-[#EFECFF] hover:border-brand transition-colors',
        className,
      )}
    >
      <span className="text-[15px] font-extrabold text-[#6D28D9]">← {label}</span>
    </button>
  );
}
