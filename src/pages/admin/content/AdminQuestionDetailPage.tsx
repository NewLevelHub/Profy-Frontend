import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { AGE_TIER_LABELS, BIGFIVE_DOMAIN_LABELS, HOLLAND_TYPE_LABELS, INSTRUMENT_LABELS, MI_TYPE_LABELS, QUESTION_KEYED_LABELS } from '@/shared/lib/contentLabels';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminSectionHeading } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { ADMIN_INPUT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminQuestionDetail, AdminQuestionUpdateRequest, AgeGroup, BigFiveDomain, HollandType, MIType, QuestionKeyed } from '@/shared/types';

const EDITABLE_KEYS = [
  'riasec_type',
  'bigfive_domain',
  'mi_category',
  'facet',
  'keyed',
  'text',
  'age_tier',
  'short_text',
  'icon',
] as const satisfies readonly (keyof AdminQuestionUpdateRequest)[];

interface FormState {
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
  facet: string;
  keyed: QuestionKeyed | null;
  text: string;
  age_tier: AgeGroup;
  short_text: string;
  icon: string;
}

function toFormState(detail: AdminQuestionDetail): FormState {
  return {
    riasec_type: detail.riasec_type,
    bigfive_domain: detail.bigfive_domain,
    mi_category: detail.mi_category,
    facet: detail.facet ?? '',
    keyed: detail.keyed,
    text: detail.text,
    age_tier: detail.age_tier,
    short_text: detail.short_text ?? '',
    icon: detail.icon ?? '',
  };
}

const LOCK_REASON = 'Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка';

export default function AdminQuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const [detail, setDetail] = useState<AdminQuestionDetail | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getQuestion(questionId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить вопрос');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !detail || !form || !initial) {
    return <Card className="text-red-600 font-semibold">{error || 'Вопрос не найден'}</Card>;
  }

  const locked = new Set(Object.keys(detail.overrides));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const patch = buildPatchBody(initial, form, EDITABLE_KEYS);
  const isDirty = Object.keys(patch).length > 0;

  async function handleSave() {
    if (!form || !initial || !questionId) return;
    if (!isDirty) {
      setSaveMessage({ kind: 'success', text: 'Нет изменений для сохранения' });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = await adminApi.updateQuestion(questionId, patch);
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
        <Link to="/admin/content/questions">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            Вопрос
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">
            {INSTRUMENT_LABELS[detail.instrument]} · порядок {detail.order}
          </p>
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

        <AdminField label="Текст вопроса" locked={locked.has('text')} lockReason={LOCK_REASON}>
          <textarea
            className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')}
            value={form.text}
            onChange={(e) => setField('text', e.target.value)}
          />
        </AdminField>

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Короткий текст (junior forced-choice)" locked={locked.has('short_text')} lockReason={LOCK_REASON}>
            <input className={ADMIN_INPUT} value={form.short_text} onChange={(e) => setField('short_text', e.target.value)} />
          </AdminField>
          <AdminField label="Иконка" locked={locked.has('icon')} lockReason={LOCK_REASON}>
            <input className={ADMIN_INPUT} value={form.icon} onChange={(e) => setField('icon', e.target.value)} />
          </AdminField>
          <AdminField label="Возрастная видимость" locked={locked.has('age_tier')} lockReason={LOCK_REASON}>
            <select className={ADMIN_INPUT} value={form.age_tier} onChange={(e) => setField('age_tier', e.target.value as AgeGroup)}>
              {(Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => (
                <option key={key} value={key}>
                  {AGE_TIER_LABELS[key]}
                </option>
              ))}
            </select>
          </AdminField>
        </div>
      </Card>

      {/* Only the field set relevant to this row's instrument is shown —
          the other instruments' fields stay whatever they already were
          (usually null) rather than inviting garbage cross-instrument data. */}
      {detail.instrument === 'riasec' && (
        <Card className="rounded-[3px] p-3 space-y-3">
          <AdminSectionHeading title="RIASEC" />
          <AdminField label="Тип" locked={locked.has('riasec_type')} lockReason={LOCK_REASON}>
            <select
              className={ADMIN_INPUT}
              value={form.riasec_type ?? ''}
              onChange={(e) => setField('riasec_type', (e.target.value || null) as HollandType | null)}
            >
              <option value="">—</option>
              {(Object.keys(HOLLAND_TYPE_LABELS) as HollandType[]).map((key) => (
                <option key={key} value={key}>
                  {HOLLAND_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </AdminField>
        </Card>
      )}

      {detail.instrument === 'big_five' && (
        <Card className="rounded-[3px] p-3 space-y-3">
          <AdminSectionHeading title="Big Five" />
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Домен" locked={locked.has('bigfive_domain')} lockReason={LOCK_REASON}>
              <select
                className={ADMIN_INPUT}
                value={form.bigfive_domain ?? ''}
                onChange={(e) => setField('bigfive_domain', (e.target.value || null) as BigFiveDomain | null)}
              >
                <option value="">—</option>
                {(Object.keys(BIGFIVE_DOMAIN_LABELS) as BigFiveDomain[]).map((key) => (
                  <option key={key} value={key}>
                    {BIGFIVE_DOMAIN_LABELS[key]}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Ключевание" locked={locked.has('keyed')} lockReason={LOCK_REASON}>
              <select
                className={ADMIN_INPUT}
                value={form.keyed ?? ''}
                onChange={(e) => setField('keyed', (e.target.value || null) as QuestionKeyed | null)}
              >
                <option value="">—</option>
                {(Object.keys(QUESTION_KEYED_LABELS) as QuestionKeyed[]).map((key) => (
                  <option key={key} value={key}>
                    {QUESTION_KEYED_LABELS[key]}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Фасет" locked={locked.has('facet')} lockReason={LOCK_REASON} className="sm:col-span-2">
              <input className={ADMIN_INPUT} value={form.facet} onChange={(e) => setField('facet', e.target.value)} />
            </AdminField>
          </div>
        </Card>
      )}

      {detail.instrument === 'mi' && (
        <Card className="rounded-[3px] p-3 space-y-3">
          <AdminSectionHeading title="Multiple Intelligences" />
          <AdminField label="Категория" locked={locked.has('mi_category')} lockReason={LOCK_REASON}>
            <select
              className={ADMIN_INPUT}
              value={form.mi_category ?? ''}
              onChange={(e) => setField('mi_category', (e.target.value || null) as MIType | null)}
            >
              <option value="">—</option>
              {(Object.keys(MI_TYPE_LABELS) as MIType[]).map((key) => (
                <option key={key} value={key}>
                  {MI_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </AdminField>
        </Card>
      )}

      <p className={MONO_MUTE}>ПОРЯДОК {detail.order} — ТОЛЬКО ЧТЕНИЕ, СТРУКТУРНОЕ ПОЛЕ</p>
    </div>
  );
}
