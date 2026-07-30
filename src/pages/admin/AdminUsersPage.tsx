import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import { adminApi } from '@/shared/api/admin';
import { AdminTabs } from '@/shared/ui/admin/AdminTabs';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import type { AdminUserListItem, AdminStatsResponse } from '@/shared/types';

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'В процессе',
  completed: 'Завершён',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi.getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { /* cards fall back to the user list's own total below */ });
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
        const data = await adminApi.listUsers({ page, limit: 20, search: query || undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить пользователей');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, query]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Админка"
        subtitle="Пользователи Profy, их прогресс и обратная связь"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Пользователей</div>
          {/* stats.users_count is the whole table; `total` is only this
              search's result count — stats wins when both are available. */}
          <div className="text-[30px] font-extrabold mt-1 text-primary">{stats?.users_count ?? total}</div>
        </div>
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Тестов завершено</div>
          <div className="text-[30px] font-extrabold mt-1 text-[#22C55E]">{stats?.completed_assessments_count ?? '—'}</div>
        </div>
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Незавершённых</div>
          <div className="text-[30px] font-extrabold mt-1 text-[#EA580C]">{stats?.in_progress_assessments_count ?? '—'}</div>
        </div>
      </div>

      <AdminTabs />

      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по email"
            className="w-full pl-[46px] pr-[18px] py-[14px] rounded-[16px] border-2 border-[#DDD6FE] border-b-[4px] bg-white text-primary text-base font-semibold outline-none focus:border-brand transition-all"
          />
        </div>
        <button
          type="submit"
          className="font-sans text-base font-extrabold text-white bg-[#7C3AED] hover:bg-[#6D28D9] border-none border-b-[4px] border-b-[#5B21B6] rounded-[16px] px-[32px] py-[14px] cursor-pointer transition-colors flex items-center justify-center"
        >
          Найти
        </button>
      </form>

      {error && (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-5 text-red-600 font-semibold">{error}</div>
      )}

      {loading ? (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] py-16 text-center text-secondary font-semibold">
          Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] py-16 text-center text-secondary font-semibold">
          Пользователи не найдены
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_0.7fr_1fr_1.2fr] gap-3 px-[22px] py-[16px] bg-[#F5F3FF] text-[13px] font-extrabold tracking-wider text-[#6D28D9] uppercase">
              <div>Email</div>
              <div>Профиль</div>
              <div>Тесты</div>
              <div>Статус</div>
              <div>Регистрация</div>
            </div>
            <div className="divide-y divide-[#EDE9FE]">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={ROUTES.adminUserDetail(item.id)}
                  className="grid grid-cols-[2fr_1fr_0.7fr_1fr_1.2fr] gap-3 px-[22px] py-[18px] text-[15px] font-semibold align-middle items-center hover:bg-[#FCFBFF] transition-colors cursor-pointer"
                >
                  <div className="font-extrabold text-[#6D28D9] overflow-wrap-anywhere">
                    {item.email}
                    {item.is_admin && (
                      <span className="ml-2 text-xs font-extrabold text-[#7C3AED] bg-brand-subtle px-1.5 py-0.5 rounded">admin</span>
                    )}
                  </div>
                  <div className={!item.has_profile ? 'text-[#9CA3AF]' : ''}>
                    {item.has_profile ? item.profile_name : '—'}
                  </div>
                  <div>{item.assessments_count}</div>
                  <div>
                    <Badge variant={item.latest_assessment_status === 'completed' ? 'success' : item.latest_assessment_status === 'in_progress' ? 'warning' : 'default'}>
                      {item.latest_assessment_status
                        ? STATUS_LABELS[item.latest_assessment_status] ?? item.latest_assessment_status
                        : 'Не начал'}
                    </Badge>
                  </div>
                  <div className="text-secondary">{formatDate(item.created_at)}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Cards List View */}
          <div className="block md:hidden flex flex-col gap-[14px]">
            {items.map((item) => (
              <Link
                key={item.id}
                to={ROUTES.adminUserDetail(item.id)}
                className="w-full text-left bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[20px] p-[18px] flex flex-col gap-2.5 hover:border-[#7C3AED] hover:bg-[#FCFBFF] transition-all cursor-pointer"
              >
                <div className="text-[15px] font-extrabold text-[#6D28D9] break-all">
                  {item.email}
                  {item.is_admin && (
                    <span className="ml-2 text-xs font-extrabold text-[#7C3AED] bg-brand-subtle px-1.5 py-0.5 rounded">admin</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-bold text-primary">
                    {item.has_profile ? item.profile_name : '— без профиля'}
                  </span>
                  <span className="text-[14px] font-bold text-secondary">
                    · тестов: {item.assessments_count}
                  </span>
                  <Badge variant={item.latest_assessment_status === 'completed' ? 'success' : item.latest_assessment_status === 'in_progress' ? 'warning' : 'default'}>
                    {item.latest_assessment_status
                      ? STATUS_LABELS[item.latest_assessment_status] ?? item.latest_assessment_status
                      : 'Не начал'}
                  </Badge>
                </div>
                <div className="text-[13px] font-semibold text-muted">
                  Регистрация {formatDate(item.created_at)}
                </div>
              </Link>
            ))}
          </div>
        </>
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
