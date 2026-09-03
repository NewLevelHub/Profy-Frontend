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
import { ADMIN_CELL, ADMIN_INPUT, ADMIN_TEXT, ADMIN_TEXTAREA, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminUniversityDetail, AdminUniversityUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'name',
  'short_name',
  'aliases',
  'location',
  'website',
  'ranking',
  'ranking_label',
  'uniranks_kz_rank',
  'uniranks_world_rank',
  'uniranks_note',
  'description',
  'city',
  'country',
  'source_url',
] as const satisfies readonly (keyof AdminUniversityUpdateRequest)[];

// Decoupled from `AdminUniversityUpdateRequest`'s wire nullability (e.g.
// `ranking_label: string | null`) — the UI always represents "empty" as ''
// rather than null, and `buildPatchBody`'s output is still structurally
// assignable back to the wire type when sent.
interface FormState {
  name: string;
  short_name: string;
  aliases: string[];
  location: string;
  website: string;
  ranking: number | null;
  ranking_label: string;
  uniranks_kz_rank: number | null;
  uniranks_world_rank: number | null;
  uniranks_note: string;
  description: string;
  city: string;
  country: string;
  source_url: string;
}

function toFormState(detail: AdminUniversityDetail): FormState {
  return {
    name: detail.name,
    short_name: detail.short_name ?? '',
    aliases: detail.aliases,
    location: detail.location ?? '',
    website: detail.website ?? '',
    ranking: detail.ranking,
    ranking_label: detail.ranking_label ?? '',
    uniranks_kz_rank: detail.uniranks_kz_rank,
    uniranks_world_rank: detail.uniranks_world_rank,
    uniranks_note: detail.uniranks_note ?? '',
    description: detail.description ?? '',
    city: detail.city ?? '',
    country: detail.country ?? '',
    source_url: detail.source_url ?? '',
  };
}

function toIntOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function AdminUniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const [detail, setDetail] = useState<AdminUniversityDetail | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getUniversity(universityId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить университет');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !form || !initial) {
    return <Card className="text-red-600 font-semibold">{error || 'Университет не найден'}</Card>;
  }

  const locked = new Set(detail.admin_locked_fields);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form || !initial || !universityId) return;
    const patch = buildPatchBody(initial, form, EDITABLE_KEYS);
    if (Object.keys(patch).length === 0) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await adminApi.updateUniversity(universityId, patch);
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
    <PageContainer className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/universities">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            {detail.name}
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">
            {detail.slug} · {detail.programs.length} программ
          </p>
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
          <AdminField label="Название" locked={locked.has('name')}>
            <input className={ADMIN_INPUT} value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </AdminField>
          <AdminField label="Короткое имя" locked={locked.has('short_name')}>
            <input className={ADMIN_INPUT} value={form.short_name} onChange={(e) => setField('short_name', e.target.value)} />
          </AdminField>
          <AdminField label="Город" locked={locked.has('city')}>
            <input className={ADMIN_INPUT} value={form.city} onChange={(e) => setField('city', e.target.value)} />
          </AdminField>
          <AdminField label="Страна" locked={locked.has('country')}>
            <input className={ADMIN_INPUT} value={form.country} onChange={(e) => setField('country', e.target.value)} />
          </AdminField>
          <AdminField label="Адрес" locked={locked.has('location')} className="sm:col-span-2">
            <input className={ADMIN_INPUT} value={form.location} onChange={(e) => setField('location', e.target.value)} />
          </AdminField>
          <AdminField label="Сайт" locked={locked.has('website')}>
            <input className={ADMIN_INPUT} value={form.website} onChange={(e) => setField('website', e.target.value)} />
          </AdminField>
          <AdminField label="Источник" locked={locked.has('source_url')}>
            <input className={ADMIN_INPUT} value={form.source_url} onChange={(e) => setField('source_url', e.target.value)} />
          </AdminField>
        </div>

        <AdminField label="Алиасы" locked={locked.has('aliases')}>
          <StringListEditor label="" values={form.aliases} onChange={(v) => setField('aliases', v)} />
        </AdminField>

        <AdminField label="Описание" locked={locked.has('description')}>
          <textarea className={ADMIN_TEXTAREA} value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </AdminField>
      </Card>

      <Card className="rounded-[3px] p-3 space-y-3">
        <AdminSectionHeading title="Рейтинги" />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Рейтинг (нац.)" locked={locked.has('ranking')}>
            <input
              type="number"
              className={ADMIN_INPUT}
              value={form.ranking ?? ''}
              onChange={(e) => setField('ranking', toIntOrNull(e.target.value))}
            />
          </AdminField>
          <AdminField label="Подпись рейтинга" locked={locked.has('ranking_label')}>
            <input className={ADMIN_INPUT} value={form.ranking_label} onChange={(e) => setField('ranking_label', e.target.value)} />
          </AdminField>
          <AdminField label="Uniranks KZ" locked={locked.has('uniranks_kz_rank')}>
            <input
              type="number"
              className={ADMIN_INPUT}
              value={form.uniranks_kz_rank ?? ''}
              onChange={(e) => setField('uniranks_kz_rank', toIntOrNull(e.target.value))}
            />
          </AdminField>
          <AdminField label="Uniranks World" locked={locked.has('uniranks_world_rank')}>
            <input
              type="number"
              className={ADMIN_INPUT}
              value={form.uniranks_world_rank ?? ''}
              onChange={(e) => setField('uniranks_world_rank', toIntOrNull(e.target.value))}
            />
          </AdminField>
          <AdminField label="Uniranks — примечание" locked={locked.has('uniranks_note')} className="sm:col-span-2">
            <input
              className={ADMIN_INPUT}
              value={form.uniranks_note}
              placeholder='Например, "Н/Р" — проверено, не найден в рейтинге'
              onChange={(e) => setField('uniranks_note', e.target.value)}
            />
          </AdminField>
        </div>
      </Card>

      <Card className="rounded-[3px] p-3">
        <AdminSectionHeading title="Программы" className="mb-3" />
        {detail.programs.length === 0 ? (
          <p className="text-secondary font-semibold">Программ пока нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ПРОГРАММА</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ЯЗЫК</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>СТОИМОСТЬ / ГОД</th>
                </tr>
              </thead>
              <tbody>
                {detail.programs.map((program) => (
                  <tr key={program.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'align-top')}>
                      <Link to={`/admin/programs/${program.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                        {program.name}
                      </Link>
                    </td>
                    <td className={cn(ADMIN_CELL, 'text-secondary align-top')}>{program.language ?? '—'}</td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>
                      {program.cost_label ?? (program.cost_per_year != null ? `${program.cost_per_year.toLocaleString('ru-RU')} ₸` : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className={MONO_MUTE}>
        СОЗДАН {new Date(detail.created_at).toLocaleDateString('ru-RU')}
        {detail.updated_at ? ` · ОБНОВЛЁН ${new Date(detail.updated_at).toLocaleDateString('ru-RU')}` : ''}
      </p>
    </PageContainer>
  );
}
