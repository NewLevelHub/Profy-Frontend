import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/i18n/format';
import { useParams } from 'react-router';
import { AlertTriangle, Check } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar, type SaveState } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_TEXT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminProgramDetail, AdminProgramUpdateRequest } from '@/shared/types';

const SIMPLE_KEYS = [
  'name',
  'language',
  'cost_per_year',
  'cost_label',
  'description',
  'who_its_for',
  'source_url',
] as const satisfies readonly (keyof AdminProgramUpdateRequest)[];

const SIMPLE_LABELS: Record<(typeof SIMPLE_KEYS)[number], string> = {
  name: 'admin:prog.field.name',
  language: 'admin:prog.field.language',
  cost_per_year: 'admin:prog.field.cost',
  cost_label: 'admin:prog.field.costLabel',
  description: 'admin:prog.field.description',
  who_its_for: 'admin:prog.field.whoItsFor',
  source_url: 'admin:prog.field.source',
};

interface SimpleForm {
  name: string;
  language: string;
  cost_per_year: number | null;
  cost_label: string;
  description: string;
  who_its_for: string;
  source_url: string;
}

interface RequirementsForm {
  needs_portfolio: boolean;
  needs_essay: boolean;
  needs_recommendations: boolean;
  needs_interview: boolean;
  exams: string[];
  notes: string[];
}

const REQUIREMENTS_KEYS = [
  'needs_portfolio',
  'needs_essay',
  'needs_recommendations',
  'needs_interview',
  'exams',
  'notes',
] as const satisfies readonly (keyof RequirementsForm)[];

interface DeadlinesForm {
  application_close: string;
}

function toSimpleForm(detail: AdminProgramDetail): SimpleForm {
  return {
    name: detail.name,
    language: detail.language ?? '',
    cost_per_year: detail.cost_per_year,
    cost_label: detail.cost_label ?? '',
    description: detail.description ?? '',
    who_its_for: detail.who_its_for ?? '',
    source_url: detail.source_url ?? '',
  };
}

function toRequirementsForm(requirements: Record<string, unknown>): RequirementsForm {
  return {
    needs_portfolio: Boolean(requirements.needs_portfolio),
    needs_essay: Boolean(requirements.needs_essay),
    needs_recommendations: Boolean(requirements.needs_recommendations),
    needs_interview: Boolean(requirements.needs_interview),
    exams: Array.isArray(requirements.exams) ? (requirements.exams as string[]) : [],
    notes: Array.isArray(requirements.notes) ? (requirements.notes as string[]) : [],
  };
}

function toDeadlinesForm(deadlines: Record<string, unknown>): DeadlinesForm {
  return {
    application_close: typeof deadlines.application_close === 'string' ? deadlines.application_close : '',
  };
}

const LOCK_REASON = 'admin:uni.lockReason';

