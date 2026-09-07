import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { pluralize } from '@/shared/lib/plural';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField, type AdminFieldRevert } from '@/shared/ui/admin/AdminField';
import { useLockRelease } from './useLockRelease';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_CELL, ADMIN_INPUT, ADMIN_TEXT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminUniversityDetail, AdminUniversityUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'name',
  'short_name',
  'aliases',
  'city',
  'country',
  'location',
  'website',
  'source_url',
  'description',
  'ranking',
  'ranking_label',
  'uniranks_kz_rank',
  'uniranks_world_rank',
  'uniranks_note',
] as const satisfies readonly (keyof AdminUniversityUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  name: 'название',
  short_name: 'короткое имя',
  aliases: 'алиасы',
  city: 'город',
  country: 'страна',
  location: 'адрес',
  website: 'сайт',
  source_url: 'источник',
  description: 'описание',
  ranking: 'рейтинг',
  ranking_label: 'подпись рейтинга',
  uniranks_kz_rank: 'Uniranks KZ',
  uniranks_world_rank: 'Uniranks World',
  uniranks_note: 'примечание Uniranks',
};

// Decoupled from the wire type's nullability: the UI represents "empty" as ''
// everywhere, and `buildPatchBody`'s output stays assignable when sent.
interface FormState {
  name: string;
  short_name: string;
  aliases: string[];
  city: string;
  country: string;
  location: string;
  website: string;
  source_url: string;
  description: string;
  ranking: number | null;
  ranking_label: string;
  uniranks_kz_rank: number | null;
  uniranks_world_rank: number | null;
  uniranks_note: string;
}

function toFormState(detail: AdminUniversityDetail): FormState {
  return {
    name: detail.name,
    short_name: detail.short_name ?? '',
    aliases: detail.aliases,
    city: detail.city ?? '',
    country: detail.country ?? '',
    location: detail.location ?? '',
    website: detail.website ?? '',
    source_url: detail.source_url ?? '',
    description: detail.description ?? '',
    ranking: detail.ranking,
    ranking_label: detail.ranking_label ?? '',
    uniranks_kz_rank: detail.uniranks_kz_rank,
    uniranks_world_rank: detail.uniranks_world_rank,
    uniranks_note: detail.uniranks_note ?? '',
  };
}

const LOCK_REASON =
  'Значение задано вручную. Сиды и бэкфиллы при следующем деплое его не перезапишут.';

