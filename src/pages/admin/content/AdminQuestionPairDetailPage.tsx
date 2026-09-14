import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { AGE_TIER_LABELS, INSTRUMENT_LABELS } from '@/shared/lib/contentLabels';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminQuestionPairDetail, AdminQuestionPairUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'frame',
  'option_a_text',
  'option_b_text',
  'option_a_icon',
  'option_b_icon',
] as const satisfies readonly (keyof AdminQuestionPairUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  frame: 'фрейм',
  option_a_text: 'текст стороны A',
  option_b_text: 'текст стороны B',
  option_a_icon: 'иконка A',
  option_b_icon: 'иконка B',
};

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

const LOCK_REASON =
  'Значение задано вручную. Автообновление контент-банка не перезапишет его и не удалит строку.';

/** Text and icon of a linked question — what a blank option falls back to. */
interface Fallback {
  text: string;
  icon: string;
}

export default function AdminQuestionPairDetailPage() {
  const { pairId } = useParams<{ pairId: string }>();
  const [detail, setDetail] = useState<AdminQuestionPairDetail | null>(null);
  const [fallbacks, setFallbacks] = useState<{ a: Fallback | null; b: Fallback | null }>({ a: null, b: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!pairId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getQuestionPair(pairId!);
        if (cancelled) return;
        setDetail(data);

        // Resolved up front, not behind a "показать значение по умолчанию"
        // button as before. A blank option text falls back to the linked
        // question, so without this the screen could not answer the only
        // question it exists to answer: what will the student actually see.
        // The detail endpoint does not resolve this itself — see
        // docs/admin-backend-requests-pro-242.md §11.
        const [a, b] = await Promise.allSettled([
          adminApi.getQuestion(data.question_a_id),
          adminApi.getQuestion(data.question_b_id),
        ]);
        if (cancelled) return;
        setFallbacks({
          a: a.status === 'fulfilled' ? { text: a.value.short_text ?? a.value.text, icon: a.value.icon ?? '' } : null,
          b: b.status === 'fulfilled' ? { text: b.value.short_text ?? b.value.text, icon: b.value.icon ?? '' } : null,
        });
      } catch {
        if (!cancelled) setLoadError('Не удалось загрузить пару вопросов');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pairId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, patch, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminQuestionPairDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (nextPatch) => {
      const updated = await adminApi.updateQuestionPair(pairId!, nextPatch as AdminQuestionPairUpdateRequest);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label="Загрузка пары" />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || 'Пара не найдена'} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));

  /**
   * An empty box means "no override — use the linked question", and the wire
   * value for that is null, not ''. Converted at save time so the form can
   * keep using '' for "empty" everywhere else.
   */
  function handleSave() {
    const wire: AdminQuestionPairUpdateRequest = {};
    for (const key of Object.keys(patch) as (keyof FormState)[]) {
      wire[key] = form![key].trim() || null;
    }
    void save(wire as Partial<FormState>);
  }

  const effectiveA = form.option_a_text.trim() || fallbacks.a?.text || '';
  const effectiveB = form.option_b_text.trim() || fallbacks.b?.text || '';
  const effectiveIconA = form.option_a_icon.trim() || fallbacks.a?.icon || '';
  const effectiveIconB = form.option_b_icon.trim() || fallbacks.b?.icon || '';

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: 'Пары вопросов', to: listReturnPath('/admin/content/question-pairs') },
          { label: `Пара #${detail.pair_index}` },
        ]}
        title={`Пара вопросов #${detail.pair_index}`}
        meta={`${INSTRUMENT_LABELS[detail.instrument]} · ${AGE_TIER_LABELS[detail.age_tier]}`}
      />

      <PairPreview
        frame={form.frame}
        a={{ text: effectiveA, icon: effectiveIconA }}
        b={{ text: effectiveB, icon: effectiveIconB }}
      />

      <AdminCard
        title="Сценарий"
        description="Общая формулировка над двумя вариантами. Если очистить — ученик увидит два варианта без общего вопроса."
      >
        <AdminField label="Фрейм" locked={locked.has('frame')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              className={ADMIN_INPUT}
              value={form.frame}
              onChange={(e) => setField('frame', e.target.value)}
              placeholder="Например: Что тебе ближе?"
            />
          )}
        </AdminField>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PairSideCard
          label="Сторона A"
          questionId={detail.question_a_id}
          fallback={fallbacks.a}
          text={form.option_a_text}
          icon={form.option_a_icon}
          onTextChange={(v) => setField('option_a_text', v)}
          onIconChange={(v) => setField('option_a_icon', v)}
          textLocked={locked.has('option_a_text')}
          iconLocked={locked.has('option_a_icon')}
        />
        <PairSideCard
          label="Сторона B"
          questionId={detail.question_b_id}
          fallback={fallbacks.b}
          text={form.option_b_text}
          icon={form.option_b_icon}
          onTextChange={(v) => setField('option_b_text', v)}
          onIconChange={(v) => setField('option_b_icon', v)}
          textLocked={locked.has('option_b_text')}
          iconLocked={locked.has('option_b_icon')}
        />
      </div>

      {/* Одна строка под обеими карточками, а не одинаковый абзац в каждой:
          «со вопросом» вместо «с вопросом» — заодно правка опечатки. */}
      <p className={cn(ADMIN_META, 'm-0')}>
        Какие два вопроса образуют пару — задаётся контент-банком и в админке не меняется.
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={handleSave}
        onReset={reset}
        state={state}
        locksOnSave
      />
    </>
  );
}

