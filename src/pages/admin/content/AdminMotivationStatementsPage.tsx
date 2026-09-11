import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { MOTIVATION_CATEGORY_LABELS, contentLocaleOptions } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminEmpty, AdminError, AdminTableSkeleton } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminMotivationStatementListItem } from '@/shared/types';
import type { Locale } from '@/shared/store/locale';

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
const FILTER_KEYS = ['locale'] as const;

interface Triplet {
  index: number;
  locale: Locale;
  items: AdminMotivationStatementListItem[];
}

/**
 * Grouped by (locale, triplet index) — NOT by index alone.
 *
 * Since KZ-301 each triplet exists once per locale, so keying on the index
 * alone merged the ru and the kk copy into one group of six in which every
 * category appears exactly twice. `findDuplicateCategories` then reported
 * every triplet in the bank as broken. A triplet is a per-locale unit: three
 * statements the student ranks, in one language.
 */
function groupByTriplet(items: readonly AdminMotivationStatementListItem[]): Triplet[] {
  const groups = new Map<string, AdminMotivationStatementListItem[]>();
  for (const item of items) {
    const key = `${item.locale}:${item.triplet_index}`;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.values()]
    .map((list) => ({
      index: list[0].triplet_index,
      locale: list[0].locale,
      items: [...list].sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.index - b.index || a.locale.localeCompare(b.locale));
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
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  const { t } = useTranslation('admin');
  const { locale } = values;
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
        const data = await adminApi.listMotivationStatements({
          page,
          limit: PAGE_SIZE,
          locale: (locale as Locale) || undefined,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError(t('statements.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, locale, reloadToken]);

  const triplets = groupByTriplet(items);
  const brokenCount = triplets.filter((t) => findDuplicateCategories(t).length > 0).length;

  return (
    <>
      <AdminListHeader
        title={t('statements.title')}
        description={t('statements.description')}
      />

      <AdminToolbar
        selects={[
          {
            key: 'locale',
            label: t('common.col.locale'),
            value: locale,
            options: contentLocaleOptions(t),
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        {/* Число утверждений называет подвал — здесь только то, чего там нет. */}
        <span className={ADMIN_META}>
          {loading ? t('common.loadingInline') : t('statements.tripletCount', { count: triplets.length })}
        </span>
        {brokenCount > 0 && (
          <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-medium')}>
            <AlertTriangle size={13} />
            {t('statements.brokenCount', { count: brokenCount })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-surface border border-default rounded-[3px] p-0 overflow-hidden">
          <AdminTableSkeleton rows={8} columns={3} />
        </div>
      ) : triplets.length === 0 ? (
        <div className="bg-surface border border-default rounded-[3px]">
          <AdminEmpty title={t('statements.empty')} />
        </div>
      ) : (
        <ul className="flex flex-col gap-3 m-0 p-0 list-none">
          {triplets.map((triplet) => (
            <TripletCard key={`${triplet.locale}:${triplet.index}`} triplet={triplet} />
          ))}
        </ul>
      )}

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="statements" />
    </>
  );
}

function TripletCard({ triplet }: { triplet: Triplet }) {
  const { t } = useTranslation('admin');
  const duplicates = findDuplicateCategories(triplet);
  const incomplete = triplet.items.length !== 3;

  return (
    <li
      className={cn(
        'bg-surface border rounded-[3px] overflow-hidden',
        duplicates.length > 0 ? 'border-danger' : 'border-default',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-raised border-b border-default">
        <span className={cn(ADMIN_TEXT, 'flex items-center gap-2 font-semibold text-primary tabular-nums')}>
          {t('statements.triplet', { index: triplet.index })}
          <LocaleBadge locale={triplet.locale} />
        </span>
        {duplicates.length > 0 ? (
          <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-semibold')}>
            <AlertTriangle size={13} />
            {t('statements.duplicateCategory')}{' '}
            {duplicates.map((c) => t(MOTIVATION_CATEGORY_LABELS[c as keyof typeof MOTIVATION_CATEGORY_LABELS]) ?? c).join(', ')}
          </span>
        ) : incomplete ? (
          <span className={ADMIN_META}>
            {t('statements.partialGroup', { count: triplet.items.length })}
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
                  {t(MOTIVATION_CATEGORY_LABELS[item.category])}
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
