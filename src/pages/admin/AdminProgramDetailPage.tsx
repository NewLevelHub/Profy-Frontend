import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminSectionHeading } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
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

// Decoupled from `AdminProgramUpdateRequest`'s wire nullability, same
// reasoning as `AdminUniversityDetailPage`'s `FormState`.
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
  return { application_close: typeof deadlines.application_close === 'string' ? deadlines.application_close : '' };
}

function toFloatOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function RequirementCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-body-sm text-primary cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--brand)]" />
      {label}
    </label>
  );
}

export default function AdminProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const [detail, setDetail] = useState<AdminProgramDetail | null>(null);

  const [initialSimple, setInitialSimple] = useState<SimpleForm | null>(null);
  const [simple, setSimple] = useState<SimpleForm | null>(null);

  const [initialReq, setInitialReq] = useState<RequirementsForm | null>(null);
  const [req, setReq] = useState<RequirementsForm | null>(null);

  const [initialDeadlines, setInitialDeadlines] = useState<DeadlinesForm | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlinesForm | null>(null);

  const [initialGrantsText, setInitialGrantsText] = useState('');
  const [grantsText, setGrantsText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getProgram(programId!);
        if (cancelled) return;
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
      } catch {
        if (!cancelled) setError('Не удалось загрузить программу');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !simple || !initialSimple || !req || !initialReq || !deadlines || !initialDeadlines) {
    return <Card className="text-red-600 font-semibold">{error || 'Программа не найдена'}</Card>;
  }

  const locked = new Set(detail.admin_locked_fields);

  function setSimpleField<K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) {
    setSimple((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function setReqField<K extends keyof RequirementsForm>(key: K, value: RequirementsForm[K]) {
    setReq((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const simplePatch = buildPatchBody(initialSimple, simple, SIMPLE_KEYS);
  const reqPatch = buildPatchBody(initialReq, req, REQUIREMENTS_KEYS);
  const deadlinesPatch = buildPatchBody(initialDeadlines, deadlines, ['application_close'] as const);
  const grantsDirty = grantsText !== initialGrantsText;
  const isDirty = Object.keys(simplePatch).length > 0 || Object.keys(reqPatch).length > 0 || Object.keys(deadlinesPatch).length > 0 || grantsDirty;

  async function handleSave() {
    if (!programId || !detail || !req || !deadlines) return;

    const patch: AdminProgramUpdateRequest = { ...simplePatch };

    // requirements/deadlines are whole-object replace on the backend — merge
    // the full original object with the (possibly edited) known subset so any
    // keys this form doesn't render (e.g. admission_scores_2026) survive.
    if (Object.keys(reqPatch).length > 0) {
      patch.requirements = { ...detail.requirements, ...req };
    }
    if (Object.keys(deadlinesPatch).length > 0) {
      patch.deadlines = { ...detail.deadlines, ...deadlines };
    }

    if (grantsDirty) {
      try {
        patch.grants = JSON.parse(grantsText);
      } catch {
        setSaveMessage({ kind: 'error', text: 'Некорректный JSON в поле «Гранты»' });
        return;
      }
    }

    if (Object.keys(patch).length === 0) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await adminApi.updateProgram(programId, patch);
      setDetail(updated);

      const simpleState = toSimpleForm(updated);
      setInitialSimple(simpleState);
      setSimple(simpleState);

      const reqState = toRequirementsForm(updated.requirements);
      setInitialReq(reqState);
      setReq(reqState);

      const deadlinesState = toDeadlinesForm(updated.deadlines);
      setInitialDeadlines(deadlinesState);
      setDeadlines(deadlinesState);

      const grantsJson = JSON.stringify(updated.grants, null, 2);
      setInitialGrantsText(grantsJson);
      setGrantsText(grantsJson);

      setSaveMessage({ kind: 'success', text: 'Сохранено' });
    } catch {
      setSaveMessage({ kind: 'error', text: 'Не удалось сохранить изменения' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer size="narrow" className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/admin/universities/${detail.university.id}`}>
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            {detail.name}
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">{detail.university.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {saveMessage && (
          <span className={cn(MONO_LABEL, saveMessage.kind === 'error' ? 'text-danger' : 'text-brand')}>
            {saveMessage.text.toUpperCase()}
          </span>
        )}
        <Button size="sm" onClick={handleSave} isLoading={saving} disabled={!isDirty} muteSound>
          Сохранить
        </Button>
      </div>

      <Card className="rounded-[3px] p-3 space-y-3">
        <AdminSectionHeading title="Основное" />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Название" locked={locked.has('name')}>
            <input className={ADMIN_INPUT} value={simple.name} onChange={(e) => setSimpleField('name', e.target.value)} />
          </AdminField>
          <AdminField label="Язык обучения" locked={locked.has('language')}>
            <input className={ADMIN_INPUT} value={simple.language} onChange={(e) => setSimpleField('language', e.target.value)} />
          </AdminField>
          <AdminField label="Стоимость / год" locked={locked.has('cost_per_year')}>
            <input
              type="number"
              className={ADMIN_INPUT}
              value={simple.cost_per_year ?? ''}
              onChange={(e) => setSimpleField('cost_per_year', toFloatOrNull(e.target.value))}
            />
          </AdminField>
          <AdminField label="Подпись стоимости" locked={locked.has('cost_label')}>
            <input className={ADMIN_INPUT} value={simple.cost_label} onChange={(e) => setSimpleField('cost_label', e.target.value)} />
          </AdminField>
          <AdminField label="Источник" locked={locked.has('source_url')} className="sm:col-span-2">
            <input className={ADMIN_INPUT} value={simple.source_url} onChange={(e) => setSimpleField('source_url', e.target.value)} />
          </AdminField>
        </div>

        <AdminField label="Описание" locked={locked.has('description')}>
          <textarea className={ADMIN_TEXTAREA} value={simple.description} onChange={(e) => setSimpleField('description', e.target.value)} />
        </AdminField>
        <AdminField label="Кому подходит" locked={locked.has('who_its_for')}>
          <textarea className={ADMIN_TEXTAREA} value={simple.who_its_for} onChange={(e) => setSimpleField('who_its_for', e.target.value)} />
        </AdminField>
      </Card>

      <Card className="rounded-[3px] p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <AdminSectionHeading title="Требования" />
          {locked.has('requirements') && <span className={cn(MONO_LABEL, 'text-brand')}>ЗАЩИЩЕНО</span>}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <RequirementCheckbox label="Нужно портфолио" checked={req.needs_portfolio} onChange={(v) => setReqField('needs_portfolio', v)} />
          <RequirementCheckbox label="Нужно эссе" checked={req.needs_essay} onChange={(v) => setReqField('needs_essay', v)} />
          <RequirementCheckbox
            label="Нужны рекомендации"
            checked={req.needs_recommendations}
            onChange={(v) => setReqField('needs_recommendations', v)}
          />
          <RequirementCheckbox label="Нужно собеседование" checked={req.needs_interview} onChange={(v) => setReqField('needs_interview', v)} />
        </div>
        <StringListEditor label="Экзамены" values={req.exams} onChange={(v) => setReqField('exams', v)} placeholder="Например, Математика" />
        <StringListEditor label="Примечания" values={req.notes} onChange={(v) => setReqField('notes', v)} placeholder="Свободный текст" />
        <p className={MONO_MUTE}>
          Прочие ключи requirements ({Object.keys(detail.requirements).filter((k) => !REQUIREMENTS_KEYS.includes(k as never)).join(', ') || 'нет'}) сохраняются как есть.
        </p>
      </Card>

      <Card className="rounded-[3px] p-3 space-y-3">
        <AdminSectionHeading title="Дедлайны" />
        <AdminField label="Окончание приёма заявок" locked={locked.has('deadlines')}>
          <input
            type="date"
            className={ADMIN_INPUT}
            value={deadlines.application_close}
            onChange={(e) => setDeadlines({ application_close: e.target.value })}
          />
        </AdminField>
      </Card>

      <Card className="rounded-[3px] p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <AdminSectionHeading title="Гранты" />
          {locked.has('grants') && <span className={cn(MONO_LABEL, 'text-brand')}>ЗАЩИЩЕНО</span>}
        </div>
        {/* Grant entry shape isn't documented in the API contract, so this
            edits the raw array as JSON rather than guessing a structured form
            that could silently corrupt real entries. */}
        <textarea
          className={cn(ADMIN_TEXTAREA, 'font-mono text-mono-sm min-h-[120px]')}
          value={grantsText}
          onChange={(e) => setGrantsText(e.target.value)}
          spellCheck={false}
        />
      </Card>

      <p className={MONO_MUTE}>
        СОЗДАНА {new Date(detail.created_at).toLocaleDateString('ru-RU')}
        {detail.updated_at ? ` · ОБНОВЛЕНА ${new Date(detail.updated_at).toLocaleDateString('ru-RU')}` : ''}
      </p>
    </PageContainer>
  );
}
