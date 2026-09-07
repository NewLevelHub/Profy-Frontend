import { useEffect, useMemo, useState } from 'react';
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
import { useLockRelease } from './useLockRelease';
import { AdminSaveBar, type SaveState } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_TEXT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type {
  AdminProgramDetail,
  AdminProgramGrant,
  AdminProgramUpdateRequest,
} from '@/shared/types';

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
  name: 'название',
  language: 'язык обучения',
  cost_per_year: 'стоимость',
  cost_label: 'подпись стоимости',
  description: 'описание',
  who_its_for: 'кому подходит',
  source_url: 'источник',
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

const LOCK_REASON = 'Значение задано вручную. Сиды и бэкфиллы при следующем деплое его не перезапишут.';

export default function AdminProgramDetailPage() {
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
  const [initialGrants, setInitialGrants] = useState<AdminProgramGrant[]>([]);
  const [grants, setGrants] = useState<AdminProgramGrant[]>([]);

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

    setInitialGrants(data.grants);
    setGrants(data.grants);
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
        if (!cancelled) setLoadError('Не удалось загрузить программу');
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
  const grantsDirty = JSON.stringify(grants) !== JSON.stringify(initialGrants);

  const grantsError = useMemo(() => validateGrants(grants), [grants]);

  const changedLabels = [
    ...(Object.keys(simplePatch) as (keyof SimpleForm)[]).map((key) => SIMPLE_LABELS[key]),
    ...(Object.keys(reqPatch).length > 0 ? ['требования'] : []),
    ...(Object.keys(deadlinesPatch).length > 0 ? ['дедлайны'] : []),
    ...(grantsDirty ? ['гранты'] : []),
  ];
  const dirty = changedLabels.length > 0;

  useUnsavedGuard(dirty);

  // До ранних return'ов: хук обязан вызываться на каждом рендере, иначе после
  // загрузки данных число хуков меняется и React роняет экран.
  const { fieldRelease, error: releaseError } = useLockRelease<AdminProgramDetail>({
    kind: 'program',
    id: detail?.id,
    lockedFields: detail?.admin_locked_fields ?? [],
    dirty,
    onReleased: setDetail,
  });

  if (loading) return <AdminLoading label="Загрузка программы" />;
  if (loadError || !detail || !simple || !req || !deadlines) {
    return <AdminError message={loadError || 'Программа не найдена'} onRetry={() => setReloadToken((t) => t + 1)} />;
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
      patch.grants = grants;
    }

    setSaving(true);
    setSaveState({ kind: 'idle' });
    try {
      const updated = await adminApi.updateProgram(programId, patch);
      hydrate(updated);
      setSaveState({ kind: 'saved' });
    } catch {
      setSaveState({ kind: 'error', message: 'Не удалось сохранить изменения' });
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
          { label: 'Университеты', to: listReturnPath('/admin/universities') },
          { label: detail.university.name, to: `/admin/universities/${detail.university.id}` },
          { label: detail.name },
        ]}
        title={detail.name}
        meta={detail.university.name}
      />

      {releaseError && <AdminError message={releaseError} />}

      <AdminCard title="Основное">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label="Название" locked={locked.has('name')} revert={fieldRelease('name')} lockReason={LOCK_REASON}>
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
          <AdminField label="Язык обучения" locked={locked.has('language')} revert={fieldRelease('language')} lockReason={LOCK_REASON}>
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
            label="Стоимость за год, ₸"
            locked={locked.has('cost_per_year')} revert={fieldRelease('cost_per_year')}
            lockReason={LOCK_REASON}
            hint="Число для фильтров и сравнения."
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
            label="Подпись стоимости"
            locked={locked.has('cost_label')} revert={fieldRelease('cost_label')}
            lockReason={LOCK_REASON}
            hint="Показывается ученику вместо числа: «бесплатно», «по гранту»."
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
            label="Источник"
            locked={locked.has('source_url')} revert={fieldRelease('source_url')}
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

        <AdminField label="Описание" locked={locked.has('description')} revert={fieldRelease('description')} lockReason={LOCK_REASON}>
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
        <AdminField label="Кому подходит" locked={locked.has('who_its_for')} revert={fieldRelease('who_its_for')} lockReason={LOCK_REASON}>
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
        title="Требования к поступлению"
        aside={locked.has('requirements') ? <span className={cn(MONO_LABEL, 'text-brand')}>Задано вручную</span> : null}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <RequirementCheckbox
            label="Нужно портфолио"
            checked={req.needs_portfolio}
            onChange={(v) => setReqField('needs_portfolio', v)}
          />
          <RequirementCheckbox
            label="Нужно эссе"
            checked={req.needs_essay}
            onChange={(v) => setReqField('needs_essay', v)}
          />
          <RequirementCheckbox
            label="Нужны рекомендации"
            checked={req.needs_recommendations}
            onChange={(v) => setReqField('needs_recommendations', v)}
          />
          <RequirementCheckbox
            label="Нужно собеседование"
            checked={req.needs_interview}
            onChange={(v) => setReqField('needs_interview', v)}
          />
        </div>

        <AdminField label="Экзамены">
          <StringListEditor
            values={req.exams}
            onChange={(v) => setReqField('exams', v)}
            placeholder="Например, Математика"
          />
        </AdminField>
        <AdminField label="Примечания">
          <StringListEditor
            values={req.notes}
            onChange={(v) => setReqField('notes', v)}
            placeholder="Свободный текст"
          />
        </AdminField>

        {untouchedRequirementKeys.length > 0 && (
          <UnmanagedKeys title="Другие поля требований" keys={untouchedRequirementKeys} />
        )}
      </AdminCard>

      <AdminCard title="Дедлайны">
        <AdminField
          label="Окончание приёма заявок"
          locked={locked.has('deadlines')} revert={fieldRelease('deadlines')}
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
          <UnmanagedKeys title="Другие поля дедлайнов" keys={untouchedDeadlineKeys} />
        )}
      </AdminCard>

      <AdminCard
        title="Гранты"
        description="Стипендии и гранты программы. Название обязательно, сумма и условия — по желанию."
        aside={locked.has('grants') ? <span className={cn(MONO_LABEL, 'text-brand')}>Задано вручную</span> : null}
      >
        <GrantsEditor entries={grants} onChange={setGrants} error={grantsError} />
      </AdminCard>

      <p className={cn(MONO_MUTE, 'normal-case tracking-normal')}>
        Создана {new Date(detail.created_at).toLocaleDateString('ru-RU')}
        {detail.updated_at ? ` · обновлена ${new Date(detail.updated_at).toLocaleDateString('ru-RU')}` : ''}
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={handleSave}
        onReset={handleReset}
        state={saveState}
        locksOnSave
        blockedReason={grantsDirty && grantsError ? `Гранты: ${grantsError}` : null}
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
  return (
    <div className="border border-default rounded-[3px] p-2.5 bg-page">
      <p className={cn(MONO_LABEL, 'text-muted mb-1.5')}>{title}</p>
      <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>
        Здесь не редактируются, но сохраняются как есть:{' '}
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
/**
 * Название — единственное обязательное поле записи гранта, и это же
 * единственное, что реально лежит во всех живых данных.
 *
 * Раньше гранты правились как сырой JSON в textarea, потому что форма записи
 * не была описана нигде: одна опечатка — и сохранение падало, а при неудачной
 * структуре можно было молча испортить данные. Теперь форма зафиксирована в
 * схеме API, и проверять остаётся только заполненность.
 */
function validateGrants(entries: readonly AdminProgramGrant[]): string | null {
  const empty = entries.findIndex((entry) => !entry.name?.trim());
  return empty === -1 ? null : `У записи №${empty + 1} не заполнено название.`;
}

/**
 * Структурный редактор грантов вместо сырого JSON.
 *
 * Раньше это была textarea с JSON: одна опечатка — и сохранение падало, а при
 * неудачной структуре можно было молча записать то, что ниже по пайплайну
 * никто не прочитает. Форма записи теперь зафиксирована в схеме API
 * (`name` + необязательные `amount`/`conditions`), поэтому её можно править
 * полями.
 *
 * Незнакомые ключи не теряются: строка правится копией исходного объекта, а не
 * собирается заново из трёх полей — импортёр мог положить в запись поле, о
 * котором эта форма ещё не знает.
 */
function GrantsEditor({
  entries,
  onChange,
  error,
}: {
  entries: readonly AdminProgramGrant[];
  onChange: (next: AdminProgramGrant[]) => void;
  error: string | null;
}) {
  const patch = (index: number, field: 'name' | 'amount' | 'conditions', value: string) => {
    onChange(
      entries.map((entry, i) => {
        if (i !== index) return entry;
        if (value.trim() === '') {
          // Убрать ключ, а не записать null: сервер его не присылал, и запись
          // null сделала бы форму «грязной» навсегда — а сохранение записало
          // бы гранты в admin_locked_fields, выведя их из-под автообновления
          // без единой настоящей правки.
          const { [field]: _removed, ...rest } = entry;
          return rest as typeof entry;
        }
        return { ...entry, [field]: value };
      }),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>Грантов не указано.</p>
      ) : (
        entries.map((entry, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border border-default rounded-[3px] p-3 bg-raised"
          >
            <div className="flex items-start gap-2">
              <input
                className={cn(ADMIN_INPUT, 'flex-1', !entry.name?.trim() && 'border-danger')}
                value={entry.name ?? ''}
                placeholder="Название гранта"
                aria-label={`Название гранта ${index + 1}`}
                onChange={(e) => patch(index, 'name', e.target.value)}
              />
              <button
                type="button"
                onClick={() => onChange(entries.filter((_, i) => i !== index))}
                title="Удалить запись"
                className={cn(ADMIN_TEXT, 'px-2 py-1.5 rounded-[3px] text-muted hover:text-danger hover:bg-hover')}
              >
                Удалить
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={ADMIN_INPUT}
                value={entry.amount ?? ''}
                placeholder="Сумма (например, 1 200 000 ₸)"
                aria-label={`Сумма гранта ${index + 1}`}
                onChange={(e) => patch(index, 'amount', e.target.value)}
              />
              <input
                className={ADMIN_INPUT}
                value={entry.conditions ?? ''}
                placeholder="Условия получения"
                aria-label={`Условия гранта ${index + 1}`}
                onChange={(e) => patch(index, 'conditions', e.target.value)}
              />
            </div>
          </div>
        ))
      )}

      {error && (
        <p className={cn(ADMIN_TEXT, 'flex items-start gap-1.5 text-danger m-0')}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => onChange([...entries, { name: '' }])}
        className={cn(ADMIN_TEXT, 'self-start px-2 py-1 rounded-[3px] text-muted hover:text-primary hover:bg-hover')}
      >
        + Добавить грант
      </button>
    </div>
  );
}
