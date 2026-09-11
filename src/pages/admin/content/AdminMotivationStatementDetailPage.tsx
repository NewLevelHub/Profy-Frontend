import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import type {
  AdminMotivationStatementDetail,
  AdminMotivationStatementListItem,
  AdminMotivationStatementUpdateRequest,
  MotivationCategory,
} from '@/shared/types';

const EDITABLE_KEYS = ['category', 'text', 'text_junior'] as const satisfies readonly (keyof AdminMotivationStatementUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  category: 'admin:statements.field.category',
  text: 'admin:statements.field.text',
  text_junior: 'admin:statements.field.textJunior',
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
  'admin:common.lockReason';

/** Enough to cover the whole statement bank in one request; see the list page. */
const SIBLING_FETCH_LIMIT = 99;

export default function AdminMotivationStatementDetailPage() {
  const { t } = useTranslation('admin');
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
        if (!cancelled) setLoadError(t('statements.loadOneError'));
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

  if (loading) return <AdminLoading label={t('statements.loadingOne')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('statements.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));
  const conflicting = siblings.filter((sibling) => sibling.category === form.category);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: t('statements.title'), to: listReturnPath('/admin/content/motivation-statements') },
          { label: t('statements.triplet', { index: detail.triplet_index }) },
        ]}
        title={detail.text}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            <LocaleBadge locale={detail.locale} />{' '}
            {t('statements.detailMeta', { index: detail.triplet_index, category: t(MOTIVATION_CATEGORY_LABELS[detail.category]) })}
          </p>
        }
      />

      <AdminCard
        title={t('common.contentCard')}
        description={t('statements.contentDescription')}
      >
        <AdminField
          label={t('motivationPairs.col.category')}
          locked={locked.has('category')}
          lockReason={LOCK_REASON}
          error={
            conflicting.length > 0
              ? t('statements.categoryTaken', { index: detail.triplet_index })
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
                  {t(MOTIVATION_CATEGORY_LABELS[key])}
                </option>
              ))}
            </AdminSelect>
          )}
        </AdminField>

        <AdminField label={t('statements.field.textLabel')} locked={locked.has('text')} lockReason={LOCK_REASON}>
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
          label={t('statements.field.textJuniorLabel')}
          locked={locked.has('text_junior')}
          lockReason={LOCK_REASON}
          hint={t('statements.juniorHint')}
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
        title={t('statements.siblingsTitle', { index: detail.triplet_index })}
        description={t('statements.siblingsDescription')}
        aside={
          conflicting.length > 0 ? (
            <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger font-semibold')}>
              <AlertTriangle size={13} />
              {t('statements.duplicateShort')}
            </span>
          ) : null
        }
      >
        {siblings.length === 0 ? (
          <p className={cn(ADMIN_META, 'm-0')}>{t('statements.noSiblings')}</p>
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
                      {t(MOTIVATION_CATEGORY_LABELS[sibling.category])}
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
            ? t('statements.cannotSave')
            : null
        }
      />
    </>
  );
}
