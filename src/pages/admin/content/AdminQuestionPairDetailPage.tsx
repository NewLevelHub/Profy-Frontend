import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { cn } from '@/shared/lib/cn';
import { AGE_TIER_LABELS, INSTRUMENT_LABELS } from '@/shared/lib/contentLabels';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminSectionHeading } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { ADMIN_INPUT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminQuestionPairDetail, AdminQuestionPairUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'frame',
  'option_a_text',
  'option_b_text',
  'option_a_icon',
  'option_b_icon',
] as const satisfies readonly (keyof AdminQuestionPairUpdateRequest)[];

interface FormState {
  frame: string;
  option_a_text: string;
  option_b_text: string;
  option_a_icon: string;
  option_b_icon: string;
}

function toFormState(detail: AdminQuestionPairDetail): FormState {
  return {
    frame: detail.frame ?? '',
    option_a_text: detail.option_a_text ?? '',
    option_b_text: detail.option_b_text ?? '',
    option_a_icon: detail.option_a_icon ?? '',
    option_b_icon: detail.option_b_icon ?? '',
  };
}

const LOCK_REASON = 'Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка';

/**
 * On-demand fallback resolver — when option_*_text/icon is null, the real
 * user-facing UI falls back to the linked Question's short_text/text/icon,
 * but this endpoint doesn't resolve that itself (see the content contract's
 * §6). Fetched lazily on click, not eagerly, to avoid an N+1 on every pair
 * in the list/detail view.
 */
function FallbackPreview({ questionId }: { questionId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [preview, setPreview] = useState<{ text: string; short_text: string | null; icon: string | null } | null>(null);

  if (preview) {
    return (
      <p className={cn(MONO_MUTE, 'mt-1')}>
        ПО УМОЛЧАНИЮ: {preview.icon ? `${preview.icon} ` : ''}
        {preview.short_text ?? preview.text}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setState('loading');
        try {
          const question = await adminApi.getQuestion(questionId);
          setPreview({ text: question.text, short_text: question.short_text, icon: question.icon });
          setState('idle');
        } catch {
          setState('error');
        }
      }}
      className={cn(MONO_LABEL, 'mt-1 text-brand hover:underline')}
    >
      {state === 'loading' ? 'ЗАГРУЗКА...' : state === 'error' ? 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ — ПОВТОРИТЬ' : 'ПОКАЗАТЬ ЗНАЧЕНИЕ ПО УМОЛЧАНИЮ'}
    </button>
  );
}

function PairSide({
  label,
  questionId,
  text,
  icon,
  onTextChange,
  onIconChange,
  textLocked,
  iconLocked,
}: {
  label: string;
  questionId: string;
  text: string;
  icon: string;
  onTextChange: (v: string) => void;
  onIconChange: (v: string) => void;
  textLocked: boolean;
  iconLocked: boolean;
}) {
  return (
    <Card className="rounded-[3px] p-3 space-y-3">
      <AdminSectionHeading title={label} />
      <p className={MONO_MUTE}>QUESTION_ID (READ-ONLY): {questionId.slice(0, 8)}</p>
      <AdminField label="Текст опции" locked={textLocked} lockReason={LOCK_REASON}>
        <input className={ADMIN_INPUT} value={text} onChange={(e) => onTextChange(e.target.value)} placeholder="Пусто = fallback на текст вопроса" />
        {text.trim() === '' && <FallbackPreview questionId={questionId} />}
      </AdminField>
      <AdminField label="Иконка" locked={iconLocked} lockReason={LOCK_REASON}>
        <input className={ADMIN_INPUT} value={icon} onChange={(e) => onIconChange(e.target.value)} placeholder="Пусто = fallback на иконку вопроса" />
      </AdminField>
    </Card>
  );
}

export default function AdminQuestionPairDetailPage() {
  const { pairId } = useParams<{ pairId: string }>();
  const [detail, setDetail] = useState<AdminQuestionPairDetail | null>(null);
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
        const data = await adminApi.getQuestionPair(pairId!);
        if (cancelled) return;
        setDetail(data);
        const state = toFormState(data);
        setInitial(state);
        setForm(state);
      } catch {
        if (!cancelled) setError('Не удалось загрузить пару вопросов');
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

  const patch = buildPatchBody(initial, form, EDITABLE_KEYS);
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
      // Empty string means "no override, fall back to the linked Question" —
      // send it through as null, not '' (the wire type's real "clear" value).
      const wirePatch: AdminQuestionPairUpdateRequest = { ...patch };
      if ('option_a_text' in wirePatch) wirePatch.option_a_text = form.option_a_text.trim() || null;
      if ('option_b_text' in wirePatch) wirePatch.option_b_text = form.option_b_text.trim() || null;
      if ('option_a_icon' in wirePatch) wirePatch.option_a_icon = form.option_a_icon.trim() || null;
      if ('option_b_icon' in wirePatch) wirePatch.option_b_icon = form.option_b_icon.trim() || null;
      if ('frame' in wirePatch) wirePatch.frame = form.frame.trim() || null;

      const updated = await adminApi.updateQuestionPair(pairId, wirePatch);
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
        <Link to="/admin/content/question-pairs">
          <Button variant="ghost" size="sm" muteSound>
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <div>
          <Heading level="display-sm" className="text-primary">
            Пара вопросов #{detail.pair_index}
          </Heading>
          <p className="font-mono text-mono-xs text-muted mt-0.5">
            {INSTRUMENT_LABELS[detail.instrument]} · {AGE_TIER_LABELS[detail.age_tier]}
          </p>
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
        <AdminSectionHeading title="Сценарий" />
        <AdminField label="Фрейм (пусто для junior)" locked={locked.has('frame')} lockReason={LOCK_REASON}>
          <input className={ADMIN_INPUT} value={form.frame} onChange={(e) => setField('frame', e.target.value)} />
        </AdminField>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <PairSide
          label="Сторона A"
          questionId={detail.question_a_id}
          text={form.option_a_text}
          icon={form.option_a_icon}
          onTextChange={(v) => setField('option_a_text', v)}
          onIconChange={(v) => setField('option_a_icon', v)}
          textLocked={locked.has('option_a_text')}
          iconLocked={locked.has('option_a_icon')}
        />
        <PairSide
          label="Сторона B"
          questionId={detail.question_b_id}
          text={form.option_b_text}
          icon={form.option_b_icon}
          onTextChange={(v) => setField('option_b_text', v)}
          onIconChange={(v) => setField('option_b_icon', v)}
          textLocked={locked.has('option_b_text')}
          iconLocked={locked.has('option_b_icon')}
        />
      </div>

      <p className={MONO_MUTE}>
        QUESTION_A_ID {detail.question_a_id} · QUESTION_B_ID {detail.question_b_id} — READ-ONLY, СТРУКТУРНЫЕ ПОЛЯ
      </p>
    </div>
  );
}
