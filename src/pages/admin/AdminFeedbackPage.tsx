import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { adminApi, type AdminFeedbackFilterParams } from '@/shared/api/admin';
import { REPORT_SECTIONS } from '@/shared/api/feedback';
import { cn } from '@/shared/lib/cn';
import { pluralize } from '@/shared/lib/plural';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { FeedbackOverview } from './components/FeedbackOverview';
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
import type { AdminFeedbackListItem, AdminFeedbackStatsResponse, AgeGroup } from '@/shared/types';

const PAGE_SIZE = 25;
const FILTER_KEYS = ['search', 'score', 'age', 'section', 'comment'] as const;
/** Поля сортировки, которые принимает эндпоинт — незнакомое значение
 *  в URL игнорируется, а не улетает на сервер за 422. */
const SORTABLE_KEYS = ['created_at', 'relevance_score'] as const;

/** The score dropdown speaks in bands; the API speaks in bounds. */
function scoreBounds(score: string): { score_min?: number; score_max?: number } {
  if (score === 'low') return { score_max: LOW_SCORE_MAX };
  if (score === 'high') return { score_min: HIGH_SCORE_MIN };
  const exact = Number(score);
  if (!score || Number.isNaN(exact)) return {};
  return { score_min: exact, score_max: exact };
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
  const tone = scoreTone(value);

  return (
    <span className="inline-flex items-center gap-2" title={`${value} из ${MAX_SCORE}`}>
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
  const [expanded, setExpanded] = useState(false);
  if (!comment?.trim()) {
    // Subtle, not muted: примерно половина строк без комментария, и они не
    // должны спорить за внимание с теми, где текст есть.
    return <span className={cn(ADMIN_TEXT, 'text-subtle')}>без комментария</span>;
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
          {expanded ? 'Свернуть' : 'Читать полностью'}
          <ChevronDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { page, values, sort, setSort, setFilter, setPage, clearFilters } =
    useAdminListParams(FILTER_KEYS, SORTABLE_KEYS);

  const { search, score, age, section, comment } = values;
  const hasFilters = Boolean(search || score || age || section || comment);

  const [items, setItems] = useState<AdminFeedbackListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AdminFeedbackStatsResponse | null>(null);
  const [scoreBase, setScoreBase] = useState<AdminFeedbackStatsResponse | null>(null);
  const [sectionBase, setSectionBase] = useState<AdminFeedbackStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const filters: AdminFeedbackFilterParams = useMemo(
    () => ({
      search: search || undefined,
      age_group: (age as AgeGroup) || undefined,
      section: section || undefined,
      has_comment: comment ? comment === 'yes' : undefined,
      ...scoreBounds(score),
    }),
    [search, score, age, section, comment],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        /*
         * A chart that is also a filter control must not collapse when it is
         * used: filtering to "5" would otherwise leave the histogram a single
         * full bar with no way back. So each chart is described by a stats call
         * that drops its own dimension — and only when that dimension is
         * actually filtered, since otherwise it is the same set as the summary.
         */
        const { score_min, score_max, section: pickedSection, ...rest } = filters;
        const [list, summary, byScore, bySection] = await Promise.all([
          adminApi.listFeedback({
            ...filters,
            page,
            limit: PAGE_SIZE,
            sort: sort?.key,
            order: sort?.order,
          }),
          adminApi.getFeedbackStats(filters),
          score ? adminApi.getFeedbackStats({ ...rest, section: pickedSection }) : null,
          pickedSection ? adminApi.getFeedbackStats({ ...rest, score_min, score_max }) : null,
        ]);
        if (cancelled) return;
        setItems(list.items);
        setTotal(list.total);
        setStats(summary);
        setScoreBase(byScore ?? summary);
        setSectionBase(bySection ?? summary);
      } catch {
        if (!cancelled) setError('Не удалось загрузить фидбэк');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, page, score, sort?.key, sort?.order, reloadToken]);

  /**
   * Счётчики в подписях — только пока фильтр по возрасту не выбран.
   *
   * `stats` считается по текущим фильтрам, поэтому с выбранным возрастом у
   * остальных вариантов было бы «(0)» — не «таких нет», а «мы их отфильтровали».
   */
  const ageOptions = useMemo(
    () =>
      AGE_ORDER.map((tier) => {
        const row = age ? undefined : stats?.by_age_group.find((entry) => entry.key === tier);
        return { value: tier, label: row ? `${ageLabel(tier)} (${row.count})` : ageLabel(tier) };
      }),
    [stats, age],
  );

  const sectionOptions = useMemo(() => {
    const known = REPORT_SECTIONS.map((s) => s.value);
    // Sections are free-form strings server-side, so a retired one still has
    // rows pointing at it — those must stay filterable.
    const extra = Object.keys(stats?.helpful_section_counts ?? {}).filter(
      (key) => !known.includes(key),
    );
    // Короткие подписи: ширина нативного `<select>` — это ширина самой длинной
    // опции, и «Профессии и направления» растягивал контрол на треть строки
    // фильтров, даже когда в нём стояло «любой».
    return [...known, ...extra].map((key) => ({ value: key, label: sectionShortLabel(key) }));
  }, [stats]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const columns: AdminColumn<AdminFeedbackListItem>[] = [
    {
      key: 'score',
      header: 'Оценка',
      sortKey: 'relevance_score',
      width: '92px',
      mobile: 'badge',
      headerTitle: '«Насколько это про тебя?» — 1–5, вопрос после отчёта',
      cell: (item) => <ScoreCell value={item.relevance_score} />,
    },
    {
      key: 'user',
      header: 'Пользователь',
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
      header: 'Комментарий',
      // The comment is the content of this screen, so it takes the slack
      // rather than the user column that happens to be the mobile title.
      grow: true,
      wrap: true,
      cell: (item) => <CommentCell comment={item.comment} />,
    },
    {
      key: 'sections',
      header: 'Полезные разделы',
      width: '160px',
      wrap: true,
      mobile: 'field',
      headerTitle: 'Что ученик отметил как полезное. Полные названия — в сводке над таблицей.',
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
                  title={`Показать отзывы с разделом «${sectionLabel(key)}»`}
                  className={cn(
                    ADMIN_TEXT,
                    'hover:underline transition-colors',
                    section === key ? 'text-brand font-medium' : 'text-secondary hover:text-primary',
                  )}
                >
                  {sectionShortLabel(key)}
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
      header: 'Контекст',
      width: '156px',
      wrap: true,
      mobile: 'field',
      headerTitle:
        'Возрастная группа и сценарий отчёта на момент отзыва, ниже — направление, выпавшее первым',
      cell: (item) => {
        const head: string[] = [];
        if (item.age_group) head.push(ageLabel(item.age_group));
        if (item.scenario) head.push(`сценарий ${item.scenario}`);
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
      header: 'Дата',
      sortKey: 'created_at',
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
              {date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            <p className={cn(ADMIN_NUM, 'text-mono-xs text-muted m-0')}>
              {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AdminListHeader
        title="Фидбэк"
        description="Опрос после отчёта: насколько он оказался про них, какие разделы пригодились и что не подошло."
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      {/* Не размонтируется на время запроса: сводка — это ещё и фильтр
          (клик по столбику), а размонтирование сбрасывало бы выбранный срез и
          развёрнутые списки ровно в тот момент, когда ими пользуются. */}
      {stats && scoreBase && sectionBase && (
        <FeedbackOverview
          stats={stats}
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
        search={{ value: search, onChange: handleSearch, placeholder: 'Текст комментария' }}
        selects={[
          {
            key: 'score',
            label: 'Оценка',
            value: score,
            options: [
              { value: 'low', label: `низкие (1–${LOW_SCORE_MAX})` },
              { value: 'high', label: `высокие (${HIGH_SCORE_MIN}–${MAX_SCORE})` },
              { value: '5', label: '5' },
              { value: '4', label: '4' },
              { value: '3', label: '3' },
              { value: '2', label: '2' },
              { value: '1', label: '1' },
            ],
          },
          { key: 'age', label: 'Возраст', value: age, options: ageOptions },
          { key: 'section', label: 'Раздел', value: section, options: sectionOptions },
          {
            key: 'comment',
            label: 'Комментарий',
            value: comment,
            options: [
              { value: 'yes', label: 'есть' },
              { value: 'no', label: 'нет' },
            ],
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
        summary={loading ? 'загрузка отзывов…' : undefined}
      />

      <AdminDataTable
        label="Отзывы об отчёте"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/users/${item.user_id}`}
        loading={loading}
        sort={sort}
        onSortChange={setSort}
        emptyTitle={hasFilters ? 'Под фильтры ничего не подошло' : 'Фидбэка пока нет'}
        emptyHint={
          hasFilters
            ? 'Поиск идёт по тексту комментария.'
            : 'Отзывы появляются после того, как ученик дошёл до отчёта и ответил на три вопроса под ним.'
        }
        emptyAction={
          hasFilters ? (
            <button type="button" onClick={clearFilters} className={cn(ADMIN_BUTTON, ADMIN_TEXT)}>
              Сбросить фильтры
            </button>
          ) : undefined
        }
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['отзыв', 'отзыва', 'отзывов']} />
    </>
  );
}
