import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { AGE_TIER_LABELS, INSTRUMENT_LABELS } from '@/shared/lib/contentLabels';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_RADIUS, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminQuestionListItem, AgeGroup, Instrument } from '@/shared/types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

function typeCell(item: AdminQuestionListItem): string {
  if (item.instrument === 'riasec') return item.riasec_type ?? '—';
  if (item.instrument === 'big_five') return item.bigfive_domain ?? '—';
  return item.mi_category ?? '—';
}

export default function AdminQuestionsPage() {
  const [items, setItems] = useState<AdminQuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [instrument, setInstrument] = useState<Instrument | ''>('');
  const [ageTier, setAgeTier] = useState<AgeGroup | ''>('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listQuestions({
          page,
          limit: PAGE_SIZE,
          instrument: instrument || undefined,
          age_tier: ageTier || undefined,
          search: query || undefined,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить вопросы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, instrument, ageTier, query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rowStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rowEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={instrument}
          onChange={(e) => {
            setPage(1);
            setInstrument(e.target.value as Instrument | '');
          }}
          className={cn(MONO_LABEL, ADMIN_RADIUS, 'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal')}
        >
          <option value="">Все инструменты</option>
          {(Object.keys(INSTRUMENT_LABELS) as Instrument[]).map((key) => (
            <option key={key} value={key}>
              {INSTRUMENT_LABELS[key]}
            </option>
          ))}
        </select>
        <select
          value={ageTier}
          onChange={(e) => {
            setPage(1);
            setAgeTier(e.target.value as AgeGroup | '');
          }}
          className={cn(MONO_LABEL, ADMIN_RADIUS, 'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal')}
        >
          <option value="">Все возрасты</option>
          {(Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => (
            <option key={key} value={key}>
              {AGE_TIER_LABELS[key]}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по тексту вопроса..."
          className={cn(MONO_LABEL, ADMIN_RADIUS, 'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal w-[220px]')}
        />
      </div>

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Вопросы не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ИНСТРУМЕНТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ТИП</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ТЕКСТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>ПОРЯДОК</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ВОЗРАСТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{INSTRUMENT_LABELS[item.instrument]}</td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{typeCell(item)}</td>
                    <td className={cn(ADMIN_CELL, 'align-top max-w-[420px]')}>
                      <Link to={`/admin/content/questions/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                        {item.text}
                      </Link>
                    </td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>{item.order}</td>
                    <td className={cn(ADMIN_CELL, 'text-secondary align-top')}>{AGE_TIER_LABELS[item.age_tier]}</td>
                    <td className={cn(ADMIN_CELL, 'align-top text-right')}>{item.has_overrides && <OverrideBadge />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminPager page={page} totalPages={totalPages} rowStart={rowStart} rowEnd={rowEnd} total={total} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
    </div>
  );
}
