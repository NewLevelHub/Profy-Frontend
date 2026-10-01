import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import type { AsturBankDiffEntry } from '@/shared/types';
import { useAsturDiff } from '../hooks/useAsturDiff';

const KIND_LABELS: Record<AsturBankDiffEntry['kind'], string> = {
  added: 'astur.diff.kind.added',
  removed: 'astur.diff.kind.removed',
  changed: 'astur.diff.kind.changed',
  subtest_changed: 'astur.diff.kind.subtest_changed',
  bank_changed: 'astur.diff.kind.bank_changed',
};

/** What this version changes relative to the version it was branched from. */
export function AsturDiffList({ versionId }: { versionId: string }) {
  const { t } = useTranslation('admin');
  const { data, isLoading, isError } = useAsturDiff(versionId);

  const description = data
    ? data.from_version === null
      ? t('astur.diff.first')
      : data.to_version
        ? t('astur.diff.relativeTo', { from: data.from_version, to: data.to_version })
        : t('astur.diff.relativeToDraft', { from: data.from_version })
    : undefined;

  return (
    <AdminCard title={t('astur.diff.title')} description={description}>
      {isLoading && <p className={ADMIN_META}>{t('astur.diff.loading')}</p>}
      {isError && <p className={cn(ADMIN_META, 'text-danger')}>{t('astur.diff.loadError')}</p>}
      {data && data.changes.length === 0 && data.from_version !== null && <p className={ADMIN_META}>{t('astur.diff.none')}</p>}
      {data && data.changes.length > 0 && (
        <ul className="m-0 p-0 list-none flex flex-col gap-1">
          {data.changes.map((change, i) => (
            <li key={i} className={cn(ADMIN_TEXT, 'flex flex-wrap gap-x-2')}>
              <span className={cn(MONO_LABEL, 'text-brand')}>{t(KIND_LABELS[change.kind])}</span>
              <span>{change.item_id ?? change.subtest ?? '—'}</span>
              {change.fields.length > 0 && <span className={ADMIN_META}>{change.fields.join(', ')}</span>}
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
