import { cn } from '@/shared/lib/cn';
import { MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';

interface AdminPagerProps {
  page: number;
  totalPages: number;
  rowStart: number;
  rowEnd: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Shared "rows x–y of total" + prev/next footer for admin list pages. */
export function AdminPager({ page, totalPages, rowStart, rowEnd, total, onPrev, onNext }: AdminPagerProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <span className={MONO_MUTE}>
        СТРОКИ {rowStart}–{rowEnd} ИЗ {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
        >
          ПРЕД
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
        >
          СЛЕД
        </button>
      </div>
    </div>
  );
}
