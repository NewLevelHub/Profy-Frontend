import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { REPORT_SECTIONS } from '@/shared/api/feedback';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn, type AdminSort } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { FeedbackOverview } from './components/FeedbackOverview';
import { useFeedbackFeed } from './useFeedbackFeed';
import {
  AGE_ORDER,
  AGE_RANGE_HINT,
  HIGH_SCORE_MIN,
  LOW_SCORE_MAX,
  MAX_SCORE,
  ageLabel,
  scenarioLabel,
  scoreTone,
  sectionLabel,
  sectionShortLabel,
} from './feedbackModel';
import type { AdminFeedbackListItem, AgeGroup } from '@/shared/types';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';

const PAGE_SIZE = 25;
const FILTER_KEYS = ['search', 'score', 'age', 'section', 'comment', 'sort', 'order'] as const;

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').trim();
}

interface Filters {
  search: string;
  score: string;
  age: string;
  section: string;
  comment: string;
}

/** `skip` leaves one dimension unfiltered — see the chart note in the page. */
function matchesFilters(
  item: AdminFeedbackListItem,
  { search, score, age, section, comment }: Filters,
  skip?: 'score' | 'section',
): boolean {
  if (score && skip !== 'score') {
    if (score === 'low' && item.relevance_score > LOW_SCORE_MAX) return false;
    if (score === 'high' && item.relevance_score < HIGH_SCORE_MIN) return false;
    if (score !== 'low' && score !== 'high' && item.relevance_score !== Number(score)) return false;
  }
  if (age && item.age_group !== age) return false;
  if (section && skip !== 'section' && !item.helpful_sections.includes(section)) return false;
  if (comment === 'yes' && !item.comment?.trim()) return false;
  if (comment === 'no' && item.comment?.trim()) return false;

  const query = normalize(search);
  if (!query) return true;
  return (
    normalize(item.comment ?? '').includes(query) ||
    normalize(item.profile_name ?? '').includes(query) ||
    normalize(item.user_email).includes(query) ||
    normalize(item.top_direction_name ?? '').includes(query)
  );
}

/**
 * Score as a filled meter, not a bare digit.
 *
 * Low scores are the rows worth reading, so they have to be findable by eye
 * while scrolling. Dawn (the "finding" accent) for 1–2, lake for a neutral 3,
 * pine for 4–5 — clay stays reserved for genuine errors, and a student saying
 * "this isn't me" is a finding, not a failure of the system.
 */
function ScoreCell({ value }: { value: number }) {
  const { t } = useTranslation('admin');
  const tone = scoreTone(value);

  return (
    <span className="inline-flex items-center gap-2" title={t('feedback.scoreOf', { value, max: MAX_SCORE })}>
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: MAX_SCORE }).map((_, index) => (
          <span
            key={index}
            className="w-[4px] h-4 rounded-[1px]"
            style={{ backgroundColor: index < value ? tone : 'var(--border)' }}
          />
        ))}
      </span>
      <span className={cn(ADMIN_NUM, 'text-primary font-medium')}>{value}</span>
    </span>
  );
}

/**
 * Comments are the point of this screen and were clipped to a narrow column.
 * Long ones expand in place — there is no comment detail endpoint to link to.
 */
