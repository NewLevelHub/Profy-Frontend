import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
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
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import type { AdminDirectionDetail, AdminDirectionUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'name',
  'holland_code',
  'description',
  'professions',
  'skills_needed',
  'subjects_to_develop',
  'first_steps',
] as const satisfies readonly (keyof AdminDirectionUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  name: 'admin:directions.field.name',
  holland_code: 'Holland code',
  description: 'admin:directions.field.description',
  professions: 'admin:directions.field.professions',
  skills_needed: 'admin:directions.field.skills',
  subjects_to_develop: 'admin:directions.field.subjects',
  first_steps: 'admin:directions.field.firstSteps',
};

interface FormState {
  name: string;
  holland_code: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}

function toFormState(detail: AdminDirectionDetail): FormState {
  return {
    name: detail.name,
    holland_code: detail.holland_code,
    description: detail.description,
    professions: detail.professions,
    skills_needed: detail.skills_needed,
    subjects_to_develop: detail.subjects_to_develop,
    first_steps: detail.first_steps,
  };
}

const LOCK_REASON =
  'admin:common.lockReason';

const HOLLAND_LETTERS = 'RIASEC';

/**
 * A Holland code is a sequence of the six RIASEC letters, most-dominant first.
 * The field was a free text input: "XYZ" saved happily and then matched no
 * assessment result, silently taking the direction out of every recommendation.
 */
function validateHollandCode(code: string, t: (key: string, opts?: Record<string, unknown>) => string): string | undefined {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return t('directions.codeRequired');
  const invalid = [...trimmed].filter((letter) => !HOLLAND_LETTERS.includes(letter));
  if (invalid.length > 0) {
    return t('directions.codeInvalid', { letters: [...new Set(invalid)].join(', ') });
  }
  if (new Set(trimmed).size !== trimmed.length) return t('directions.codeDuplicate');
  return undefined;
}

export default function AdminDirectionDetailPage() {
  const { t } = useTranslation('admin');
  const { directionId } = useParams<{ directionId: string }>();
  const [detail, setDetail] = useState<AdminDirectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!directionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getDirection(directionId!);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setLoadError(t('directions.loadOneError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [directionId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, patch, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminDirectionDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (nextPatch) => {
      const updated = await adminApi.updateDirection(directionId!, nextPatch as AdminDirectionUpdateRequest);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label={t('directions.loadingOne')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('directions.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));
  const hollandError = validateHollandCode(form.holland_code, t);
  const nameChanged = 'name' in patch;
  const catalogEmpty =
    form.professions.length === 0 &&
    form.skills_needed.length === 0 &&
    form.subjects_to_develop.length === 0 &&
    form.first_steps.length === 0;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: t('directions.title'), to: listReturnPath('/admin/content/directions') }, { label: detail.name }]}
        title={detail.name}
        meta={
          <span className="flex items-center gap-2">
            <LocaleBadge locale={detail.locale} />
            {`${detail.holland_code} · ${detail.slug}`}
          </span>
        }
      />

      <AdminCard title={t('directions.mainCard')} description={t('directions.mainDescription')}>
        <div className="grid gap-3.5 sm:grid-cols-[1fr_200px]">
          <AdminField
            label={t('directions.field.nameLabel')}
            locked={locked.has('name')}
            lockReason={LOCK_REASON}
            hint={
              nameChanged ? (
                <>
                  {t('directions.slugStays')}{' '}
                  <span className="font-mono text-mono-xs">{detail.slug}</span>{t('directions.slugStaysTail')}
                </>
              ) : undefined
            }
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            )}
          </AdminField>

          <AdminField
            label="Holland code"
            locked={locked.has('holland_code')}
            lockReason={LOCK_REASON}
            error={hollandError}
            hint={hollandError ? undefined : t('directions.codeHintShort')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={cn(ADMIN_INPUT, 'font-mono tracking-widest uppercase', invalid && 'border-danger')}
                value={form.holland_code}
                onChange={(e) => setField('holland_code', e.target.value.toUpperCase())}
                maxLength={6}
              />
            )}
          </AdminField>
        </div>

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
        title={t('directions.catalogCard')}
        description={
          catalogEmpty
            ? t('directions.catalogEmpty')
            : t('directions.catalogFilled')
        }
      >
        <AdminField label={t('directions.field.professionsLabel')} locked={locked.has('professions')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.professions}
            onChange={(v) => setField('professions', v)}
            placeholder={t('directions.professionsPlaceholder')}
            emptyNote={t('directions.professionsEmptyNote')}
          />
        </AdminField>

        <AdminField label={t('directions.field.skillsLabel')} locked={locked.has('skills_needed')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.skills_needed}
            onChange={(v) => setField('skills_needed', v)}
            placeholder={t('directions.skillsPlaceholder')}
          />
        </AdminField>

        <AdminField label={t('directions.field.subjectsLabel')} locked={locked.has('subjects_to_develop')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.subjects_to_develop}
            onChange={(v) => setField('subjects_to_develop', v)}
            placeholder={t('directions.subjectsPlaceholder')}
          />
        </AdminField>

        <AdminField
          label={t('directions.field.firstStepsLabel')}
          locked={locked.has('first_steps')}
          lockReason={LOCK_REASON}
          hint={t('directions.firstStepsHint')}
        >
          {/* `ordered` here and not on the lists above: the other three are
              sets, this one is a sequence the student follows. */}
          <StringListEditor
            ordered
            values={form.first_steps}
            onChange={(v) => setField('first_steps', v)}
            placeholder={t('directions.firstStepsPlaceholder')}
          />
        </AdminField>
      </AdminCard>

      <p className={ADMIN_META}>
        {t('directions.slugNote', { slug: detail.slug })}
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
        blockedReason={hollandError && 'holland_code' in patch ? `Holland code: ${hollandError}` : null}
      />
    </>
  );
}
