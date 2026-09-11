import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_INPUT, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import type { AdminMotivationPairDetail, AdminMotivationPairUpdateRequest, MotivationCategory } from '@/shared/types';

const EDITABLE_KEYS = ['category', 'text_a', 'text_b'] as const;

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  category: 'admin:motivationPairs.field.category',
  text_a: 'admin:motivationPairs.field.textA',
  text_b: 'admin:motivationPairs.field.textB',
};

interface FormState {
  category: MotivationCategory;
  text_a: string;
  text_b: string;
}

function toFormState(detail: AdminMotivationPairDetail): FormState {
  // `category_a` and `category_b` are meant to always be equal — a pair is two
  // poles of ONE category, not a comparison of two. The form exposes a single
  // selector and writes both on save.
  return { category: detail.category_a, text_a: detail.text_a, text_b: detail.text_b };
}

const LOCK_REASON =
  'admin:common.lockReason';

export default function AdminMotivationPairDetailPage() {
  const { t } = useTranslation('admin');
  const { pairId } = useParams<{ pairId: string }>();
  const [detail, setDetail] = useState<AdminMotivationPairDetail | null>(null);
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
        const data = await adminApi.getMotivationPair(pairId!);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setLoadError(t('motivationPairs.loadOneError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pairId, reloadToken]);

  /**
   * Сколько пар приходится на каждую категорию сейчас.
   *
   * Банк держит ровно 2 пары на каждую из 9 категорий — на этом стоит равный
   * вес мотивов в подсчёте. Смена категории у одной пары ломает баланс: у
   * новой станет три, у прежней одна. Бэкенд этого не проверяет и такую правку
   * молча примет, поэтому список подтягивается сюда одним запросом — как
   * соседи по тройке на экране утверждений.
   */
  const [categoryCounts, setCategoryCounts] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .listMotivationPairs({ page: 1, limit: 100 })
      .then((data) => {
        if (cancelled || data.items.length !== data.total) return;
        const counts = new Map<string, number>();
        for (const item of data.items) {
          counts.set(item.category_a, (counts.get(item.category_a) ?? 0) + 1);
        }
        setCategoryCounts(counts);
      })
      .catch(() => {
        // Сверка — подсказка, а не условие работы экрана.
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, patch, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminMotivationPairDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (nextPatch) => {
      const wire: AdminMotivationPairUpdateRequest = {};
      if ('category' in nextPatch) {
        wire.category_a = form!.category;
        wire.category_b = form!.category;
      }
      if ('text_a' in nextPatch) wire.text_a = form!.text_a;
      if ('text_b' in nextPatch) wire.text_b = form!.text_b;
      const updated = await adminApi.updateMotivationPair(pairId!, wire);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label={t('questionPairs.loadingOne')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('questionPairs.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));
  const categoriesDiverged = detail.category_a !== detail.category_b;

  // Что станет с балансом, если сохранить выбранную сейчас категорию.
  const categoryMoved = form.category !== detail.category_a;
  const nextCount = categoryCounts && categoryMoved ? (categoryCounts.get(form.category) ?? 0) + 1 : null;
  const leftCount = categoryCounts && categoryMoved ? (categoryCounts.get(detail.category_a) ?? 1) - 1 : null;

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: t('motivationPairs.title'), to: listReturnPath('/admin/content/motivation-pairs') },
          { label: t('motivationPairs.pairLabel', { index: detail.pair_index }) },
        ]}
        title={t('motivationPairs.detailTitle', { index: detail.pair_index })}
        meta={
          <span className="flex items-center gap-2">
            <LocaleBadge locale={detail.locale} />
            {t(MOTIVATION_CATEGORY_LABELS[detail.category_a])}
          </span>
        }
      />

      <div className="bg-raised border border-default rounded-[3px] p-4">
        <p className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>{t('common.studentPreview')}</p>
        <div className="grid grid-cols-2 gap-3">
          {[form.text_a, form.text_b].map((text, index) => (
            <div
              key={index}
              // Одинаковая высота и вертикальный центр: одна сторона почти
              // всегда переносится на две строки, другая нет, и без этого
              // короткая висела в верхнем углу своей карточки.
              className="bg-surface border border-default rounded-[3px] p-4 min-h-[72px] flex items-center justify-center text-center"
            >
              <span className={cn(ADMIN_TEXT, 'text-primary text-balance')}>{text || '—'}</span>
            </div>
          ))}
        </div>
        <p className={cn(ADMIN_TEXT, 'text-muted text-center mt-4')}>
          {t('motivationPairs.previewHint')}
        </p>
      </div>

      {categoriesDiverged && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3 rounded-[3px] border border-danger bg-danger-subtle"
        >
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
              {t('motivationPairs.mismatchLead', { a: t(MOTIVATION_CATEGORY_LABELS[detail.category_a]), b: t(MOTIVATION_CATEGORY_LABELS[detail.category_b]) })}
            </p>
            <p className={cn(ADMIN_TEXT, 'text-danger mt-1')}>
              {t('motivationPairs.mismatchExplain')}
            </p>
          </div>
        </div>
      )}

      <AdminCard
        title={t('common.contentCard')}
        description={t('motivationPairs.contentDescription')}
      >
        <AdminField
          label={t('motivationPairs.field.categoryLabel')}
          locked={locked.has('category_a') || locked.has('category_b')}
          lockReason={LOCK_REASON}
          // Предупреждение, а не запрет: банк держит по 2 пары на категорию,
          // но это его конструкция, а не ограничение схемы — админ может знать,
          // что делает. Молча ломать баланс экран всё же не должен.
          hint={
            nextCount != null && leftCount != null && (nextCount !== 2 || leftCount !== 2) ? (
              <span className="text-accent">
                {t('motivationPairs.rebalanceWarning', { to: t(MOTIVATION_CATEGORY_LABELS[form.category]), nextCount, from: t(MOTIVATION_CATEGORY_LABELS[detail.category_a]), leftCount })}
              </span>
            ) : undefined
          }
        >
          {({ id, describedBy }) => (
            <AdminSelect
              id={id}
              aria-describedby={describedBy}
              className="max-w-[320px]"
              value={form.category}
              onChange={(e) => setField('category', e.target.value as MotivationCategory)}
            >
              {(Object.keys(MOTIVATION_CATEGORY_LABELS) as MotivationCategory[]).map((key) => (
                <option key={key} value={key}>
                  {t(MOTIVATION_CATEGORY_LABELS[key])}
                </option>
              ))}
            </AdminSelect>
          )}
        </AdminField>

        <div className="grid gap-3.5 lg:grid-cols-2">
          <AdminField label={t('motivationPairs.field.textALabel')} locked={locked.has('text_a')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <textarea
                id={id}
                aria-describedby={describedBy}
                className={cn(ADMIN_INPUT, 'min-h-[72px] resize-y')}
                value={form.text_a}
                onChange={(e) => setField('text_a', e.target.value)}
              />
            )}
          </AdminField>

          <AdminField label={t('motivationPairs.field.textBLabel')} locked={locked.has('text_b')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <textarea
                id={id}
                aria-describedby={describedBy}
                className={cn(ADMIN_INPUT, 'min-h-[72px] resize-y')}
                value={form.text_b}
                onChange={(e) => setField('text_b', e.target.value)}
              />
            )}
          </AdminField>
        </div>
      </AdminCard>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={
          // Saving the category writes both sides, so the bar says so rather
          // than naming one field and quietly changing two.
          'category' in patch
            ? [...changedLabels.filter((l) => l !== FIELD_LABELS.category), t('motivationPairs.field.categoryLabel')]
            : changedLabels
        }
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
      />
    </>
  );
}
