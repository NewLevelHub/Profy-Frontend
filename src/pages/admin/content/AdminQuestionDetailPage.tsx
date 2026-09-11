import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import {
  AGE_TIER_LABELS,
  BIGFIVE_DOMAIN_LABELS,
  HOLLAND_TYPE_LABELS,
  INSTRUMENT_LABELS,
  MI_TYPE_LABELS,
  QUESTION_KEYED_LABELS,
} from '@/shared/lib/contentLabels';
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
  AdminQuestionDetail,
  AdminQuestionUpdateRequest,
  AgeGroup,
  BigFiveDomain,
  HollandType,
  MIType,
  QuestionKeyed,
} from '@/shared/types';

const EDITABLE_KEYS = [
  'text',
  'short_text',
  'icon',
  'age_tier',
  'riasec_type',
  'bigfive_domain',
  'keyed',
  'facet',
  'mi_category',
] as const satisfies readonly (keyof AdminQuestionUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  text: 'admin:questions.field.text',
  short_text: 'admin:questions.field.shortText',
  icon: 'admin:questions.field.icon',
  age_tier: 'admin:questions.field.ageTier',
  riasec_type: 'admin:questions.field.riasecType',
  bigfive_domain: 'admin:questions.field.bigfiveDomain',
  keyed: 'admin:questions.field.keyed',
  facet: 'admin:questions.field.facet',
  mi_category: 'admin:questions.field.miCategory',
};

interface FormState {
  text: string;
  short_text: string;
  icon: string;
  age_tier: AgeGroup;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  keyed: QuestionKeyed | null;
  facet: string;
  mi_category: MIType | null;
}

function toFormState(detail: AdminQuestionDetail): FormState {
  return {
    text: detail.text,
    short_text: detail.short_text ?? '',
    icon: detail.icon ?? '',
    age_tier: detail.age_tier,
    riasec_type: detail.riasec_type,
    bigfive_domain: detail.bigfive_domain,
    keyed: detail.keyed,
    facet: detail.facet ?? '',
    mi_category: detail.mi_category,
  };
}

const LOCK_REASON =
  'admin:common.lockReason';

