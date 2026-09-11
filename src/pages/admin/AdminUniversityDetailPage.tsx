import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/shared/i18n/format';
import { Link, useParams } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
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
  name: 'admin:uni.field.name',
  short_name: 'admin:uni.field.shortName',
  aliases: 'admin:uni.field.aliases',
  city: 'admin:uni.field.city',
  country: 'admin:uni.field.country',
  location: 'admin:uni.field.location',
  website: 'admin:uni.field.website',
  source_url: 'admin:uni.field.source',
  description: 'admin:uni.field.description',
  ranking: 'admin:uni.field.ranking',
  ranking_label: 'admin:uni.field.rankingLabel',
  uniranks_kz_rank: 'Uniranks KZ',
  uniranks_world_rank: 'Uniranks World',
  uniranks_note: 'admin:uni.field.uniranksNote',
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
  'admin:uni.lockReason';

export default function AdminUniversityDetailPage() {
  const { t } = useTranslation('admin');
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
        if (!cancelled) setLoadError(t('uni.loadError'));
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

  if (loading) return <AdminLoading label={t('uni.loading')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('uni.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(detail.admin_locked_fields);

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: t('nav.universities'), to: listReturnPath('/admin/universities') }, { label: detail.name }]}
        title={detail.name}
        meta={`${detail.slug} · ${t('uni.programCount', { count: detail.programs.length })}`}
        actions={
          detail.website ? (
            <a
              href={detail.website}
              target="_blank"
              rel="noreferrer"
              className={cn(MONO_LABEL, 'inline-flex items-center gap-1.5 text-brand hover:underline')}
            >
              {t('uni.websiteLink')}
              <ExternalLink size={12} />
            </a>
          ) : null
        }
      />

      <AdminCard title={t('directions.mainCard')}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label={t('directions.field.nameLabel')} locked={locked.has('name')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input id={id} className={ADMIN_INPUT} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            )}
          </AdminField>
          <AdminField
            label={t('uni.field.shortNameLabel')}
            locked={locked.has('short_name')}
            lockReason={LOCK_REASON}
            hint={t('uni.shortNameHint')}
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
          <AdminField label={t('universities.col.city')} locked={locked.has('city')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input id={id} className={ADMIN_INPUT} value={form.city} onChange={(e) => setField('city', e.target.value)} />
            )}
          </AdminField>
          <AdminField label={t('universities.col.country')} locked={locked.has('country')} lockReason={LOCK_REASON}>
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
          <AdminField label={t('uni.field.locationLabel')} locked={locked.has('location')} lockReason={LOCK_REASON} className="sm:col-span-2">
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
          <AdminField label={t('uni.field.websiteLabel')} locked={locked.has('website')} lockReason={LOCK_REASON}>
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
            label={t('uni.field.sourceLabel')}
            locked={locked.has('source_url')}
            lockReason={LOCK_REASON}
            hint={t('uni.sourceHint')}
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
          label={t('uni.field.aliasesLabel')}
          locked={locked.has('aliases')}
          lockReason={LOCK_REASON}
          hint={t('uni.aliasesHint')}
        >
          <StringListEditor
            values={form.aliases}
            onChange={(v) => setField('aliases', v)}
            placeholder={t('uni.aliasesPlaceholder')}
          />
        </AdminField>

        <AdminField label={t('directions.field.descriptionLabel')} locked={locked.has('description')} lockReason={LOCK_REASON}>
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
        title={t('uni.rankingsCard')}
        description={t('uni.rankingsDescription')}
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <NumberField
            label={t('uni.field.rankingLabelNational')}
            locked={locked.has('ranking')}
            value={form.ranking}
            onChange={(v) => setField('ranking', v)}
          />
          <AdminField label={t('uni.field.rankingLabelLabel')} locked={locked.has('ranking_label')} lockReason={LOCK_REASON}>
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
            locked={locked.has('uniranks_kz_rank')}
            value={form.uniranks_kz_rank}
            onChange={(v) => setField('uniranks_kz_rank', v)}
          />
          <NumberField
            label="Uniranks World"
            locked={locked.has('uniranks_world_rank')}
            value={form.uniranks_world_rank}
            onChange={(v) => setField('uniranks_world_rank', v)}
          />
          <AdminField
            label={t('uni.field.uniranksNoteLabel')}
            locked={locked.has('uniranks_note')}
            lockReason={LOCK_REASON}
            className="sm:col-span-2"
            hint={t('uni.uniranksNoteHint')}
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
        title={t('uni.programsCard')}
        description={t('uni.programsDescription')}
        aside={<span className={MONO_MUTE}>{detail.programs.length}</span>}
      >
        {detail.programs.length === 0 ? (
          <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>{t('uni.noPrograms')}</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted font-medium')}>{t('uni.programCol')}</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted font-medium')}>{t('uni.languageCol')}</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted font-medium')}>
                    {t('uni.costPerYear')}
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
                          ? `${formatNumber(program.cost_per_year)} ₸`
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
        {t('uni.createdOn', { date: formatDate(detail.created_at) })}
        {detail.updated_at ? t('uni.updatedOn', { date: formatDate(detail.updated_at) }) : ''}
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
  value,
  onChange,
}: {
  label: string;
  locked: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useTranslation('admin');
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
      lockReason={LOCK_REASON}
      error={invalid ? t('uni.integerOnly') : undefined}
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
