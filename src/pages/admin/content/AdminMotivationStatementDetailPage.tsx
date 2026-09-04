import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { OverrideNotice } from '@/shared/ui/admin/OverrideNotice';
import { useOverrideRevert } from './useOverrideRevert';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type {
  AdminMotivationStatementDetail,
  AdminMotivationStatementListItem,
  AdminMotivationStatementUpdateRequest,
  MotivationCategory,
} from '@/shared/types';

const EDITABLE_KEYS = ['category', 'text', 'text_junior'] as const satisfies readonly (keyof AdminMotivationStatementUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  category: 'категория',
  text: 'текст',
  text_junior: 'текст для junior',
};

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

const LOCK_REASON =
  'Значение задано вручную. Автообновление контент-банка не перезапишет его и не удалит строку.';

/** Enough to cover the whole statement bank in one request; see the list page. */
const SIBLING_FETCH_LIMIT = 99;

export default function AdminMotivationStatementDetailPage() {
  const { statementId } = useParams<{ statementId: string }>();
  const [detail, setDetail] = useState<AdminMotivationStatementDetail | null>(null);
  const [siblings, setSiblings] = useState<AdminMotivationStatementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!statementId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getMotivationStatement(statementId!);
        if (cancelled) return;
        setDetail(data);

        // The other two statements of this triplet. There is no
        // `?triplet_index=` filter (docs/admin-backend-requests-pro-242.md §7),
        // so the bank is fetched once and filtered here — the category
        // uniqueness rule cannot be checked against rows you cannot see.
        const list = await adminApi.listMotivationStatements({ page: 1, limit: SIBLING_FETCH_LIMIT });
        if (cancelled) return;
        setSiblings(
          list.items.filter((item) => item.triplet_index === data.triplet_index && item.id !== data.id),
        );
      } catch {
        if (!cancelled) setLoadError('Не удалось загрузить утверждение');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [statementId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, patch, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminMotivationStatementDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (nextPatch) => {
      const wire = { ...nextPatch } as AdminMotivationStatementUpdateRequest;
      if ('text_junior' in wire) wire.text_junior = form!.text_junior.trim() || null;
      const updated = await adminApi.updateMotivationStatement(statementId!, wire);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label="Загрузка утверждения" />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || 'Утверждение не найдено'} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));

  const { fieldRevert, revertAll, revertingAll, error: revertError } = useOverrideRevert<AdminMotivationStatementDetail>({
    resource: 'motivation-statements',
    id: detail.id,
    overrides: detail.overrides,
    dirty,
    onReverted: setDetail,
  });
  const conflicting = siblings.filter((sibling) => sibling.category === form.category);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: 'Утверждения мотивации', to: listReturnPath('/admin/content/motivation-statements') },
          { label: `Тройка ${detail.triplet_index}` },
        ]}
        title={detail.text}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            Тройка {detail.triplet_index} · {MOTIVATION_CATEGORY_LABELS[detail.category]}. Ученик
            ранжирует три утверждения тройки: важнее всего / нейтрально / менее всего.
          </p>
        }
      />

      <OverrideNotice
        count={locked.size}
        pending={revertingAll}
        disabledReason={
          dirty
            ? 'Сначала сохраните или сбросьте черновик — возврат перечитывает строку с сервера.'
            : undefined
        }
        onRevertAll={revertAll}
        error={revertError}
      />
      <AdminCard
        title="Содержание"
        description="Взрослая формулировка используется для middle и senior; junior-вариант заменяет её на младшем треке."
      >
        <AdminField
          label="Категория"
          locked={locked.has('category')} revert={fieldRevert('category')}
          lockReason={LOCK_REASON}
          error={
            conflicting.length > 0
              ? `Эта категория уже занята в тройке ${detail.triplet_index}. Три утверждения тройки должны быть из разных категорий — иначе ранжирование их не различает.`
              : undefined
          }
        >
          {({ id, invalid, describedBy }) => (
            <AdminSelect
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className="max-w-[320px]"
              value={form.category}
              onChange={(e) => setField('category', e.target.value as MotivationCategory)}
            >
              {(Object.keys(MOTIVATION_CATEGORY_LABELS) as MotivationCategory[]).map((key) => (
                <option key={key} value={key}>
                  {MOTIVATION_CATEGORY_LABELS[key]}
                </option>
              ))}
            </AdminSelect>
          )}
        </AdminField>

        <AdminField label="Текст" locked={locked.has('text')} revert={fieldRevert('text')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')}
              value={form.text}
              onChange={(e) => setField('text', e.target.value)}
            />
          )}
        </AdminField>

        <AdminField
          label="Текст для junior"
          locked={locked.has('text_junior')} revert={fieldRevert('text_junior')}
          lockReason={LOCK_REASON}
          hint="Пусто — на всех возрастах покажется текст выше."
        >
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={cn(ADMIN_INPUT, 'min-h-[64px] resize-y')}
              value={form.text_junior}
              onChange={(e) => setField('text_junior', e.target.value)}
            />
          )}
        </AdminField>
      </AdminCard>

      <AdminCard
        title={`Остальные утверждения тройки ${detail.triplet_index}`}
        description="Категории всех трёх должны отличаться. Бэкенд это не проверяет — сверка здесь."
        aside={
          conflicting.length > 0 ? (
            <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-semibold')}>
              <AlertTriangle size={13} />
              Категория повторяется
            </span>
          ) : null
        }
      >
        {siblings.length === 0 ? (
          <p className={cn(ADMIN_META, 'm-0')}>Другие утверждения тройки не найдены.</p>
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {siblings.map((sibling) => {
              const clash = sibling.category === form.category;
              return (
                <li
                  key={sibling.id}
                  className={cn(
                    'flex items-start gap-3 p-2.5 rounded-[3px] border',
                    clash ? 'border-danger bg-danger-subtle' : 'border-default bg-page',
                  )}
                >
                  <div className="min-w-0">
                    <Link
                      to={`/admin/content/motivation-statements/${sibling.id}`}
                      className={cn(ADMIN_TEXT, 'text-primary hover:text-brand hover:underline')}
                    >
                      {sibling.text}
                    </Link>
                    <p className={cn(ADMIN_META, 'mt-1', clash && 'text-danger')}>
                      {MOTIVATION_CATEGORY_LABELS[sibling.category]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
        blockedReason={
          conflicting.length > 0 && 'category' in patch
            ? 'Нельзя сохранить: категория повторяется внутри тройки.'
            : null
        }
      />
    </>
  );
}