export default function AdminQuestionDetailPage() {
  const { t } = useTranslation('admin');
  const { questionId } = useParams<{ questionId: string }>();
  const [detail, setDetail] = useState<AdminQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getQuestion(questionId!);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setLoadError(t('questions.loadOneError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [questionId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminQuestionDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (patch) => {
      const updated = await adminApi.updateQuestion(questionId!, patch as AdminQuestionUpdateRequest);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label={t('questions.loadingOne')} />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || t('questions.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));

  return (
    <>
      {/* Крошка и заголовок — по самому вопросу, а не «Порядок 1»: порядок
          свой у каждой пары инструмент×возраст, поэтому «Порядок 1» не
          опознаёт строку ни в списке, ни в истории браузера. Заголовок берёт
          сохранённое значение, превью ниже — черновик: при правке текста сразу
          видно, что было и что станет. */}
      <AdminPageHeader
        crumbs={[
          { label: t('questions.title'), to: listReturnPath('/admin/content/questions') },
          { label: detail.short_text || detail.text },
        ]}
        title={detail.short_text || detail.text}
        meta={
          <p className={cn(ADMIN_META, 'm-0 flex items-center gap-2')}>
            <LocaleBadge locale={detail.locale} />
            {INSTRUMENT_LABELS[detail.instrument]} · {AGE_TIER_LABELS[detail.age_tier]} · {t('questions.orderInline', { order: detail.order })}
          </p>
        }
      />

      {/* What the student actually sees, built from the values in the form —
          the previous screen was a bare list of inputs with no way to tell how
          a rewritten question would read on the Likert screen. */}
      <QuestionPreview text={form.text} shortText={form.short_text} icon={form.icon} />

      <AdminCard
        title={t('common.contentCard')}
        description={t('questions.contentDescription')}
      >
        <AdminField label={t('questions.field.textLabel')} locked={locked.has('text')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={cn(ADMIN_INPUT, 'min-h-[72px] resize-y')}
              value={form.text}
              onChange={(e) => setField('text', e.target.value)}
            />
          )}
        </AdminField>

        <div className="grid gap-3.5 sm:grid-cols-[1fr_140px]">
          <AdminField
            label={t('questions.field.shortTextLabel')}
            locked={locked.has('short_text')}
            lockReason={LOCK_REASON}
            hint={t('questions.shortTextHint')}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.short_text}
                onChange={(e) => setField('short_text', e.target.value)}
              />
            )}
          </AdminField>

          {/* Отдельного превью эмодзи рядом с полем нет: карточка «Как увидит
              ученик» вверху уже показывает его в нужном размере, а тут он
              дублировался в 22px рядом с тем же символом в самом поле. */}
          <AdminField label={t('questionPairs.icon')} locked={locked.has('icon')} lockReason={LOCK_REASON} hint={t('questions.iconHint')}>
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={cn(ADMIN_INPUT, 'text-center')}
                value={form.icon}
                onChange={(e) => setField('icon', e.target.value)}
              />
            )}
          </AdminField>
        </div>

        <AdminField
          label={t('questions.field.ageTierLabel')}
          locked={locked.has('age_tier')}
          lockReason={LOCK_REASON}
          hint={t('questions.ageTierHint')}
        >
          {({ id, describedBy }) => (
            <AdminSelect
              id={id}
              aria-describedby={describedBy}
              className="max-w-[220px]"
              value={form.age_tier}
              onChange={(e) => setField('age_tier', e.target.value as AgeGroup)}
            >
              {(Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => (
                <option key={key} value={key}>
                  {AGE_TIER_LABELS[key]}
                </option>
              ))}
            </AdminSelect>
          )}
        </AdminField>
      </AdminCard>

      {/* Only this row's instrument gets a field set — showing all three would
          invite cross-instrument data that no scoring path reads. */}
      {detail.instrument === 'riasec' && (
        <AdminCard title="RIASEC" description={t('questions.riasecDescription')}>
          <AdminField label={t('questions.field.typeLabel')} locked={locked.has('riasec_type')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <AdminSelect
                id={id}
                aria-describedby={describedBy}
                className="max-w-[320px]"
                value={form.riasec_type ?? ''}
                onChange={(e) => setField('riasec_type', (e.target.value || null) as HollandType | null)}
              >
                <option value="">{t('questions.notSetM')}</option>
                {(Object.keys(HOLLAND_TYPE_LABELS) as HollandType[]).map((key) => (
                  <option key={key} value={key}>
                    {t(HOLLAND_TYPE_LABELS[key])}
                  </option>
                ))}
              </AdminSelect>
            )}
          </AdminField>
        </AdminCard>
      )}

      {detail.instrument === 'big_five' && (
        <AdminCard title="Big Five" description={t('questions.bigfiveDescription')}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <AdminField label={t('questions.field.domainLabel')} locked={locked.has('bigfive_domain')} lockReason={LOCK_REASON}>
              {({ id, describedBy }) => (
                <AdminSelect
                  id={id}
                  aria-describedby={describedBy}
                  value={form.bigfive_domain ?? ''}
                  onChange={(e) => setField('bigfive_domain', (e.target.value || null) as BigFiveDomain | null)}
                >
                  <option value="">{t('questions.notSetM')}</option>
                  {(Object.keys(BIGFIVE_DOMAIN_LABELS) as BigFiveDomain[]).map((key) => (
                    <option key={key} value={key}>
                      {t(BIGFIVE_DOMAIN_LABELS[key])}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            <AdminField
              label={t('questions.field.keyedLabel')}
              locked={locked.has('keyed')}
              lockReason={LOCK_REASON}
              hint={t('questions.keyedHint')}
            >
              {({ id, describedBy }) => (
                <AdminSelect
                  id={id}
                  aria-describedby={describedBy}
                  value={form.keyed ?? ''}
                  onChange={(e) => setField('keyed', (e.target.value || null) as QuestionKeyed | null)}
                >
                  <option value="">{t('questions.notSetN')}</option>
                  {(Object.keys(QUESTION_KEYED_LABELS) as QuestionKeyed[]).map((key) => (
                    <option key={key} value={key}>
                      {t(QUESTION_KEYED_LABELS[key])}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            <AdminField
              label={t('questions.field.facetLabel')}
              locked={locked.has('facet')}
              lockReason={LOCK_REASON}
              className="sm:col-span-2"
            >
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  className={ADMIN_INPUT}
                  value={form.facet}
                  onChange={(e) => setField('facet', e.target.value)}
                />
              )}
            </AdminField>
          </div>
        </AdminCard>
      )}

      {detail.instrument === 'mi' && (
        <AdminCard
          title="Multiple Intelligences"
          description={t('questions.miDescription')}
        >
          <AdminField label={t('motivationPairs.col.category')} locked={locked.has('mi_category')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <AdminSelect
                id={id}
                aria-describedby={describedBy}
                className="max-w-[320px]"
                value={form.mi_category ?? ''}
                onChange={(e) => setField('mi_category', (e.target.value || null) as MIType | null)}
              >
                <option value="">{t('questions.notSetF')}</option>
                {(Object.keys(MI_TYPE_LABELS) as MIType[]).map((key) => (
                  <option key={key} value={key}>
                    {t(MI_TYPE_LABELS[key])}
                  </option>
                ))}
              </AdminSelect>
            )}
          </AdminField>
        </AdminCard>
      )}

      {/* Sentence case, не мониширинный капс: это предложение, которое читают,
          а не машинная метка. MONO_LABEL остался за заголовками колонок и
          подписями полей — см. density.ts. */}
      <p className={cn(ADMIN_META, 'm-0')}>
        {t('questions.orderNote', { order: detail.order })}
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
      />
    </>
  );
}

function QuestionPreview({ text, shortText, icon }: { text: string; shortText: string; icon: string }) {
  const { t } = useTranslation('admin');
  return (
    <div className="bg-raised border border-default rounded-[3px] p-4">
      {/* Заголовок панели, а не подпись поля: моношириный капс по density.ts
          оставлен за заголовками колонок и подписями полей. */}
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>{t('common.studentPreview')}</p>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="text-2xl leading-none" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-sans text-body-md text-primary m-0">{text || '—'}</p>
          {shortText && (
            <p className={cn(ADMIN_TEXT, 'text-muted mt-1.5')}>
              {t('questions.onPairScreen')} <span className="text-secondary">{shortText}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
