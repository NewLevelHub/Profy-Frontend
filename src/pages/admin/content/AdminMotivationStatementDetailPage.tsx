import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminSectionHeading } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { ADMIN_INPUT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminMotivationStatementDetail, AdminMotivationStatementUpdateRequest, MotivationCategory } from '@/shared/types';

const EDITABLE_KEYS = ['category', 'text', 'text_junior'] as const satisfies readonly (keyof AdminMotivationStatementUpdateRequest)[];

interface FormState {
  category: MotivationCategory;
  text: string;
  text_junior: string;
}

function toFormState(detail: AdminMotivationStatementDetail): FormState {
  return {
    category: detail.category,
    text: detail.text,
    text_junior: detail.text_junior ?? '',
  };
}

const LOCK_REASON = 'Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка';

export default function AdminMotivationStatementDetailPage() {
  const { statementId } = useParams<{ statementId: string }>();
  const [detail, setDetail] = useState<AdminMotivationStatementDetail | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!statementId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getMotivationStatement(statementId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить утверждение');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [statementId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !form || !initial) {
    return <Card className="text-red-600 font-semibold">{error || 'Утверждение не найдено'}</Card>;
  }

  const locked = new Set(Object.keys(detail.overrides));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const patch = buildPatchBody(initial, form, EDITABLE_KEYS);
  const isDirty = Object.keys(patch).length > 0;

  async function handleSave() {
    if (!form || !initial || !statementId) return;
    if (!isDirty) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const wirePatch: AdminMotivationStatementUpdateRequest = { ...patch };
      if ('text_junior' in wirePatch) wirePatch.text_junior = form.text_junior.trim() || null;

      const updated = await adminApi.updateMotivationStatement(statementId, wirePatch);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/content/motivation-statements">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            Утверждение · триплет {detail.triplet_index}
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">Порядок в триплете: {detail.order}</p>
        </div>
      </div>

      <Card className="rounded-[3px] p-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <AdminSectionHeading title="Содержание" />
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

        <AdminField label="Категория" locked={locked.has('category')} lockReason={LOCK_REASON}>
          <select className={ADMIN_INPUT} value={form.category} onChange={(e) => setField('category', e.target.value as MotivationCategory)}>
            {(Object.keys(MOTIVATION_CATEGORY_LABELS) as MotivationCategory[]).map((key) => (
              <option key={key} value={key}>
                {MOTIVATION_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </AdminField>
        {/* No server-side check that 3 rows in a triplet cover 3 distinct
            categories — the list endpoint has no triplet_index filter to
            cheaply fetch the other 2 rows, so this stays a soft reminder
            rather than a live validation. */}
        <p className={MONO_MUTE}>
          КАТЕГОРИЯ ДОЛЖНА БЫТЬ УНИКАЛЬНА ВНУТРИ ТРИПЛЕТА {detail.triplet_index} — БЭКЕНД ЭТО НЕ ПРОВЕРЯЕТ
        </p>

        <AdminField label="Текст (взрослая формулировка)" locked={locked.has('text')} lockReason={LOCK_REASON}>
          <textarea className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')} value={form.text} onChange={(e) => setField('text', e.target.value)} />
        </AdminField>

        <AdminField label="Текст для junior" locked={locked.has('text_junior')} lockReason={LOCK_REASON}>
          <textarea
            className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')}
            value={form.text_junior}
            onChange={(e) => setField('text_junior', e.target.value)}
            placeholder="Пусто = используется текст выше для всех возрастов"
          />
        </AdminField>
      </Card>
    </div>
  );
}
