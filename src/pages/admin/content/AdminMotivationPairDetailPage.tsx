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
import type { AdminMotivationPairDetail, AdminMotivationPairUpdateRequest, MotivationCategory } from '@/shared/types';

interface FormState {
  category: MotivationCategory;
  text_a: string;
  text_b: string;
}

function toFormState(detail: AdminMotivationPairDetail): FormState {
  return {
    // category_a/category_b are meant to always be equal (see the content
    // contract's §8 — one polarity axis, not two categories) — the form
    // exposes a single selector and writes both on save.
    category: detail.category_a,
    text_a: detail.text_a,
    text_b: detail.text_b,
  };
}

const LOCK_REASON = 'Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка';

export default function AdminMotivationPairDetailPage() {
  const { pairId } = useParams<{ pairId: string }>();
  const [detail, setDetail] = useState<AdminMotivationPairDetail | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!pairId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getMotivationPair(pairId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить пару мотивации');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pairId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !form || !initial) {
    return <Card className="text-red-600 font-semibold">{error || 'Пара не найдена'}</Card>;
  }

  const locked = new Set(Object.keys(detail.overrides));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const patch = buildPatchBody(initial, form, ['category', 'text_a', 'text_b'] as const);
  const isDirty = Object.keys(patch).length > 0;

  async function handleSave() {
    if (!form || !initial || !pairId) return;
    if (!isDirty) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const wirePatch: AdminMotivationPairUpdateRequest = {};
      if ('category' in patch) {
        wirePatch.category_a = form.category;
        wirePatch.category_b = form.category;
      }
      if ('text_a' in patch) wirePatch.text_a = form.text_a;
      if ('text_b' in patch) wirePatch.text_b = form.text_b;

      const updated = await adminApi.updateMotivationPair(pairId, wirePatch);
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
        <Link to="/admin/content/motivation-pairs">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            Пара мотивации #{detail.pair_index}
          </Heading>
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

        {detail.category_a !== detail.category_b && (
          <p className="text-danger font-semibold text-sm">
            ⚠ У этой пары category_a ({MOTIVATION_CATEGORY_LABELS[detail.category_a]}) и category_b (
            {MOTIVATION_CATEGORY_LABELS[detail.category_b]}) уже разошлись — сохранение через одиночный селектор ниже сведёт обе стороны к одной категории.
          </p>
        )}

        <AdminField
          label="Категория (общая для обеих сторон)"
          locked={locked.has('category_a') || locked.has('category_b')}
          lockReason={LOCK_REASON}
        >
          <select className={ADMIN_INPUT} value={form.category} onChange={(e) => setField('category', e.target.value as MotivationCategory)}>
            {(Object.keys(MOTIVATION_CATEGORY_LABELS) as MotivationCategory[]).map((key) => (
              <option key={key} value={key}>
                {MOTIVATION_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Текст A (позитивный полюс)" locked={locked.has('text_a')} lockReason={LOCK_REASON}>
          <textarea className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')} value={form.text_a} onChange={(e) => setField('text_a', e.target.value)} />
        </AdminField>

        <AdminField label="Текст B (негативный полюс)" locked={locked.has('text_b')} lockReason={LOCK_REASON}>
          <textarea className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')} value={form.text_b} onChange={(e) => setField('text_b', e.target.value)} />
        </AdminField>
      </Card>

      <p className={MONO_MUTE}>
        Одна сторона — один полюс той же категории, а не сравнение двух разных категорий.
      </p>
    </div>
  );
}
