import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCw, SearchX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ADMIN_BUTTON, ADMIN_CELL, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';

/**
 * The three states every admin list and detail screen can be in.
 *
 * Before PRO-242 each page invented its own: "Загрузка..." as centered text on
 * one screen, a spinner on another, `text-red-600` (a hardcoded Tailwind red,
 * outside the Тропа palette) for errors on six detail pages. These three
 * components are the only allowed rendering of those states in `/admin/*`.
 */

/**
 * Skeleton rows shaped like the table they replace — a shifting layout on
 * load makes a dense table feel broken, so the placeholder holds the space.
 */
export function AdminTableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  const { t } = useTranslation('admin');
  return (
    <div className="divide-y divide-[var(--border)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('states.loading')}</span>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={cn(ADMIN_CELL, 'flex items-center gap-4')}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-3.5 rounded-[2px]"
              style={{ flex: colIndex === 0 ? 3 : 1, opacity: 1 - rowIndex * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Centered block for detail screens, which have no table shape to mimic. */
export function AdminLoading({ label }: { label?: string }) {
  const { t } = useTranslation('admin');
  return (
    <div className="py-16 flex flex-col items-center gap-3" aria-busy="true" aria-live="polite">
      <span className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      <span className={MONO_MUTE}>{label ?? t('states.loading')}</span>
    </div>
  );
}

interface AdminEmptyProps {
  title: string;
  /** What the admin can do about it — a filter to clear, a search to widen. */
  hint?: ReactNode;
  action?: ReactNode;
}

export function AdminEmpty({ title, hint, action }: AdminEmptyProps) {
  return (
    <div className="py-14 px-6 flex flex-col items-center text-center gap-2">
      <SearchX size={20} className="text-muted" />
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary')}>{title}</p>
      {hint && <p className={cn(ADMIN_TEXT, 'text-muted max-w-[46ch]')}>{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface AdminErrorProps {
  /** What failed, in the admin's terms — not the HTTP status. */
  message: string;
  onRetry?: () => void;
}

/**
 * Clay, per DESIGN.md: the error color, never a raw Tailwind red. Always
 * offers a retry when the caller can re-run the request — a dead-end error
 * message forces a full page reload to recover.
 */
export function AdminError({ message, onRetry }: AdminErrorProps) {
  const { t } = useTranslation('admin');
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-3 rounded-[3px] border border-danger bg-danger-subtle"
    >
      <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={cn(ADMIN_TEXT, 'text-danger font-semibold')}>{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={cn(ADMIN_BUTTON, MONO_LABEL, 'flex-shrink-0')}>
          <RotateCw size={12} />
          {t('states.retry')}
        </button>
      )}
    </div>
  );
}
