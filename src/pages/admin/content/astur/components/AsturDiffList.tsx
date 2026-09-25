import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import type { AsturBankDiffEntry } from '@/shared/types';
import { useAsturDiff } from '../hooks/useAsturDiff';

const KIND_LABELS: Record<AsturBankDiffEntry['kind'], string> = {
  added: 'добавлено',
  removed: 'удалено',
  changed: 'изменено',
  subtest_changed: 'субтест',
  bank_changed: 'банк',
};

/** What this version changes relative to the version it was branched from. */
export function AsturDiffList({ versionId }: { versionId: string }) {
  const { data, isLoading, isError } = useAsturDiff(versionId);

  const description = data
    ? data.from_version === null
      ? 'Первая версия — сравнивать не с чем.'
      : `Относительно версии v${data.from_version}${data.to_version ? ` → v${data.to_version}` : ' (последнее сохранение черновика)'}.`
    : undefined;

  return (
    <AdminCard title="Изменения" description={description}>
      {isLoading && <p className={ADMIN_META}>Загрузка…</p>}
      {isError && <p className={cn(ADMIN_META, 'text-danger')}>Не удалось загрузить изменения.</p>}
      {data && data.changes.length === 0 && data.from_version !== null && <p className={ADMIN_META}>Изменений нет.</p>}
      {data && data.changes.length > 0 && (
        <ul className="m-0 p-0 list-none flex flex-col gap-1">
          {data.changes.map((change, i) => (
            <li key={i} className={cn(ADMIN_TEXT, 'flex flex-wrap gap-x-2')}>
              <span className={cn(MONO_LABEL, 'text-brand')}>{KIND_LABELS[change.kind]}</span>
              <span>{change.item_id ?? change.subtest ?? '—'}</span>
              {change.fields.length > 0 && <span className={ADMIN_META}>{change.fields.join(', ')}</span>}
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