export default function AdminProgramDetailPage() {
  const { t } = useTranslation('admin');
  const { programId } = useParams<{ programId: string }>();
  const [detail, setDetail] = useState<AdminProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [initialSimple, setInitialSimple] = useState<SimpleForm | null>(null);
  const [simple, setSimple] = useState<SimpleForm | null>(null);
  const [initialReq, setInitialReq] = useState<RequirementsForm | null>(null);
  const [req, setReq] = useState<RequirementsForm | null>(null);
  const [initialDeadlines, setInitialDeadlines] = useState<DeadlinesForm | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlinesForm | null>(null);
  const [initialGrantsText, setInitialGrantsText] = useState('');
  const [grantsText, setGrantsText] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' });

  function hydrate(data: AdminProgramDetail) {
    setDetail(data);

    const simpleState = toSimpleForm(data);
    setInitialSimple(simpleState);
    setSimple(simpleState);

    const reqState = toRequirementsForm(data.requirements);
    setInitialReq(reqState);
    setReq(reqState);

    const deadlinesState = toDeadlinesForm(data.deadlines);
    setInitialDeadlines(deadlinesState);
    setDeadlines(deadlinesState);

    const grantsJson = JSON.stringify(data.grants, null, 2);
    setInitialGrantsText(grantsJson);
    setGrantsText(grantsJson);
  }

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getProgram(programId!);
        if (!cancelled) hydrate(data);
      } catch {
        if (!cancelled) setLoadError(t('prog.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [programId, reloadToken]);

  const simplePatch = useMemo(
    () => (initialSimple && simple ? buildPatchBody(initialSimple, simple, SIMPLE_KEYS) : {}),
    [initialSimple, simple],
  );
  const reqPatch = useMemo(
    () => (initialReq && req ? buildPatchBody(initialReq, req, REQUIREMENTS_KEYS) : {}),
    [initialReq, req],
  );
  const deadlinesPatch = useMemo(
    () =>
      initialDeadlines && deadlines
        ? buildPatchBody(initialDeadlines, deadlines, ['application_close'] as const)
        : {},
    [initialDeadlines, deadlines],
  );
  const grantsDirty = grantsText !== initialGrantsText;

  const grantsError = useMemo(() => validateGrants(grantsText, t), [grantsText, t]);

  const changedLabels = [
    ...(Object.keys(simplePatch) as (keyof SimpleForm)[]).map((key) => SIMPLE_LABELS[key]),
    ...(Object.keys(reqPatch).length > 0 ? [t('prog.group.requirements')] : []),
    ...(Object.keys(deadlinesPatch).length > 0 ? [t('prog.group.deadlines')] : []),
    ...(grantsDirty ? [t('prog.group.grants')] : []),
  ];
  const dirty = changedLabels.length > 0;

  useUnsavedGuard(dirty);

  if (loading) return <AdminLoading label={t('prog.loading')} />;
  if (loadError || !detail || !simple || !req || !deadlines) {
    return <AdminError message={loadError || t('prog.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(detail.admin_locked_fields);

  function setSimpleField<K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) {
    setSimple((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function setReqField<K extends keyof RequirementsForm>(key: K, value: RequirementsForm[K]) {
    setReq((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleReset() {
    if (detail) hydrate(detail);
    setSaveState({ kind: 'idle' });
  }

  async function handleSave() {
    if (!programId || !detail || !req || !deadlines) return;

    const patch: AdminProgramUpdateRequest = { ...simplePatch };

    // `requirements`/`deadlines` are whole-object replaces on the backend, so
    // the original object is merged under the edited subset — keys this form
    // doesn't render (admission_scores_2026 and friends) must survive a save.
    if (Object.keys(reqPatch).length > 0) patch.requirements = { ...detail.requirements, ...req };
    if (Object.keys(deadlinesPatch).length > 0) patch.deadlines = { ...detail.deadlines, ...deadlines };
    if (grantsDirty) {
      if (grantsError) {
        setSaveState({ kind: 'error', message: grantsError });
        return;
      }
      patch.grants = JSON.parse(grantsText);
    }

    setSaving(true);
    setSaveState({ kind: 'idle' });
    try {
      const updated = await adminApi.updateProgram(programId, patch);
      hydrate(updated);
      setSaveState({ kind: 'saved' });
    } catch {
      setSaveState({ kind: 'error', message: t('form.saveError') });
    } finally {
      setSaving(false);
    }
  }

  const untouchedRequirementKeys = Object.keys(detail.requirements).filter(
    (key) => !REQUIREMENTS_KEYS.includes(key as never),
  );
  const untouchedDeadlineKeys = Object.keys(detail.deadlines).filter((key) => key !== 'application_close');

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: t('nav.universities'), to: listReturnPath('/admin/universities') },
          { label: detail.university.name, to: `/admin/universities/${detail.university.id}` },
          { label: detail.name },
        ]}
        title={detail.name}
        meta={detail.university.name}
      />

      <AdminCard title={t('directions.mainCard')}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label={t('directions.field.nameLabel')} locked={locked.has('name')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={simple.name}
                onChange={(e) => setSimpleField('name', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label={t('prog.field.languageLabel')} locked={locked.has('language')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={simple.language}
                onChange={(e) => setSimpleField('language', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField
            label={t('prog.field.costLabelLabel')}
            locked={locked.has('cost_per_year')}
            lockReason={LOCK_REASON}
            hint={t('prog.costHint')}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                inputMode="decimal"
                className={cn(ADMIN_INPUT, 'tabular-nums')}
                value={simple.cost_per_year ?? ''}
                onChange={(e) => setSimpleField('cost_per_year', toFloatOrNull(e.target.value))}
              />
            )}
          </AdminField>
          <AdminField
            label={t('prog.field.costCaptionLabel')}
            locked={locked.has('cost_label')}
            lockReason={LOCK_REASON}
            hint={t('prog.costCaptionHint')}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={simple.cost_label}
                onChange={(e) => setSimpleField('cost_label', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField
            label={t('uni.field.sourceLabel')}
            locked={locked.has('source_url')}
            lockReason={LOCK_REASON}
            className="sm:col-span-2"
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                type="url"
                className={ADMIN_INPUT}
                value={simple.source_url}
                onChange={(e) => setSimpleField('source_url', e.target.value)}
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
              value={simple.description}
              onChange={(e) => setSimpleField('description', e.target.value)}
            />
          )}
        </AdminField>
        <AdminField label={t('prog.field.whoItsForLabel')} locked={locked.has('who_its_for')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={ADMIN_TEXTAREA}
              value={simple.who_its_for}
              onChange={(e) => setSimpleField('who_its_for', e.target.value)}
            />
          )}
        </AdminField>
      </AdminCard>

      <AdminCard
        title={t('prog.requirementsCard')}
        aside={locked.has('requirements') ? <span className={cn(MONO_LABEL, 'text-brand')}>{t('prog.setManually')}</span> : null}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <RequirementCheckbox
            label={t('prog.needsPortfolio')}
            checked={req.needs_portfolio}
            onChange={(v) => setReqField('needs_portfolio', v)}
          />
          <RequirementCheckbox
            label={t('prog.needsEssay')}
            checked={req.needs_essay}
            onChange={(v) => setReqField('needs_essay', v)}
          />
          <RequirementCheckbox
            label={t('prog.needsRecommendations')}
            checked={req.needs_recommendations}
            onChange={(v) => setReqField('needs_recommendations', v)}
          />
          <RequirementCheckbox
            label={t('prog.needsInterview')}
            checked={req.needs_interview}
            onChange={(v) => setReqField('needs_interview', v)}
          />
        </div>

        <AdminField label={t('prog.exams')}>
          <StringListEditor
            values={req.exams}
            onChange={(v) => setReqField('exams', v)}
            placeholder={t('directions.subjectsPlaceholder')}
          />
        </AdminField>
        <AdminField label={t('prog.notes')}>
          <StringListEditor
            values={req.notes}
            onChange={(v) => setReqField('notes', v)}
            placeholder={t('prog.freeText')}
          />
        </AdminField>

        {untouchedRequirementKeys.length > 0 && (
          <UnmanagedKeys title={t('prog.otherRequirementFields')} keys={untouchedRequirementKeys} />
        )}
      </AdminCard>

      <AdminCard title={t('prog.deadlinesCard')}>
        <AdminField
          label={t('prog.applicationClose')}
          locked={locked.has('deadlines')}
          lockReason={LOCK_REASON}
          className="max-w-[240px]"
        >
          {({ id, describedBy }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              type="date"
              className={ADMIN_INPUT}
              value={deadlines.application_close}
              onChange={(e) => setDeadlines({ application_close: e.target.value })}
            />
          )}
        </AdminField>

        {untouchedDeadlineKeys.length > 0 && (
          <UnmanagedKeys title={t('prog.otherDeadlineFields')} keys={untouchedDeadlineKeys} />
        )}
      </AdminCard>

      <AdminCard
        title={t('prog.grantsCard')}
        description={t('prog.grantsDescription')}
        aside={locked.has('grants') ? <span className={cn(MONO_LABEL, 'text-brand')}>{t('prog.setManually')}</span> : null}
      >
        <textarea
          className={cn(
            ADMIN_TEXTAREA,
            'font-mono text-mono-sm min-h-[160px]',
            grantsError && 'border-danger',
          )}
          value={grantsText}
          onChange={(e) => setGrantsText(e.target.value)}
          spellCheck={false}
          aria-invalid={Boolean(grantsError)}
          aria-label={t('prog.grantsJsonAria')}
        />
        {grantsError ? (
          <p className={cn(ADMIN_TEXT, 'flex items-start gap-1.5 text-danger m-0')}>
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
            {grantsError}
          </p>
        ) : (
          <p className={cn(ADMIN_TEXT, 'flex items-center gap-1.5 text-muted m-0')}>
            <Check size={13} className="text-brand flex-shrink-0" />
            {t('prog.jsonValid')}{grantsDirty ? t('prog.jsonUnsaved') : ''}
          </p>
        )}
      </AdminCard>

      <p className={cn(MONO_MUTE, 'normal-case tracking-normal')}>
        {t('prog.createdOn', { date: formatDate(detail.created_at) })}
        {detail.updated_at ? t('prog.updatedOn', { date: formatDate(detail.updated_at) }) : ''}
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={handleSave}
        onReset={handleReset}
        state={saveState}
        locksOnSave
        blockedReason={grantsDirty && grantsError ? t('prog.grantsBlocked', { error: grantsError }) : null}
      />
    </>
  );
}

/**
 * Keys the API returns inside `requirements`/`deadlines` that this form has no
 * editor for. They are preserved on save by merging, but that was previously
 * stated in a footnote in mono caps — an admin had no way to know what else
 * lived in the object they were about to replace.
 */
function UnmanagedKeys({ title, keys }: { title: string; keys: string[] }) {
  const { t } = useTranslation('admin');
  return (
    <div className="border border-default rounded-[3px] p-2.5 bg-page">
      <p className={cn(MONO_LABEL, 'text-muted mb-1.5')}>{title}</p>
      <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>
        {t('prog.unmanagedNote')}{' '}
        <span className="font-mono text-mono-xs text-secondary">{keys.join(', ')}</span>
      </p>
    </div>
  );
}

function RequirementCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={cn(ADMIN_TEXT, 'flex items-center gap-2 text-primary cursor-pointer select-none')}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--brand)] w-3.5 h-3.5"
      />
      {label}
    </label>
  );
}

function toFloatOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Syntax check only — the grant entry shape isn't documented in the API
 * contract (docs/admin-backend-requests-pro-242.md §8), so a structured editor
 * would have to guess at fields and could corrupt real entries. What it CAN
 * check honestly: the text parses, and it is a list.
 */
function validateGrants(text: string, t: (key: string, opts?: Record<string, unknown>) => string): string | null {
  if (text.trim() === '') return t('prog.grantsEmpty');
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return t('prog.grantsNotArray');
    return null;
  } catch (error) {
    return error instanceof Error ? t('prog.grantsBadJson', { message: error.message }) : t('prog.grantsBadJsonShort');
  }
}
