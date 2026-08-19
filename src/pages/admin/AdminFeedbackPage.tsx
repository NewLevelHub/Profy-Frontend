import { useEffect, useState } from 'react';
import { adminApi } from '@/shared/api/admin';
import { REPORT_SECTIONS } from '@/shared/api/feedback';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Heading } from '@/shared/ui/typography/Heading';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminFeedbackListItem, AdminFeedbackStatsResponse } from '@/shared/types';

const PAGE_SIZE = 20;

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  REPORT_SECTIONS.map((s) => [s.value, s.label]),
);

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Compact score chip — pine-tinted when >= 4, otherwise plain. No red/low
 *  tint: a low relevance score is signal to read, not an "error" state. */
function ScoreChip({ value }: { value: number }) {
  return (
    <span
      className={cn(
        MONO_LABEL,
        'inline-flex items-center justify-center w-6 h-6 rounded-[3px]',
        value >= 4 ? 'bg-brand-subtle text-brand' : 'bg-raised text-secondary',
      )}
    >
      {value}
    </span>
  );
}

/** TZ_Profi.md §28.4's requested aggregation (age/scenario/top-direction) —
 *  a compact strip, not a separate dashboard, above the per-row list. */
function StatsStrip({ stats }: { stats: AdminFeedbackStatsResponse }) {
  if (stats.total === 0) return null;

  const topSections = Object.entries(stats.helpful_section_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className={cn(ADMIN_CARD, 'flex flex-col gap-2')}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className={MONO_MUTE}>ВСЕГО: {stats.total}</span>
        <span className={MONO_MUTE}>СРЕДНЯЯ ОЦЕНКА: {stats.avg_relevance_score ?? '—'}</span>
      </div>
      {topSections.length > 0 && (
        <span className={MONO_MUTE}>
          ЧАЩЕ ВСЕГО ПОЛЕЗНО: {topSections.map(([key, count]) => `${SECTION_LABELS[key] ?? key} (${count})`).join(' · ')}
        </span>
      )}
      {stats.by_age_group.length > 0 && (
        <span className={MONO_MUTE}>
          ПО ВОЗРАСТУ: {stats.by_age_group.map((b) => `${b.key} ${b.avg_relevance_score} (${b.count})`).join(' · ')}
        </span>
      )}
    </div>
  );
}

function FeedbackRow({ item }: { item: AdminFeedbackListItem }) {
  const sections = item.helpful_sections.map((s) => SECTION_LABELS[s] ?? s).join(', ');
  const context = [item.age_group, item.scenario ? `сценарий ${item.scenario}` : null, item.top_direction_name]
    .filter(Boolean)
    .join(' · ');

  return (
    <tr className="border-b border-default last:border-b-0 align-top">
      <td className={ADMIN_CELL}>
        <div className="font-semibold text-primary">{item.profile_name ?? item.user_email}</div>
        <div className="font-mono text-mono-xs text-muted mt-0.5">{item.user_email}</div>
      </td>
      <td className={ADMIN_CELL}>
        <ScoreChip value={item.relevance_score} />
      </td>
      <td className={cn(ADMIN_CELL, 'text-secondary max-w-[220px]')}>{sections || <span className={MONO_MUTE}>—</span>}</td>
      <td className={cn(ADMIN_CELL, 'text-secondary max-w-[320px]')}>
        {item.comment || <span className={MONO_MUTE}>—</span>}
      </td>
      <td className={cn(ADMIN_CELL, 'font-mono text-mono-xs text-muted')}>
        {context || <span className={MONO_MUTE}>—</span>}
      </td>
      <td className={cn(ADMIN_CELL, 'font-mono text-mono-xs text-muted whitespace-nowrap')}>
        {formatDate(item.created_at)}
      </td>
    </tr>
  );
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<AdminFeedbackListItem[]>([]);
  const [stats, setStats] = useState<AdminFeedbackStatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [list, statsResp] = await Promise.all([
          adminApi.listFeedback({ page, limit: PAGE_SIZE }),
          adminApi.getFeedbackStats(),
        ]);
        if (cancelled) return;
        setItems(list.items);
        setTotal(list.total);
        setStats(statsResp);
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
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <Heading level="display-sm" className="text-primary">
          Фидбэк
        </Heading>
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      {stats && <StatsStrip stats={stats} />}

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>
            Фидбэка пока нет
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ПОЛЬЗОВАТЕЛЬ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ОЦЕНКА</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ПОЛЕЗНОЕ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>КОММЕНТАРИЙ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>КОНТЕКСТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ДАТА</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <FeedbackRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={MONO_MUTE}>СТРАНИЦА {page} ИЗ {totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
          >
            ПРЕД
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
          >
            СЛЕД
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
