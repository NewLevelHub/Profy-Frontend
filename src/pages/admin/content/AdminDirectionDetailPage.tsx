import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminSectionHeading } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
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

type FormState = Record<(typeof EDITABLE_KEYS)[number], string | string[]> & {
  name: string;
  holland_code: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
};

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

const LOCK_REASON = 'Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка';

export default function AdminDirectionDetailPage() {
  const { directionId } = useParams<{ directionId: string }>();
  const [detail, setDetail] = useState<AdminDirectionDetail | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!directionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getDirection(directionId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить направление');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [directionId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !form || !initial) {
    return <Card className="text-red-600 font-semibold">{error || 'Направление не найдено'}</Card>;
  }

  const locked = new Set(Object.keys(detail.overrides));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form || !initial || !directionId) return;
    const patch = buildPatchBody(initial, form, EDITABLE_KEYS);
    if (Object.keys(patch).length === 0) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await adminApi.updateDirection(directionId, patch);
      setDetail(updated);
      const state = toFormState(updated);
      setInitial(state);
      setForm(state);
      setSaveMessage({ kind: 'success', text: 'Сохранено' });
    } catch {
      setSaveMessage({ kind: 'error', text: 'Не удалось сохранить изменения' });
    } finally {
      setSaving(false);
    }
  }

  const isDirty = Object.keys(buildPatchBody(initial, form, EDITABLE_KEYS)).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/content/directions">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            {detail.name}
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">{detail.slug}</p>
        </div>
      </div>

      <Card className="rounded-[3px] p-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <AdminSectionHeading title="Основное" />
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className={cn(MONO_LABEL, saveMessage.kind === 'error' ? 'text-danger' : 'text-brand')}>
                {saveMessage.text.toUpperCase()}
              </span>
            )}
            <Button size="sm" onClick={handleSave} isLoading={saving} disabled={!isDirty} muteSound>
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Название" locked={locked.has('name')} lockReason={LOCK_REASON}>
            <input className={ADMIN_INPUT} value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </AdminField>
          <AdminField label="Holland code" locked={locked.has('holland_code')} lockReason={LOCK_REASON}>
            <input className={ADMIN_INPUT} value={form.holland_code} onChange={(e) => setField('holland_code', e.target.value)} />
          </AdminField>
        </div>

        <AdminField label="Описание" locked={locked.has('description')} lockReason={LOCK_REASON}>
          <textarea className={ADMIN_TEXTAREA} value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </AdminField>
      </Card>

      {/* Empty by default for most rows today — the professions-catalog seed
          only fills name/holland_code yet, see AdminDirectionDetail's docstring. */}
      <Card className="rounded-[3px] p-3 space-y-4">
        <AdminSectionHeading title="Каталог (может быть пуст у большинства направлений)" />
        <AdminField label="Профессии" locked={locked.has('professions')} lockReason={LOCK_REASON}>
          <StringListEditor label="" values={form.professions} onChange={(v) => setField('professions', v)} />
        </AdminField>
        <AdminField label="Нужные навыки" locked={locked.has('skills_needed')} lockReason={LOCK_REASON}>
          <StringListEditor label="" values={form.skills_needed} onChange={(v) => setField('skills_needed', v)} />
        </AdminField>
        <AdminField label="Предметы для развития" locked={locked.has('subjects_to_develop')} lockReason={LOCK_REASON}>
          <StringListEditor label="" values={form.subjects_to_develop} onChange={(v) => setField('subjects_to_develop', v)} />
        </AdminField>
        <AdminField label="Первые шаги" locked={locked.has('first_steps')} lockReason={LOCK_REASON}>
          <StringListEditor label="" values={form.first_steps} onChange={(v) => setField('first_steps', v)} />
        </AdminField>
      </Card>

      <p className={MONO_MUTE}>SLUG {detail.slug} — READ-ONLY, НЕ ПЕРЕГЕНЕРИРУЕТСЯ ПРИ ПРАВКЕ NAME</p>
    </div>
  );
}