function PairPreview({
  frame,
  a,
  b,
}: {
  frame: string;
  a: { text: string; icon: string };
  b: { text: string; icon: string };
}) {
  return (
    <div className="bg-raised border border-default rounded-[14px] p-4">
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>Как увидит ученик</p>
      {frame && <p className="font-sans text-body-md text-primary text-center mb-3">{frame}</p>}
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((side, index) => (
          <div
            key={index}
            className="bg-surface border border-default rounded-[14px] p-3 flex flex-col items-center gap-2 text-center"
          >
            {side.icon && (
              <span className="text-2xl leading-none" aria-hidden="true">
                {side.icon}
              </span>
            )}
            <span className={cn(ADMIN_TEXT, 'text-primary')}>{side.text || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PairSideCard({
  label,
  questionId,
  fallback,
  text,
  icon,
  onTextChange,
  onIconChange,
  textLocked,
  iconLocked,
}: {
  label: string;
  questionId: string;
  fallback: Fallback | null;
  text: string;
  icon: string;
  onTextChange: (v: string) => void;
  onIconChange: (v: string) => void;
  textLocked: boolean;
  iconLocked: boolean;
}) {
  const usingFallbackText = text.trim() === '';
  const usingFallbackIcon = icon.trim() === '';

  return (
    <AdminCard
      title={label}
      aside={
        <Link
          to={`/admin/content/questions/${questionId}`}
          className={cn(ADMIN_TEXT, 'text-brand hover:underline')}
        >
          Открыть вопрос
        </Link>
      }
    >
      <AdminField
        label="Текст варианта"
        locked={textLocked}
        lockReason={LOCK_REASON}
        hint={
          usingFallbackText ? (
            fallback ? (
              <>
                Пусто — используется текст вопроса:{' '}
                <span className="text-secondary">«{fallback.text}»</span>
              </>
            ) : (
              'Пусто — используется текст связанного вопроса (не удалось его загрузить).'
            )
          ) : (
            'Переопределяет текст связанного вопроса на этом экране.'
          )
        }
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            aria-describedby={describedBy}
            className={ADMIN_INPUT}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={fallback?.text ?? 'Текст связанного вопроса'}
          />
        )}
      </AdminField>

      <AdminField
        label="Иконка"
        locked={iconLocked}
        lockReason={LOCK_REASON}
        hint={usingFallbackIcon ? 'Пусто — берётся иконка связанного вопроса.' : undefined}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            aria-describedby={describedBy}
            className={cn(ADMIN_INPUT, 'text-center max-w-[120px]')}
            value={icon}
            onChange={(e) => onIconChange(e.target.value)}
            placeholder={fallback?.icon || '—'}
          />
        )}
      </AdminField>
    </AdminCard>
  );
}
