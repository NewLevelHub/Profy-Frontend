import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import {
  AGE_ORDER,
  AGE_RANGE_HINT,
  HIGH_SCORE_MIN,
  LOW_SCORE_MAX,
  MAX_SCORE,
  ageLabel,
  averageScore,
  breakdown,
  countHighScores,
  countLowScores,
  scenarioLabel,
  scoreDistribution,
  scoreTone,
  sectionTally,
  type Bucket,
} from '@/pages/admin/feedbackModel';
import type { AdminFeedbackListItem, AgeGroup } from '@/shared/types';

/**
 * The summary above the feedback table.
 *
 * What it replaces: two mono-uppercase figures ("5.0 СРЕДНЯЯ ОЦЕНКА", "1 ВСЕГО
 * ОТЗЫВОВ") and a bar chart of the four most-picked sections. An average with
 * no distribution under it is the one number that can be true and useless at
 * the same time — 4.0 looks identical whether everyone said 4 or the room split
 * between 5s and 3s — and the top-four cut meant the section nobody found
 * useful was the one section never shown.
 *
 * Every figure here is computed from the rows the filters left, so the summary
 * answers the question the admin is currently asking ("how do juniors rate it")
 * instead of restating the all-time totals beside a filtered table.
 *
 * The bars are also the fastest filter on the screen: clicking a score or a
 * section narrows the table to it. Reading a chart and then hunting for the
 * matching dropdown is a step this page doesn't need.
 */

type SliceKey = 'age' | 'scenario' | 'direction';

const SLICES: { key: SliceKey; labelKey: string }[] = [
  { key: 'age', labelKey: 'admin:common.col.age' },
  { key: 'scenario', labelKey: 'admin:overview.slice.scenario' },
  { key: 'direction', labelKey: 'admin:overview.slice.direction' },
];

/** Beyond this a direction breakdown is a list, not a comparison. */
const SLICE_ROW_LIMIT = 8;

interface FeedbackOverviewProps {
  /** Everything the filters left — the set the table is showing. */
  items: readonly AdminFeedbackListItem[];
  /** Same set, but ignoring the score filter, so the histogram stays whole. */
  scoreBase: readonly AdminFeedbackListItem[];
  /** Same set, but ignoring the section filter, for the same reason. */
  sectionBase: readonly AdminFeedbackListItem[];
  /** True when the numbers describe a filtered subset, not everything. */
  filtered: boolean;
  onPickScore: (value: string) => void;
  onPickSection: (value: string) => void;
  activeScore: string;
  activeSection: string;
}

