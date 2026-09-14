import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { pluralize } from '@/shared/lib/plural';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminEmpty, AdminError, AdminTableSkeleton } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_CARD, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminMotivationStatementListItem } from '@/shared/types';

/**
 * A triplet (3 statements the student ranks MOST / NEUTRAL / LEAST) is the unit
 * of this content — a single statement in isolation is not editable content,
 * it is one third of a forced-choice screen. The endpoint takes `limit` up to
 * 100, and the bank holds ~36 statements, so a page of 33 triplets fetches the
 * whole set in one request and lets them be grouped honestly.
 *
 * If the bank ever outgrows this, paging still works — a triplet split across
 * a page boundary would then render as a partial group, which the group header
 * calls out rather than hiding.
 */
const PAGE_SIZE = 99;

interface Triplet {
  index: number;
  items: AdminMotivationStatementListItem[];
}

function groupByTriplet(items: readonly AdminMotivationStatementListItem[]): Triplet[] {
  const groups = new Map<number, AdminMotivationStatementListItem[]>();
  for (const item of items) {
    const list = groups.get(item.triplet_index) ?? [];
    list.push(item);
    groups.set(item.triplet_index, list);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, list]) => ({ index, items: [...list].sort((a, b) => a.order - b.order) }));
}

/**
 * Each of the three statements in a triplet must carry a different motivation
 * category — otherwise the forced ranking cannot separate them. The backend
 * does not enforce this, and the previous UI said so in an uppercase note on
 * the detail screen while showing only one statement, so the rule was
 * unverifiable exactly where it had to be checked. Grouping makes it a
 * one-glance check. See docs/admin-backend-requests-pro-242.md §7.
 */
function findDuplicateCategories(triplet: Triplet): string[] {
  const seen = new Map<string, number>();
  for (const item of triplet.items) {
    seen.set(item.category, (seen.get(item.category) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, count]) => count > 1).map(([category]) => category);
}

export default function AdminMotivationStatementsPage() {
  const { page, setPage } = useAdminListParams([] as const);
  useRememberListQuery('/admin/content/motivation-statements');
  const [items, setItems] = useState<AdminMotivationStatementListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listMotivationStatements({ page, limit: PAGE_SIZE });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить утверждения');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  const triplets = groupByTriplet(items);
  const brokenCount = triplets.filter((t) => findDuplicateCategories(t).length > 0).length;

  return (
    <>
      <AdminListHeader
        title="Утверждения мотивации"
        description="Блок MOST / LEAST: ученик ранжирует тройку утверждений. Внутри тройки все три категории должны быть разными."
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        {/* Число утверждений называет подвал — здесь только то, чего там нет. */}
        <span className={ADMIN_META}>
          {loading ? 'загрузка…' : pluralize(triplets.length, 'тройка', 'тройки', 'троек')}
        </span>
        {brokenCount > 0 && (
          <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-medium')}>
            <AlertTriangle size={13} />
            {pluralize(brokenCount, 'тройка', 'тройки', 'троек')} с повторяющейся категорией
          </span>
        )}
      </div>

      {loading ? (
        <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
          <AdminTableSkeleton rows={8} columns={3} />
        </div>
      ) : triplets.length === 0 ? (
        <div className={ADMIN_CARD}>
          <AdminEmpty title="Утверждения не найдены" />
        </div>
      ) : (
        <ul className="flex flex-col gap-3 m-0 p-0 list-none">
          {triplets.map((triplet) => (
            <TripletCard key={triplet.index} triplet={triplet} />
          ))}
        </ul>
      )}

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['утверждение', 'утверждения', 'утверждений']} />
    </>
  );
}

function TripletCard({ triplet }: { triplet: Triplet }) {
  const duplicates = findDuplicateCategories(triplet);
  const incomplete = triplet.items.length !== 3;

  return (
    <li
      className={cn(
        'field-tile overflow-hidden',
        duplicates.length > 0 && 'border-danger',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[color-mix(in_srgb,var(--paper)_62%,transparent)] border-b border-[color:color-mix(in_srgb,var(--border)_70%,transparent)]">
        <span className={cn(ADMIN_TEXT, 'font-semibold text-primary tabular-nums')}>
          Тройка {triplet.index}
        </span>
        {duplicates.length > 0 ? (
          <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-semibold')}>
            <AlertTriangle size={13} />
            Категория повторяется:{' '}
            {duplicates.map((c) => MOTIVATION_CATEGORY_LABELS[c as keyof typeof MOTIVATION_CATEGORY_LABELS] ?? c).join(', ')}
          </span>
        ) : incomplete ? (
          <span className={ADMIN_META}>
            на этой странице {triplet.items.length} из 3 — остальные на соседней
          </span>
        ) : null}
      </div>

      <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
        {triplet.items.map((item) => (
          <li key={item.id}>
            {/* Ссылка на всю строку: подсветка при наведении шла по всей
                строке, а кликался только текст. */}
            <Link
              to={`/admin/content/motivation-statements/${item.id}`}
              className="flex items-start justify-between gap-3 px-3 py-2.5 hover:bg-hover transition-colors group/row"
            >
              <div className="min-w-0">
                {/* Никакого «0 / 1 / 2» перед текстом: порядок внутри тройки
                    ничего не значит — ученик сам расставляет «важнее всего /
                    нейтрально / менее всего», а колонка цифр читалась как
                    уже проставленный ранг. */}
                <span className={cn(ADMIN_TEXT, 'font-medium text-primary group-hover/row:text-brand')}>
                  {item.text}
                </span>
                <p
                  className={cn(
                    ADMIN_META,
                    'mt-1',
                    duplicates.includes(item.category) && 'text-danger',
                  )}
                >
                  {MOTIVATION_CATEGORY_LABELS[item.category]}
                </p>
              </div>
              {item.has_overrides && <OverrideBadge />}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
