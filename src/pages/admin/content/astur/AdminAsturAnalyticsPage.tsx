import { useParams } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_CONTROL, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturAgeBand, AsturItemAnalytics } from '@/shared/types';
import { useAsturAnalytics } from './hooks/useAsturAnalytics';
import { asturVersionPath } from './hooks/useAsturVersions';

const AGE_BANDS: { value: AsturAgeBand; label: string }[] = [
  { value: 'under_14', label: 'младше 14' },
  { value: '14_15', label: '14–15' },
  { value: '16_17', label: '16–17' },
  { value: '18_plus', label: '18+' },
  { value: 'unknown', label: 'возраст неизвестен' },
];

const pct = (share: number | null | undefined) => (share === null || share === undefined ? '—' : `${Math.round(share * 100)}%`);

/** Per-item product analytics of one published version — for spotting
 *  too-easy, confusing or broken items. Not a norm. */
export default function AdminAsturAnalyticsPage() {
  const { versionId = '' } = useParams<{ versionId: string }>();
  const { version, analytics, isLoading, isError, ageBand, setAgeBand, grade, setGrade } = useAsturAnalytics(versionId);

  if (isError) return <AdminError message="Не удалось загрузить аналитику." />;
  if (isLoading || !version || !analytics) return <AdminLoading label="Загрузка аналитики…" />;

  const grades = Object.keys(analytics.grades).map(Number).sort((a, b) => a - b);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: 'АСТУР — версии банка', to: '/admin/content/tests' },
          { label: `v${version.version}`, to: asturVersionPath(versionId) },
          { label: 'Аналитика' },
        ]}
        title={`Аналитика заданий · v${version.version}`}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            Завершённых попыток: {analytics.attempts}. Данные помогают найти слишком лёгкие, непонятные или
            сломанные задания и не являются научной нормой.
          </p>
        }
      />

      <div className="flex flex-wrap gap-2 items-center">
        <select className={ADMIN_CONTROL} value={ageBand ?? ''} onChange={(e) => setAgeBand((e.target.value || null) as AsturAgeBand | null)} aria-label="Возраст">
          <option value="">Все возрасты</option>
          {AGE_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label} ({analytics.age_bands[b.value] ?? 0})
            </option>
          ))}
        </select>
        <select className={ADMIN_CONTROL} value={grade ?? ''} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)} aria-label="Класс">
          <option value="">Все классы</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g} класс ({analytics.grades[String(g)]})
            </option>
          ))}
        </select>
      </div>

      {analytics.subtests.map((subtest) => (
        <AdminCard
          key={subtest.key}
          title={subtest.key}
          description={subtest.median_ms !== null ? `Медиана времени на субтест: ${Math.round(subtest.median_ms / 1000)} с` : undefined}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={cn(ADMIN_META, 'text-left')}>
                  <th className="py-2 pr-3 font-medium">№</th>
                  <th className="py-2 pr-3 font-medium">Ответили / пропуск</th>
                  <th className="py-2 pr-3 font-medium">{subtest.key === 'lability' ? 'В лимит' : 'Доля баллов'}</th>
                  <th className="py-2 pr-3 font-medium">Выбор вариантов</th>
                  <th className="py-2 font-medium">Нераспознанные ответы</th>
                </tr>
              </thead>
              <tbody>
                {subtest.items.map((item) => (
                  <ItemRow key={item.item_id} item={item} quick={subtest.key === 'lability'} />
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ))}
    </>
  );
}

function ItemRow({ item, quick }: { item: AsturItemAnalytics; quick: boolean }) {
  const answeredTotal = item.option_counts.reduce((sum, o) => sum + o.count, 0);
  return (
    <tr className="border-t border-default align-top">
      <td className={cn(ADMIN_NUM, 'py-2 pr-3')}>{item.position}</td>
      <td className={cn(ADMIN_NUM, 'py-2 pr-3')}>
        {item.answered} / {item.skipped}
      </td>
      <td className={cn(ADMIN_NUM, 'py-2 pr-3')}>{quick ? pct(item.on_time_share) : pct(item.mean_score_share)}</td>
      <td className={cn(ADMIN_TEXT, 'py-2 pr-3')}>
        {item.option_counts.length === 0
          ? '—'
          : item.option_counts.map((o) => (
              <div key={o.index} className="flex gap-2">
                <span className="truncate max-w-[180px]">{o.label}</span>
                <span className={ADMIN_NUM}>{answeredTotal ? Math.round((o.count / answeredTotal) * 100) : 0}%</span>
              </div>
            ))}
      </td>
      <td className={cn(ADMIN_META, 'py-2')}>
        {item.unrecognized_answers.length === 0
          ? '—'
          : item.unrecognized_answers.map((a) => `${a.text} (${a.count})`).join('; ')}
      </td>
    </tr>
  );
}