export default function AdminUniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const [detail, setDetail] = useState<AdminUniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getUniversity(universityId!);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setLoadError('Не удалось загрузить университет');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [universityId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminUniversityDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (patch) => {
      const updated = await adminApi.updateUniversity(universityId!, patch as AdminUniversityUpdateRequest);
      setDetail(updated);
      return updated;
    },
  });

  // До ранних return'ов: хук обязан вызываться на каждом рендере, иначе после
  // загрузки данных число хуков меняется и React роняет экран.
  const { fieldRelease, error: releaseError } = useLockRelease<AdminUniversityDetail>({
    kind: 'university',
    id: detail?.id,
    lockedFields: detail?.admin_locked_fields ?? [],
    dirty,
    onReleased: setDetail,
  });

  if (loading) return <AdminLoading label="Загрузка университета" />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || 'Университет не найден'} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(detail.admin_locked_fields);

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: 'Университеты', to: listReturnPath('/admin/universities') }, { label: detail.name }]}
        title={detail.name}
        meta={`${detail.slug} · ${pluralize(detail.programs.length, 'программа', 'программы', 'программ')}`}
        actions={
          detail.website ? (
            <a
              href={detail.website}
              target="_blank"
              rel="noreferrer"
              className={cn(MONO_LABEL, 'inline-flex items-center gap-1.5 text-brand hover:underline')}
            >
              Сайт вуза
              <ExternalLink size={12} />
            </a>
          ) : null
        }
      />

      {releaseError && <AdminError message={releaseError} />}

      <AdminCard title="Основное">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label="Название" locked={locked.has('name')} revert={fieldRelease('name')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input id={id} className={ADMIN_INPUT} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            )}
          </AdminField>
          <AdminField
            label="Короткое имя"
            locked={locked.has('short_name')} revert={fieldRelease('short_name')}
            lockReason={LOCK_REASON}
            hint="Аббревиатура для карточек и списков."
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.short_name}
                onChange={(e) => setField('short_name', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Город" locked={locked.has('city')} revert={fieldRelease('city')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input id={id} className={ADMIN_INPUT} value={form.city} onChange={(e) => setField('city', e.target.value)} />
            )}
          </AdminField>
          <AdminField label="Страна" locked={locked.has('country')} revert={fieldRelease('country')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Адрес" locked={locked.has('location')} revert={fieldRelease('location')} lockReason={LOCK_REASON} className="sm:col-span-2">
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Сайт" locked={locked.has('website')} revert={fieldRelease('website')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                type="url"
                className={ADMIN_INPUT}
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField
            label="Источник"
            locked={locked.has('source_url')} revert={fieldRelease('source_url')}
            lockReason={LOCK_REASON}
            hint="Откуда взяты данные — для проверки следующим редактором."
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                type="url"
                className={ADMIN_INPUT}
                value={form.source_url}
                onChange={(e) => setField('source_url', e.target.value)}
              />
            )}
          </AdminField>
        </div>

        <AdminField
          label="Алиасы"
          locked={locked.has('aliases')} revert={fieldRelease('aliases')}
          lockReason={LOCK_REASON}
          hint="Другие названия вуза. На поиск в этой админке пока не влияют — только на сопоставление данных."
        >
          <StringListEditor
            values={form.aliases}
            onChange={(v) => setField('aliases', v)}
            placeholder="Например, КазНУ"
          />
        </AdminField>

        <AdminField label="Описание" locked={locked.has('description')} revert={fieldRelease('description')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={ADMIN_TEXTAREA}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          )}
        </AdminField>
      </AdminCard>

      <AdminCard
        title="Рейтинги"
        description="Пустое поле означает «не проверяли». Если вуза в рейтинге нет — так и напишите в примечании, иначе следующий редактор будет искать заново."
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <NumberField
            label="Рейтинг (национальный)"
            locked={locked.has('ranking')} revert={fieldRelease('ranking')}
            value={form.ranking}
            onChange={(v) => setField('ranking', v)}
          />
          <AdminField label="Подпись рейтинга" locked={locked.has('ranking_label')} revert={fieldRelease('ranking_label')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.ranking_label}
                onChange={(e) => setField('ranking_label', e.target.value)}
              />
            )}
          </AdminField>
          <NumberField
            label="Uniranks KZ"
            locked={locked.has('uniranks_kz_rank')} revert={fieldRelease('uniranks_kz_rank')}
            value={form.uniranks_kz_rank}
            onChange={(v) => setField('uniranks_kz_rank', v)}
          />
          <NumberField
            label="Uniranks World"
            locked={locked.has('uniranks_world_rank')} revert={fieldRelease('uniranks_world_rank')}
            value={form.uniranks_world_rank}
            onChange={(v) => setField('uniranks_world_rank', v)}
          />
          <AdminField
            label="Примечание Uniranks"
            locked={locked.has('uniranks_note')} revert={fieldRelease('uniranks_note')}
            lockReason={LOCK_REASON}
            className="sm:col-span-2"
            hint='Например: «Н/Р» — проверено, в рейтинге не найден.'
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.uniranks_note}
                onChange={(e) => setField('uniranks_note', e.target.value)}
              />
            )}
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Программы"
        description="Добавление и удаление программ в админке недоступно — только правка существующих."
        aside={<span className={MONO_MUTE}>{detail.programs.length}</span>}
      >
        {detail.programs.length === 0 ? (
          <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>У этого вуза пока нет программ.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted font-medium')}>Программа</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted font-medium')}>Язык</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted font-medium')}>
                    Стоимость / год
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.programs.map((program) => (
                  <tr key={program.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'align-top')}>
                      <Link
                        to={`/admin/programs/${program.id}`}
                        className="font-medium text-primary hover:text-brand hover:underline"
                      >
                        {program.name}
                      </Link>
                    </td>
                    <td className={cn(ADMIN_CELL, 'text-secondary align-top')}>
                      {program.language ?? <span className={MONO_MUTE}>—</span>}
                    </td>
                    <td className={cn(ADMIN_CELL, 'align-top text-right font-mono text-mono-sm text-secondary tabular-nums')}>
                      {program.cost_label ??
                        (program.cost_per_year != null
                          ? `${program.cost_per_year.toLocaleString('ru-RU')} ₸`
                          : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <p className={cn(MONO_MUTE, 'normal-case tracking-normal')}>
        Создан {new Date(detail.created_at).toLocaleDateString('ru-RU')}
        {detail.updated_at ? ` · обновлён ${new Date(detail.updated_at).toLocaleDateString('ru-RU')}` : ''}
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
      />
    </>
  );
}

/**
 * Ranking inputs accept a whole number or nothing. The previous version parsed
 * with `parseInt` and fell back to `null` on anything unparseable, so typing
 * "12а" silently cleared a rank instead of reporting the typo.
 */
function NumberField({
  label,
  locked,
  revert,
  value,
  onChange,
}: {
  label: string;
  locked: boolean;
  revert?: AdminFieldRevert;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(value == null ? '' : String(value));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) setDraft(value == null ? '' : String(value));
  }, [value, touched]);

  const invalid = draft.trim() !== '' && !/^\d+$/.test(draft.trim());

  return (
    <AdminField
      label={label}
      locked={locked}
      revert={revert}
      lockReason={LOCK_REASON}
      error={invalid ? 'Только целое число или пусто.' : undefined}
    >
      {({ id, invalid: fieldInvalid, describedBy }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          inputMode="numeric"
          aria-invalid={fieldInvalid}
          className={cn(ADMIN_INPUT, 'tabular-nums', fieldInvalid && 'border-danger')}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setTouched(true);
            setDraft(next);
            if (next.trim() === '') onChange(null);
            else if (/^\d+$/.test(next.trim())) onChange(Number.parseInt(next, 10));
          }}
          onBlur={() => setTouched(false)}
        />
      )}
    </AdminField>
  );
}
