import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { plural } from '@/shared/lib/plural';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';

interface AdminPagerProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /**
   * Russian plural forms of what is being counted — «пара / пары / пар».
   * Without it the footer read "1–20 из 67": a bare number that never says what
   * 67 is, so every list repeated the same figure with its noun up in the
   * filter row, and the screen showed one count twice in two places.
   */
  noun?: readonly [string, string, string];
}

/**
 * The single pager for every admin list.
 *
 * Replaces three variants that existed before PRO-242 (this component's
 * "СТРОКИ x–y ИЗ N", an inline copy of it on universities, and "СТРАНИЦА x ИЗ y"
 * on feedback) — and adds numbered pages, without which 314 questions were 16
 * ПРЕД/СЛЕД clicks from end to end with no way to jump.
 */
export function AdminPager({ page, total, pageSize, onPageChange, noun }: AdminPagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  /**
   * Итог — только объём, без диапазона строк.
   *
   * Раньше тут стояло «Показано 1–20 из 67». Списки, где есть колонка с
   * собственным номером строки (пары вопросов нумерованы сквозняком по банку),
   * показывали два разных счёта рядом: последняя строка на экране была «35»,
   * а подвал утверждал «1–20», и это читалось как расхождение данных. Какая
   * сейчас страница, видно по кнопкам справа, поэтому диапазон не нужен —
   * нужен объём, названный своим словом.
   */
  return (
    <nav className="flex items-center justify-between flex-wrap gap-3" aria-label="Постраничная навигация">
      <span className={ADMIN_META}>
        {noun ? `${capitalize(plural(total, noun[0], noun[1], noun[2]))}: ` : 'Всего: '}
        <span className={ADMIN_NUM}>{total}</span>
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Предыдущая страница"
            className={cn(ADMIN_BUTTON, 'px-2')}
          >
            <ChevronLeft size={14} />
          </button>

          {buildPageWindow(page, totalPages).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className={cn(ADMIN_META, 'px-1 select-none')}>
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={cn(
                  ADMIN_TEXT,
                  ADMIN_NUM,
                  'min-w-[28px] px-2 py-1 rounded-[10px] border transition-colors',
                  entry === page
                    ? 'border-brand bg-brand-subtle text-brand font-medium'
                    : 'border-transparent text-muted hover:text-primary hover:border-default',
                )}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Следующая страница"
            className={cn(ADMIN_BUTTON, 'px-2')}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </nav>
  );
}

/**
 * First page, last page, and a window around the current one — so the control
 * stays a fixed width whether there are 3 pages or 300.
 */
function buildPageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const windowStart = Math.max(2, Math.min(page - 1, totalPages - 4));
  const windowEnd = Math.min(totalPages - 1, Math.max(page + 1, 5));

  const entries: (number | 'gap')[] = [1];
  if (windowStart > 2) entries.push('gap');
  for (let i = windowStart; i <= windowEnd; i += 1) entries.push(i);
  if (windowEnd < totalPages - 1) entries.push('gap');
  entries.push(totalPages);

  return entries;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