export function FeedbackOverview({
  items,
  scoreBase,
  sectionBase,
  filtered,
  onPickScore,
  onPickSection,
  activeScore,
  activeSection,
}: FeedbackOverviewProps) {
  const { t } = useTranslation('admin');
  const [slice, setSlice] = useState<SliceKey>('age');

  if (scoreBase.length === 0 && sectionBase.length === 0) return null;

  const avg = averageScore(scoreBase);
  const distribution = scoreDistribution(scoreBase);
  const sections = sectionTally(sectionBase, t);
  const low = countLowScores(scoreBase);
  const high = countHighScores(scoreBase);
  const noSections = sectionBase.filter((item) => item.helpful_sections.length === 0).length;

  const scope = (count: number) =>
    filtered
      ? t('overview.scopeFiltered', { count })
      : t('overview.scopeAll', { count });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch">
        <AdminCard title={t('overview.scoreTitle')} description={scope(scoreBase.length)}>
          {/* Вопрос под отчётом — «Насколько это про тебя?», поэтому шкала
              читается как «узнал себя / не узнал», а не как «доволен». */}
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              {/* display-sm, not larger: the page title is display-sm too, and a
                  statistic that outranks the page heading reads as a banner. */}
              <p className="font-mono text-display-sm font-medium text-primary tabular-nums m-0 leading-none">
                {avg?.toFixed(1) ?? '—'}
              </p>
              <p className={cn(ADMIN_META, 'mt-1.5')}>{t('overview.outOf', { max: MAX_SCORE })}</p>
            </div>
            <ScoreShortcut
              count={high}
              total={scoreBase.length}
              label={t('overview.recognized', { min: HIGH_SCORE_MIN, max: MAX_SCORE })}
              toneClass="text-brand"
              activeClass="bg-brand-subtle"
              active={activeScore === 'high'}
              onClick={() => onPickScore(activeScore === 'high' ? '' : 'high')}
            />
            <ScoreShortcut
              count={low}
              total={scoreBase.length}
              label={t('overview.notThem', { max: LOW_SCORE_MAX })}
              toneClass="text-accent"
              activeClass="bg-accent-soft"
              active={activeScore === 'low'}
              onClick={() => onPickScore(activeScore === 'low' ? '' : 'low')}
            />
          </div>

          <div className="flex flex-col gap-1 pt-3 border-t border-default">
            {distribution.map((bar) => {
              const active = activeScore === String(bar.score);
              return (
                <button
                  key={bar.score}
                  type="button"
                  onClick={() => onPickScore(active ? '' : String(bar.score))}
                  disabled={bar.count === 0}
                  title={
                    bar.count === 0
                      ? t('overview.noneWithScore', { score: bar.score })
                    : t('overview.showOnlyScore', { score: bar.score })
                  }
                  className={cn(
                    'flex items-center gap-2.5 rounded-[3px] px-1.5 -mx-1.5 py-0.5 transition-colors text-left',
                    bar.count > 0 ? 'hover:bg-hover cursor-pointer' : 'cursor-default',
                    active && 'bg-active-tint',
                  )}
                >
                  <span className={cn(ADMIN_NUM, 'w-3 text-secondary')}>{bar.score}</span>
                  <span className="flex-1 h-2 rounded-[1px] bg-raised overflow-hidden">
                    <span
                      className="block h-full"
                      style={{ width: `${bar.share * 100}%`, backgroundColor: scoreTone(bar.score) }}
                    />
                  </span>
                  <span className={cn(ADMIN_NUM, 'w-6 text-right text-primary')}>{bar.count}</span>
                  <span className={cn(ADMIN_NUM, 'w-9 text-right text-muted')}>
                    {Math.round(bar.share * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard
          title={t('overview.usefulTitle')}
          description={t('overview.usefulDescription', { scope: scope(sectionBase.length) })}
        >
          <div className="flex flex-col gap-1">
            {sections.map((section) => {
              const active = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => onPickSection(active ? '' : section.key)}
                  disabled={section.count === 0}
                  title={
                    section.count === 0
                      ? t('overview.sectionNobody')
                      : t('feedback.showWithSection', { section: section.label })
                  }
                  className={cn(
                    'flex items-center gap-2.5 rounded-[3px] px-1.5 -mx-1.5 py-1 transition-colors text-left',
                    section.count > 0 ? 'hover:bg-hover cursor-pointer' : 'cursor-default',
                    active && 'bg-active-tint',
                  )}
                >
                  <span
                    className={cn(
                      ADMIN_TEXT,
                      // Полное название целиком: эта карточка — легенда для
                      // сокращений в таблице, обрезать её нельзя.
                      'w-[204px] flex-shrink-0 truncate',
                      section.count === 0 ? 'text-muted' : 'text-secondary',
                    )}
                  >
                    {section.label}
                  </span>
                  {/* Полоса — доля от всех отзывов, а не от самого популярного
                      раздела: иначе верхняя строка всегда во всю ширину, и
                      полоса спорит с процентом рядом с ней. */}
                  {/* Lake — «данные» по DESIGN.md, как и полосы срезов ниже.
                      Pine здесь означал бы «хорошо», а он уже занят оценками
                      4–5 в гистограмме слева: один цвет, два разных смысла на
                      одном экране. */}
                  <span className="flex-1 h-2 rounded-[1px] bg-raised overflow-hidden">
                    <span
                      className="block h-full bg-[color:var(--lake)]"
                      style={{ width: `${section.share * 100}%` }}
                    />
                  </span>
                  <span className={cn(ADMIN_NUM, 'w-6 text-right text-primary')}>{section.count}</span>
                  <span className={cn(ADMIN_NUM, 'w-9 text-right text-muted')}>
                    {Math.round(section.share * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
          {noSections > 0 && (
            <p className={cn(ADMIN_META, 'm-0 pt-2 border-t border-default')}>
              {t('overview.noSections', { count: noSections })}
            </p>
          )}
        </AdminCard>
      </div>

      <SliceCard items={items} slice={slice} onSliceChange={setSlice} />
    </div>
  );
}

/**
 * Крупная доля шкалы, она же ярлык фильтра.
 *
 * Одно среднее не отвечает на вопрос, который на самом деле задают этому
 * экрану: сколько людей узнали себя, а сколько — нет. 3.8 одинаково выглядит
 * и при ровном распределении, и при расколе на два лагеря.
 */
function ScoreShortcut({
  count,
  total,
  label,
  toneClass,
  activeClass,
  active,
  onClick,
}: {
  count: number;
  total: number;
  label: string;
  toneClass: string;
  activeClass: string;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('admin');
  const share = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0}
      title={count === 0 ? t('overview.noSuchFeedback') : t('overview.showOnlyThese')}
      className={cn(
        'text-left rounded-[3px] px-2 py-1.5 -mx-2 transition-colors',
        count > 0 ? 'hover:bg-hover cursor-pointer' : 'cursor-default',
        active && activeClass,
      )}
    >
      <span className={cn(ADMIN_NUM, 'text-body-md font-medium', count > 0 ? toneClass : 'text-muted')}>
        {count}
      </span>
      <span className={cn(ADMIN_NUM, ADMIN_META, 'ml-1.5')}>{share}%</span>
      <span className={cn(ADMIN_META, 'block')}>{label}</span>
    </button>
  );
}

/**
 * Средняя оценка в разрезе возраста / сценария / направления.
 *
 * Бэкенд считает все три (`by_age_group`, `by_scenario`, `by_top_direction`),
 * но экран показывал только первый — два готовых среза лежали в ответе
 * неиспользованными. Один переключатель вместо трёх блоков: сравнивают всегда
 * внутри одного среза, а не между ними.
 */
function SliceCard({
  items,
  slice,
  onSliceChange,
}: {
  items: readonly AdminFeedbackListItem[];
  slice: SliceKey;
  onSliceChange: (slice: SliceKey) => void;
}) {
  const { t } = useTranslation('admin');
  const [expanded, setExpanded] = useState(false);
  const buckets = buildSlice(items, slice);
  const shown = expanded ? buckets : buckets.slice(0, SLICE_ROW_LIMIT);
  const hidden = buckets.length - shown.length;
  const overall = averageScore(items);
  // Больше четырёх строк — в две колонки: карточка на всю ширину, а список в
  // один столбец оставлял её правую половину пустой.
  const twoColumns = shown.length > 4;

  return (
    <AdminCard
      title={t('overview.slicesTitle')}
      description={
        slice === 'direction'
          ? t('overview.slicesDirectionHint')
          : t('overview.slicesOtherHint')
      }
      aside={
        <div role="group" aria-label={t('overview.slice.aria')} className="inline-flex rounded-[3px] border border-default overflow-hidden">
          {SLICES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onSliceChange(option.key)}
              aria-pressed={slice === option.key}
              className={cn(
                ADMIN_TEXT,
                'px-2.5 py-1 transition-colors border-r border-default last:border-r-0',
                slice === option.key
                  ? 'bg-active-tint text-brand font-medium'
                  : 'text-muted hover:text-primary hover:bg-hover',
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      }
    >
      {buckets.length === 0 ? (
        <p className={cn(ADMIN_META, 'm-0')}>
          {slice === 'direction'
            ? t('overview.noBreakdown')
            : t('overview.noSliceData')}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'grid gap-x-10 gap-y-1',
              twoColumns ? 'xl:grid-cols-2' : 'max-w-[760px]',
            )}
          >
            {shown.map((bucket) => (
              <div key={bucket.key} className="flex items-center gap-2.5 py-0.5">
                <span
                  className={cn(ADMIN_TEXT, 'text-secondary w-[188px] flex-shrink-0 truncate')}
                  title={bucket.hint ?? bucket.label}
                >
                  {bucket.label}
                </span>
                {/* Полоса — средняя оценка (сравнимая величина), число справа —
                    сколько отзывов её дало. Средняя по двум отзывам и по сорока
                    выглядят одинаково, поэтому объём всегда рядом. */}
                <span className="relative flex-1 h-2 rounded-[1px] bg-raised overflow-hidden">
                  <span
                    className="block h-full bg-[color:var(--lake)]"
                    style={{ width: `${(bucket.avg / MAX_SCORE) * 100}%` }}
                  />
                  {/* Засечка на общем среднем. Без неё три полосы длиной 4.5 / 3.7
                      / 3.7 выглядят просто как три длинные полосы — сравнивать
                      их можно только с чем-то одним и общим. */}
                  {overall != null && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 bottom-0 w-px bg-[color:var(--ink)] opacity-35"
                      style={{ left: `${(overall / MAX_SCORE) * 100}%` }}
                    />
                  )}
                </span>
                <span className={cn(ADMIN_NUM, 'w-8 text-right text-primary')}>{bucket.avg.toFixed(1)}</span>
                <span
                  className={cn(ADMIN_NUM, 'w-14 text-right text-muted')}
                  title={t('overview.bucketShare', { count: bucket.count, total: items.length })}
                >
                  {t('overview.bucketCount', { count: bucket.count })}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-between gap-4 flex-wrap mt-1">
            {overall != null ? (
              <p className={cn(ADMIN_META, 'm-0')}>
                {t('overview.tickLegend', { average: overall.toFixed(1) })}
              </p>
            ) : (
              <span />
            )}
            {/* Кнопки нет там, где скрывать нечего — иначе переключение на
                срез из трёх строк оставляло висеть «Свернуть». */}
            {buckets.length > SLICE_ROW_LIMIT && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className={cn(ADMIN_TEXT, 'text-brand hover:underline')}
              >
                {expanded
                  ? t('common.collapse')
              : t('overview.showMoreRows', { count: hidden })}
              </button>
            )}
          </div>
        </div>
      )}
    </AdminCard>
  );
}

type SliceBucket = Bucket & { hint?: string };

function buildSlice(items: readonly AdminFeedbackListItem[], slice: SliceKey): SliceBucket[] {
  if (slice === 'age') {
    const buckets = breakdown(items, (item) => item.age_group, ageLabel);
    return buckets
      .map((bucket) => ({ ...bucket, hint: AGE_RANGE_HINT[bucket.key as AgeGroup] }))
      .sort((a, b) => AGE_ORDER.indexOf(a.key as AgeGroup) - AGE_ORDER.indexOf(b.key as AgeGroup));
  }
  if (slice === 'scenario') {
    return breakdown(items, (item) => item.scenario, scenarioLabel).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }
  return breakdown(items, (item) => item.top_direction_name).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ru'),
  );
}
