import { useEffect, useMemo, useState } from 'react';
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
  text: 'текст вопроса',
  short_text: 'короткий текст',
  icon: 'иконка',
  age_tier: 'возрастная видимость',
  riasec_type: 'тип RIASEC',
  bigfive_domain: 'домен Big Five',
  keyed: 'ключевание',
  facet: 'фасет',
  mi_category: 'категория MI',
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
  'Значение задано вручную. Автообновление контент-банка не перезапишет его и не удалит строку.';

export default function AdminQuestionDetailPage() {
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
        if (!cancelled) setLoadError('Не удалось загрузить вопрос');
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

  if (loading) return <AdminLoading label="Загрузка вопроса" />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || 'Вопрос не найден'} onRetry={() => setReloadToken((t) => t + 1)} />;
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
          { label: 'Вопросы', to: listReturnPath('/admin/content/questions') },
          { label: detail.short_text || detail.text },
        ]}
        title={detail.short_text || detail.text}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {INSTRUMENT_LABELS[detail.instrument]} · {AGE_TIER_LABELS[detail.age_tier]} · порядок{' '}
            {detail.order}
          </p>
        }
      />

      {/* What the student actually sees, built from the values in the form —
          the previous screen was a bare list of inputs with no way to tell how
          a rewritten question would read on the Likert screen. */}
      <QuestionPreview text={form.text} shortText={form.short_text} icon={form.icon} />

      <AdminCard
        title="Содержание"
        description="Текст, который увидит ученик. Короткий вариант используется на экранах выбора «или / или» у junior."
      >
        <AdminField label="Текст вопроса" locked={locked.has('text')} lockReason={LOCK_REASON}>
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
            label="Короткий текст"
            locked={locked.has('short_text')}
            lockReason={LOCK_REASON}
            hint="Пусто — на экране пары покажется полный текст выше."
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
          <AdminField label="Иконка" locked={locked.has('icon')} lockReason={LOCK_REASON} hint="Один эмодзи.">
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
          label="Возрастная видимость"
          locked={locked.has('age_tier')}
          lockReason={LOCK_REASON}
          hint="Вопрос виден выбранной группе и всем старшим: junior ⊆ middle ⊆ senior."
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
        <AdminCard title="RIASEC" description="К какому типу Холланда относится ответ на этот вопрос.">
          <AdminField label="Тип" locked={locked.has('riasec_type')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <AdminSelect
                id={id}
                aria-describedby={describedBy}
                className="max-w-[320px]"
                value={form.riasec_type ?? ''}
                onChange={(e) => setField('riasec_type', (e.target.value || null) as HollandType | null)}
              >
                <option value="">Не задан</option>
                {(Object.keys(HOLLAND_TYPE_LABELS) as HollandType[]).map((key) => (
                  <option key={key} value={key}>
                    {HOLLAND_TYPE_LABELS[key]}
                  </option>
                ))}
              </AdminSelect>
            )}
          </AdminField>
        </AdminCard>
      )}

      {detail.instrument === 'big_five' && (
        <AdminCard title="Big Five" description="Домен, фасет и направление шкалы.">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <AdminField label="Домен" locked={locked.has('bigfive_domain')} lockReason={LOCK_REASON}>
              {({ id, describedBy }) => (
                <AdminSelect
                  id={id}
                  aria-describedby={describedBy}
                  value={form.bigfive_domain ?? ''}
                  onChange={(e) => setField('bigfive_domain', (e.target.value || null) as BigFiveDomain | null)}
                >
                  <option value="">Не задан</option>
                  {(Object.keys(BIGFIVE_DOMAIN_LABELS) as BigFiveDomain[]).map((key) => (
                    <option key={key} value={key}>
                      {BIGFIVE_DOMAIN_LABELS[key]}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            <AdminField
              label="Ключевание"
              locked={locked.has('keyed')}
              lockReason={LOCK_REASON}
              hint="Обратный вопрос инвертирует балл при подсчёте."
            >
              {({ id, describedBy }) => (
                <AdminSelect
                  id={id}
                  aria-describedby={describedBy}
                  value={form.keyed ?? ''}
                  onChange={(e) => setField('keyed', (e.target.value || null) as QuestionKeyed | null)}
                >
                  <option value="">Не задано</option>
                  {(Object.keys(QUESTION_KEYED_LABELS) as QuestionKeyed[]).map((key) => (
                    <option key={key} value={key}>
                      {QUESTION_KEYED_LABELS[key]}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>

            <AdminField
              label="Фасет"
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
          description="Junior-трек использует категории MI вместо кодов RIASEC."
        >
          <AdminField label="Категория" locked={locked.has('mi_category')} lockReason={LOCK_REASON}>
            {({ id, describedBy }) => (
              <AdminSelect
                id={id}
                aria-describedby={describedBy}
                className="max-w-[320px]"
                value={form.mi_category ?? ''}
                onChange={(e) => setField('mi_category', (e.target.value || null) as MIType | null)}
              >
                <option value="">Не задана</option>
                {(Object.keys(MI_TYPE_LABELS) as MIType[]).map((key) => (
                  <option key={key} value={key}>
                    {MI_TYPE_LABELS[key]}
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
        Порядок ({detail.order}) и инструмент задаются контент-банком и здесь не редактируются.
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
  return (
    <div className="bg-raised border border-default rounded-[14px] p-4">
      {/* Заголовок панели, а не подпись поля: моношириный капс по density.ts
          оставлен за заголовками колонок и подписями полей. */}
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>Как увидит ученик</p>
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
              На экране выбора: <span className="text-secondary">{shortText}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
