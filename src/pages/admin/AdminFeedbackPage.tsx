import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { adminApi } from '@/shared/api/admin';
import { AdminTabs } from '@/shared/ui/admin/AdminTabs';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { AdminFeedbackListItem, AdminFeedbackStatsResponse, FeedbackAxisStats, FeedbackRating } from '@/shared/types';

const AXIS_LABELS: { key: keyof AdminFeedbackStatsResponse; label: string }[] = [
  { key: 'overall', label: 'Общая оценка' },
  { key: 'questions', label: 'Вопросы' },
  { key: 'result_match', label: 'Результат' },
  { key: 'plan_usefulness', label: 'План' },
  { key: 'design', label: 'Дизайн' },
];

function AxisStatsCard({ label, stats }: { label: string; stats: FeedbackAxisStats }) {
  return (
    <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
      <div className="text-[13px] font-bold text-secondary">{label}</div>
      <div className="text-[30px] font-extrabold mt-1 text-[#7C3AED]">
        {stats.average != null ? `${stats.average.toLocaleString('ru-RU')} / 5` : '—'}
      </div>
      {stats.scored_count > 0 && stats.scored_count < stats.total_count && (
        <div className="text-[11px] font-semibold text-muted mt-1">
          По {stats.scored_count} из {stats.total_count} отзывов
        </div>
      )}
    </div>
  );
}

const RATING_LABELS: Record<FeedbackRating, string> = {
  good: '🙂 Хорошо',
  neutral: '😐 Средне',
  bad: '🙁 Плохо',
};

const RATING_EMOJI: Record<FeedbackRating, string> = {
  good: '🙂',
  neutral: '😐',
  bad: '🙁',
};

// Legacy rows (submitted before scores existed) only have the emoji category
// — show the real number whenever it's there instead.
function axisCell(rating: FeedbackRating | null, score: number | null) {
  if (score != null) return `${rating ? RATING_EMOJI[rating] : ''} ${score}`.trim();
  return rating ? RATING_EMOJI[rating] : '—';
}

const RATING_FILTERS: { value: FeedbackRating | null; label: string }[] = [
  { value: null, label: 'Все' },
  { value: 'good', label: 'Хорошо' },
  { value: 'neutral', label: 'Средне' },
  { value: 'bad', label: 'Плохо' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<AdminFeedbackListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminFeedbackStatsResponse | null>(null);

  // Aggregated server-side across every feedback row — not just the current
  // page/filter above, so it stays accurate no matter how the list is paged.
  useEffect(() => {
    let cancelled = false;
    adminApi.getFeedbackStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { /* cards show '—' via the null check below */ });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listFeedback({ page, limit: 20, rating: rating ?? undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить фидбек');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, rating]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Админка"
        subtitle="Пользователи Profy, их прогресс и обратная связь"
      />

      <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px] max-w-[220px]">
        <div className="text-[13px] font-bold text-secondary">Отзывов</div>
        <div className="text-[30px] font-extrabold mt-1 text-primary">{total}</div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AXIS_LABELS.map(({ key, label }) => (
            <AxisStatsCard key={key} label={label} stats={stats[key]} />
          ))}
        </div>
      )}

      <AdminTabs />

      <div className="text-[16px] font-semibold text-secondary">
        Оценки по тесту, результату, плану и дизайну — и комментарии пользователей
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[15px] font-extrabold text-[#4B5563]">Общая оценка:</span>
        {RATING_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setPage(1);
              setRating(filter.value);
            }}
            className={cn(
              'text-[15px] font-extrabold px-[22px] py-[10px] rounded-full cursor-pointer transition-all border-2',
              rating === filter.value
                ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                : 'border-[#DDD6FE] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:bg-[#EFECFF]'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-5 text-red-600 font-semibold">{error}</div>
      )}

      {loading ? (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] py-16 text-center text-secondary font-semibold">
          Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] py-16 text-center text-secondary font-semibold">
          Фидбек не найден
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[20px] p-5 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <Link
                  to={ROUTES.adminUserDetail(item.user_id)}
                  className="text-[15px] font-extrabold text-[#6D28D9] break-all hover:underline"
                >
                  {item.user_email}
                </Link>
                <div className="text-[13px] font-bold text-secondary">
                  {formatDate(item.created_at)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-extrabold bg-[#EDE9FE] text-[#5B21B6] rounded-full px-4 py-1.5">
                  {RATING_LABELS[item.overall_rating]}
                  {item.overall_score != null && ` (${item.overall_score}/5)`}
                </span>
                {item.direction_slug && (
                  <span className="text-[14px] font-bold text-[#4B5563] bg-[#F5F3FF] rounded-full px-3.5 py-1.5">
                    {item.direction_slug}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-[#F5F3FF] rounded-xl p-2.5 text-center">
                  <div className="text-[12px] font-bold text-secondary">Вопросы</div>
                  <div className="text-[20px] mt-1">{axisCell(item.questions_rating, item.questions_score)}</div>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-2.5 text-center">
                  <div className="text-[12px] font-bold text-secondary">Результат</div>
                  <div className="text-[20px] mt-1">{axisCell(item.result_match_rating, item.result_match_score)}</div>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-2.5 text-center">
                  <div className="text-[12px] font-bold text-secondary">План</div>
                  <div className="text-[20px] mt-1">{axisCell(item.plan_usefulness_rating, item.plan_usefulness_score)}</div>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-2.5 text-center">
                  <div className="text-[12px] font-bold text-secondary">Дизайн</div>
                  <div className="text-[20px] mt-1">{axisCell(item.design_rating, item.design_score)}</div>
                </div>
              </div>
              <div className="border-t-2 border-[#EDE9FE] pt-3">
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-[#6D28D9] mb-1">
                  Комментарий
                </div>
                <div className="text-[15px] font-semibold text-[#4B5563] leading-normal text-wrap">
                  {item.message ?? '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-secondary font-semibold">
            Всего: {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <span className="px-3 py-2 text-sm font-semibold text-secondary">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
