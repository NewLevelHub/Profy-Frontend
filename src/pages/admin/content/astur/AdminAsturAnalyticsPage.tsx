import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_CONTROL, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturAgeBand, AsturItemAnalytics } from '@/shared/types';
import { useAsturAnalytics } from './hooks/useAsturAnalytics';
import { asturVersionPath } from './hooks/useAsturVersions';

const AGE_BANDS: AsturAgeBand[] = ['under_14', '14_15', '16_17', '18_plus', 'unknown'];

const pct = (share: number | null | undefined) => (share === null || share === undefined ? '—' : `${Math.round(share * 100)}%`);

/** Per-item product analytics of one published version — for spotting
 *  too-easy, confusing or broken items. Not a norm. */
export default function AdminAsturAnalyticsPage() {
  const { t } = useTranslation('admin');
  const { versionId = '' } = useParams<{ versionId: string }>();
  const {
    version, analytics, isLoading, isError, ageBand, setAgeBand, grade, setGrade, addSynonym, isAdded, synonymError,
  } = useAsturAnalytics(versionId);

  if (isError) return <AdminError message={t('astur.analytics.loadError')} />;
  if (isLoading || !version || !analytics) return <AdminLoading label={t('astur.analytics.loading')} />;

  const grades = Object.keys(analytics.grades).map(Number).sort((a, b) => a - b);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: t('astur.versions.crumb'), to: '/admin/content/tests' },
          { label: `v${version.version}`, to: asturVersionPath(versionId) },
          { label: t('astur.analytics.crumb') },
        ]}
        title={t('astur.analytics.title', { version: version.version })}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {t('astur.analytics.meta', { count: analytics.attempts })}
          </p>
        }
      />

      {synonymError && <p className={cn(ADMIN_META, 'text-danger m-0')}>{synonymError}</p>}

      <div className="flex flex-wrap gap-2 items-center">
        <select className={ADMIN_CONTROL} value={ageBand ?? ''} onChange={(e) => setAgeBand((e.target.value || null) as AsturAgeBand | null)} aria-label={t('astur.analytics.age')}>
          <option value="">{t('astur.analytics.allAges')}</option>
          {AGE_BANDS.map((band) => (
            <option key={band} value={band}>
              {t(`astur.analytics.ageBand.${band}`)} ({analytics.age_bands[band] ?? 0})
            </option>
          ))}
        </select>
        <select className={ADMIN_CONTROL} value={grade ?? ''} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)} aria-label={t('astur.analytics.grade')}>
          <option value="">{t('astur.analytics.allGrades')}</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {t('astur.analytics.gradeOption', { grade: g, count: analytics.grades[String(g)] })}
            </option>
          ))}
        </select>
      </div>

      {analytics.subtests.map((subtest) => (
        <AdminCard
          key={subtest.key}
          title={subtest.key}
          description={
            subtest.median_ms !== null
              ? t('astur.analytics.medianTime', { sec: Math.round(subtest.median_ms / 1000) })
              : undefined
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={cn(ADMIN_META, 'text-left')}>
                  <th className="py-2 pr-3 font-medium">№</th>
                  <th className="py-2 pr-3 font-medium">{t('astur.analytics.col.answered')}</th>
                  <th className="py-2 pr-3 font-medium">{subtest.key === 'lability' ? t('astur.analytics.col.onTime') : t('astur.analytics.col.scoreShare')}</th>
                  <th className="py-2 pr-3 font-medium">{t('astur.analytics.col.options')}</th>
                  <th className="py-2 font-medium">{t('astur.analytics.col.unrecognized')}</th>
                </tr>
              </thead>
              <tbody>
                {subtest.items.map((item) => (
                  <ItemRow
                    key={item.item_id}
                    item={item}
                    quick={subtest.key === 'lability'}
                    onAccept={(locale, text, tier) => addSynonym(item.item_id, locale, text, tier)}
                    isAdded={(locale, text) => isAdded(item.item_id, locale, text)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ))}
    </>
  );
}

interface ItemRowProps {
  item: AsturItemAnalytics;
  quick: boolean;
  onAccept: (locale: 'ru' | 'kk', text: string, tier: 'score_1' | 'score_2') => void;
  isAdded: (locale: string, text: string) => boolean;
}

function ItemRow({ item, quick, onAccept, isAdded }: ItemRowProps) {
  const { t } = useTranslation('admin');
  const answeredTotal = item.option_counts.reduce((sum, o) => sum + o.count, 0);
  return (
    <tr className="border-t border-default align-top">
      <td className={cn(ADMIN_NUM, 'py-2 pr-3')}>{item.position}</td>
      <td className={cn(ADMIN_NUM, 'py-2 pr-3')}>
        {item.answered} / {item.skipped} / {item.unanswered}
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
          : item.unrecognized_answers.map((a) => (
              <div key={`${a.locale}|${a.text}`} className="flex flex-wrap items-center gap-1.5">
                <span>
                  {a.text} <span className={ADMIN_NUM}>×{a.count}</span> · {a.locale}
                </span>
                {isAdded(a.locale, a.text) ? (
                  <span className="text-brand">{t('astur.analytics.addedToDraft')}</span>
                ) : (
                  <>
                    <button type="button" className={ADMIN_BUTTON} onClick={() => onAccept(a.locale, a.text, 'score_1')}>
                      {t('astur.analytics.plusOne')}
                    </button>
                    <button type="button" className={ADMIN_BUTTON} onClick={() => onAccept(a.locale, a.text, 'score_2')}>
                      {t('astur.analytics.plusTwo')}
                    </button>
                  </>
                )}
              </div>
            ))}
      </td>
    </tr>
  );
}