function CommentCell({ comment }: { comment: string | null }) {
  const { t } = useTranslation('admin');
  const [expanded, setExpanded] = useState(false);
  if (!comment?.trim()) {
    // Subtle, not muted: примерно половина строк без комментария, и они не
    // должны спорить за внимание с теми, где текст есть.
    return <span className={cn(ADMIN_TEXT, 'text-subtle')}>{t('feedback.noComment')}</span>;
  }

  const long = comment.length > 160;

  return (
    <div>
      <p className={cn(ADMIN_TEXT, 'text-primary m-0', !expanded && long && 'line-clamp-3')}>{comment}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn(ADMIN_TEXT, 'mt-1 text-brand hover:underline inline-flex items-center gap-1')}
        >
          {expanded ? t('common.collapse') : t('feedback.readFull')}
          <ChevronDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { t } = useTranslation('admin');
  const { page, values, setFilter, setFilters, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  const { items, loading, error, truncated, reload } = useFeedbackFeed();

  const { search, score, age, section, comment, sort: sortKey, order } = values;
  const sort: AdminSort = { key: sortKey || 'date', order: order === 'asc' ? 'asc' : 'desc' };

  const filters: Filters = { search, score, age, section, comment };

  const filtered = useMemo(() => {
    const matched = items.filter((item) => matchesFilters(item, filters));

    const direction = sort.order === 'asc' ? 1 : -1;
    return [...matched].sort((a, b) => {
      if (sort.key === 'score') {
        // Ties fall back to newest-first, so re-sorting by score doesn't
        // scramble the order inside each score band on every click.
        return (
          (a.relevance_score - b.relevance_score) * direction ||
          b.created_at.localeCompare(a.created_at)
        );
      }
      return a.created_at.localeCompare(b.created_at) * direction;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, score, age, section, comment, sort.key, sort.order]);

  /**
   * A chart that is also a filter control must not collapse when it is used:
   * filtering to "5" would otherwise leave the histogram a single full bar and
   * no way back. So each chart sees every filter except its own dimension.
   */
  const scoreBase = useMemo(
    () => items.filter((item) => matchesFilters(item, filters, 'score')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, search, age, section, comment],
  );
  const sectionBase = useMemo(
    () => items.filter((item) => matchesFilters(item, filters, 'section')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, search, score, age, comment],
  );

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(search || score || age || section || comment);

  const ageOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (item.age_group) counts.set(item.age_group, (counts.get(item.age_group) ?? 0) + 1);
    }
    return AGE_ORDER.filter((tier) => counts.has(tier)).map((tier) => ({
      value: tier,
      label: `${ageLabel(tier)} (${counts.get(tier)})`,
    }));
  }, [items]);

  const sectionOptions = useMemo(() => {
    const known = REPORT_SECTIONS.map((s) => s.value);
    // Sections are free-form strings server-side, so a retired one still has
    // rows pointing at it — those must stay filterable.
    const extra = [...new Set(items.flatMap((item) => item.helpful_sections))].filter(
      (key) => !known.includes(key),
    );
    // Короткие подписи: ширина нативного `<select>` — это ширина самой длинной
    // опции, и «Профессии и направления» растягивал контрол на треть строки
    // фильтров, даже когда в нём стояло «любой».
    return [...known, ...extra].map((key) => ({ value: key, label: sectionShortLabel(key, t) }));
  }, [items]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  function handleSortChange(next: AdminSort) {
    setFilters({ sort: next.key, order: next.order });
  }

  const columns: AdminColumn<AdminFeedbackListItem>[] = [
    {
      key: 'score',
      header: t('feedback.col.score'),
      sortKey: 'score',
      width: '92px',
      mobile: 'badge',
      headerTitle: t('feedback.col.scoreHint'),
      cell: (item) => <ScoreCell value={item.relevance_score} />,
    },
    {
      key: 'user',
      header: t('feedback.col.user'),
      width: '172px',
      wrap: true,
      mobile: 'title',
      cell: (item) => (
        <div className="min-w-0">
          <Link
            to={`/admin/users/${item.user_id}`}
            title={item.user_email}
            className={cn(ADMIN_TEXT, 'font-semibold text-primary hover:text-brand hover:underline')}
          >
            {item.profile_name ?? item.user_email}
          </Link>
          {item.profile_name && (
            <p className={cn(ADMIN_META, 'mt-0.5 truncate')} title={item.user_email}>
              {item.user_email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'comment',
      header: t('feedback.col.comment'),
      // The comment is the content of this screen, so it takes the slack
      // rather than the user column that happens to be the mobile title.
      grow: true,
      wrap: true,
      cell: (item) => <CommentCell comment={item.comment} />,
    },
    {
      key: 'sections',
      header: t('feedback.col.sections'),
      width: '160px',
      wrap: true,
      mobile: 'field',
      headerTitle: t('feedback.col.sectionsHint'),
      // Слова через точку, не плашки: пять серых прямоугольников разной ширины
      // весили в строке больше, чем комментарий, ради которого строку и читают.
      cell: (item) =>
        item.helpful_sections.length > 0 ? (
          <span className="inline">
            {item.helpful_sections.map((key, index) => (
              <span key={key}>
                {index > 0 && <span className={cn(ADMIN_META, 'mx-1')}>·</span>}
                <button
                  type="button"
                  onClick={() => setFilter('section', section === key ? '' : key)}
                  title={t('feedback.showWithSection', { section: sectionLabel(key, t) })}
                  className={cn(
                    ADMIN_TEXT,
                    'hover:underline transition-colors',
                    section === key ? 'text-brand font-medium' : 'text-secondary hover:text-primary',
                  )}
                >
                  {sectionShortLabel(key, t)}
                </button>
              </span>
            ))}
          </span>
        ) : (
          <span className={ADMIN_META}>—</span>
        ),
    },
    {
      key: 'context',
      header: t('feedback.col.context'),
      width: '156px',
      wrap: true,
      mobile: 'field',
      headerTitle:
        t('feedback.col.contextHint'),
      cell: (item) => {
        const head: string[] = [];
        if (item.age_group) head.push(ageLabel(item.age_group));
        if (item.scenario) head.push(t('feedback.scenario', { scenario: item.scenario }));
        if (head.length === 0 && !item.top_direction_name) {
          return <span className={ADMIN_META}>—</span>;
        }
        // Расшифровка «Senior» и «сценарий C» — в подсказке: в ячейке они
        // должны занимать одну строку, а без расшифровки это просто буквы.
        const hint = [
          item.age_group ? AGE_RANGE_HINT[item.age_group as AgeGroup] : null,
          item.scenario ? scenarioLabel(item.scenario) : null,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <div className="min-w-0">
            {head.length > 0 && (
              <p className={cn(ADMIN_TEXT, 'text-secondary m-0')} title={hint || undefined}>
                {head.join(' · ')}
              </p>
            )}
            {item.top_direction_name && (
              <p className={cn(ADMIN_META, 'mt-0.5')} title={item.top_direction_name}>
                {item.top_direction_name}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'created',
      header: t('feedback.col.date'),
      sortKey: 'date',
      align: 'right',
      width: '112px',
      wrap: true,
      mobile: 'field',
      cell: (item) => {
        const date = new Date(item.created_at);
        return (
          <div>
            {/* Год целиком: «03.09.26» читается как обрезанное «03.09.2026». */}
            <p className={cn(ADMIN_NUM, 'text-secondary m-0')}>
              {formatIntlDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            <p className={cn(ADMIN_NUM, 'text-mono-xs text-muted m-0')}>
              {formatIntlDate(date, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AdminListHeader
        title={t('nav.feedback')}
        description={t('feedback.description')}
      />

      {error && <AdminError message={error} onRetry={reload} />}

      {truncated && (
        <AdminError message={t('feedback.overThousand')} />
      )}

      {!loading && (
        <FeedbackOverview
          items={filtered}
          scoreBase={scoreBase}
          sectionBase={sectionBase}
          filtered={hasFilters}
          activeScore={score}
          activeSection={section}
          onPickScore={(value) => setFilter('score', value)}
          onPickSection={(value) => setFilter('section', value)}
        />
      )}

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: t('feedback.searchPlaceholder') }}
        selects={[
          {
            key: 'score',
            label: t('feedback.col.score'),
            value: score,
            options: [
              { value: 'low', label: t('feedback.scoreLow', { max: LOW_SCORE_MAX }) },
              { value: 'high', label: t('feedback.scoreHigh', { min: HIGH_SCORE_MIN, max: MAX_SCORE }) },
              { value: '5', label: '5' },
              { value: '4', label: '4' },
              { value: '3', label: '3' },
              { value: '2', label: '2' },
              { value: '1', label: '1' },
            ],
          },
          { key: 'age', label: t('common.col.age'), value: age, options: ageOptions },
          { key: 'section', label: t('feedback.col.section'), value: section, options: sectionOptions },
          {
            key: 'comment',
            label: t('feedback.col.comment'),
            value: comment,
            options: [
              { value: 'yes', label: t('common.yes') },
              { value: 'no', label: t('common.no') },
            ],
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
        summary={loading ? t('feedback.loadingInline') : undefined}
      />

      <AdminDataTable
        label={t('feedback.tableLabel')}
        columns={columns}
        rows={pageItems}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/users/${item.user_id}`}
        loading={loading}
        sort={sort}
        onSortChange={handleSortChange}
        emptyTitle={hasFilters ? t('feedback.emptyFiltered') : t('feedback.empty')}
        emptyHint={
          hasFilters
            ? t('feedback.emptyFilteredHint')
            : t('feedback.emptyHint')
        }
        emptyAction={
          hasFilters ? (
            <button type="button" onClick={clearFilters} className={cn(ADMIN_BUTTON, ADMIN_TEXT)}>
              {t('feedback.resetFilters')}
            </button>
          ) : undefined
        }
      />

      <AdminPager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="feedback" />
    </>
  );
}
