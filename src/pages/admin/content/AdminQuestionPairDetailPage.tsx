import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import type { AdminQuestionPairDetail, AdminQuestionPairUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'frame',
  'option_a_text',
  'option_b_text',
  'option_a_icon',
  'option_b_icon',
] as const satisfies readonly (keyof AdminQuestionPairUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  frame: 'admin:questionPairs.field.frame',
  option_a_text: 'admin:questionPairs.field.textA',
  option_b_text: 'admin:questionPairs.field.textB',
  option_a_icon: 'admin:questionPairs.field.iconA',
  option_b_icon: 'admin:questionPairs.field.iconB',
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
  'admin:common.lockReason';

/** Text and icon of a linked question — what a blank option falls back to. */
interface Fallback {
  text: string;
  icon: string;
}

export default function AdminQuestionPairDetailPage() {
  const { t } = useTranslation('admin');
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
        if (!cancelled) setLoadError(t('questionPairs.loadOneError'));
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

  if (loading) return <AdminLoading label={t('questionPairs.loadingOne')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('questionPairs.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
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
          { label: t('questionPairs.title'), to: listReturnPath('/admin/content/question-pairs') },
          { label: t('questionPairs.pairNo', { index: detail.pair_index }) },
        ]}
        title={t('questionPairs.detailTitle', { index: detail.pair_index })}
        meta={
          <span className="flex items-center gap-2">
            <LocaleBadge locale={detail.locale} />
            {`${INSTRUMENT_LABELS[detail.instrument]} · ${AGE_TIER_LABELS[detail.age_tier]}`}
          </span>
        }
      />

      <PairPreview
        frame={form.frame}
        a={{ text: effectiveA, icon: effectiveIconA }}
        b={{ text: effectiveB, icon: effectiveIconB }}
      />

      <AdminCard
        title={t('questionPairs.frameTitle')}
        description={t('questionPairs.frameDescription')}
      >
        <AdminField label={t('questionPairs.field.frameLabel')} locked={locked.has('frame')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              className={ADMIN_INPUT}
              value={form.frame}
              onChange={(e) => setField('frame', e.target.value)}
              placeholder={t('questionPairs.framePlaceholder')}
            />
          )}
        </AdminField>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PairSideCard
          label={t('questionPairs.sideA')}
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
          label={t('questionPairs.sideB')}
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
        {t('questionPairs.boundQuestions')}
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
  const { t } = useTranslation('admin');
  return (
    <div className="bg-raised border border-default rounded-[3px] p-4">
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>{t('common.studentPreview')}</p>
      {frame && <p className="font-sans text-body-md text-primary text-center mb-3">{frame}</p>}
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((side, index) => (
          <div
            key={index}
            className="bg-surface border border-default rounded-[3px] p-3 flex flex-col items-center gap-2 text-center"
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
  const { t } = useTranslation('admin');
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
          {t('questionPairs.openQuestion')}
        </Link>
      }
    >
      <AdminField
        label={t('questionPairs.optionText')}
        locked={textLocked}
        lockReason={LOCK_REASON}
        hint={
          usingFallbackText ? (
            fallback ? (
              <>
                {t('questionPairs.emptyUsesQuestion')}{' '}
                <span className="text-secondary">«{fallback.text}»</span>
              </>
            ) : (
              t('questionPairs.emptyUsesQuestionUnloaded')
            )
          ) : (
            t('questionPairs.overridesQuestion')
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
            placeholder={fallback?.text ?? t('questionPairs.boundQuestionText')}
          />
        )}
      </AdminField>

      <AdminField
        label={t('questionPairs.icon')}
        locked={iconLocked}
        lockReason={LOCK_REASON}
        hint={usingFallbackIcon ? t('questionPairs.emptyUsesQuestionIcon') : undefined}
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
