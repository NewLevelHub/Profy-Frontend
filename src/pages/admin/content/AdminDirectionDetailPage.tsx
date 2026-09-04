import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminForm } from '@/shared/lib/useAdminForm';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import type { AdminDirectionDetail, AdminDirectionUpdateRequest } from '@/shared/types';

const EDITABLE_KEYS = [
  'name',
  'holland_code',
  'description',
  'professions',
  'skills_needed',
  'subjects_to_develop',
  'first_steps',
] as const satisfies readonly (keyof AdminDirectionUpdateRequest)[];

const FIELD_LABELS: Record<(typeof EDITABLE_KEYS)[number], string> = {
  name: 'название',
  holland_code: 'Holland code',
  description: 'описание',
  professions: 'профессии',
  skills_needed: 'навыки',
  subjects_to_develop: 'предметы',
  first_steps: 'первые шаги',
};

interface FormState {
  name: string;
  holland_code: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}

function toFormState(detail: AdminDirectionDetail): FormState {
  return {
    name: detail.name,
    holland_code: detail.holland_code,
    description: detail.description,
    professions: detail.professions,
    skills_needed: detail.skills_needed,
    subjects_to_develop: detail.subjects_to_develop,
    first_steps: detail.first_steps,
  };
}

const LOCK_REASON =
  'Значение задано вручную. Автообновление контент-банка не перезапишет его и не удалит строку.';

const HOLLAND_LETTERS = 'RIASEC';

/**
 * A Holland code is a sequence of the six RIASEC letters, most-dominant first.
 * The field was a free text input: "XYZ" saved happily and then matched no
 * assessment result, silently taking the direction out of every recommendation.
 */
function validateHollandCode(code: string): string | undefined {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return 'Код обязателен — по нему направление подбирается ученику.';
  const invalid = [...trimmed].filter((letter) => !HOLLAND_LETTERS.includes(letter));
  if (invalid.length > 0) {
    return `Допустимы только буквы R, I, A, S, E, C. Лишние: ${[...new Set(invalid)].join(', ')}`;
  }
  if (new Set(trimmed).size !== trimmed.length) return 'Буквы не должны повторяться.';
  return undefined;
}

export default function AdminDirectionDetailPage() {
  const { directionId } = useParams<{ directionId: string }>();
  const [detail, setDetail] = useState<AdminDirectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!directionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await adminApi.getDirection(directionId!);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setLoadError('Не удалось загрузить направление');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [directionId, reloadToken]);

  const initial = useMemo(() => (detail ? toFormState(detail) : null), [detail]);

  const { form, setField, patch, dirty, changedLabels, saving, state, reset, save } = useAdminForm<
    FormState,
    AdminDirectionDetail
  >({
    initial,
    keys: EDITABLE_KEYS,
    labels: FIELD_LABELS,
    toForm: toFormState,
    onSave: async (nextPatch) => {
      const updated = await adminApi.updateDirection(directionId!, nextPatch as AdminDirectionUpdateRequest);
      setDetail(updated);
      return updated;
    },
  });

  if (loading) return <AdminLoading label="Загрузка направления" />;
  if (loadError || !detail || !form) {
    return <AdminError message={loadError || 'Направление не найдено'} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const locked = new Set(Object.keys(detail.overrides));
  const hollandError = validateHollandCode(form.holland_code);
  const nameChanged = 'name' in patch;
  const catalogEmpty =
    form.professions.length === 0 &&
    form.skills_needed.length === 0 &&
    form.subjects_to_develop.length === 0 &&
    form.first_steps.length === 0;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: 'Направления', to: listReturnPath('/admin/content/directions') }, { label: detail.name }]}
        title={detail.name}
        meta={`${detail.holland_code} · ${detail.slug}`}
      />

      <AdminCard title="Основное" description="Название и код, по которому направление подбирается ученику.">
        <div className="grid gap-3.5 sm:grid-cols-[1fr_200px]">
          <AdminField
            label="Название"
            locked={locked.has('name')}
            lockReason={LOCK_REASON}
            hint={
              nameChanged ? (
                <>
                  Адрес направления останется прежним:{' '}
                  <span className="font-mono text-mono-xs">{detail.slug}</span> — slug не
                  перегенерируется.
                </>
              ) : undefined
            }
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                className={ADMIN_INPUT}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            )}
          </AdminField>

          <AdminField
            label="Holland code"
            locked={locked.has('holland_code')}
            lockReason={LOCK_REASON}
            error={hollandError}
            hint={hollandError ? undefined : 'Буквы RIASEC, ведущая — первой.'}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={cn(ADMIN_INPUT, 'font-mono tracking-widest uppercase', invalid && 'border-danger')}
                value={form.holland_code}
                onChange={(e) => setField('holland_code', e.target.value.toUpperCase())}
                maxLength={6}
              />
            )}
          </AdminField>
        </div>

        <AdminField label="Описание" locked={locked.has('description')} lockReason={LOCK_REASON}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className={ADMIN_TEXTAREA}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          )}
        </AdminField>
      </AdminCard>

      <AdminCard
        title="Каталог направления"
        description={
          catalogEmpty
            ? 'Пока пусто. Сид заполняет только название и код — остальное заполняется вручную и после этого не перезаписывается.'
            : 'Что ученик увидит на странице направления.'
        }
      >
        <AdminField label="Профессии" locked={locked.has('professions')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.professions}
            onChange={(v) => setField('professions', v)}
            placeholder="Например, Инженер-конструктор"
            emptyNote="Пусто. Список профессий уходит в отчёт ученика и в контекст, по которому генерируются разбор направления и роадмап — там сейчас пусто."
          />
        </AdminField>

        <AdminField label="Нужные навыки" locked={locked.has('skills_needed')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.skills_needed}
            onChange={(v) => setField('skills_needed', v)}
            placeholder="Например, Работа с чертежами"
          />
        </AdminField>

        <AdminField label="Предметы для развития" locked={locked.has('subjects_to_develop')} lockReason={LOCK_REASON}>
          <StringListEditor
            values={form.subjects_to_develop}
            onChange={(v) => setField('subjects_to_develop', v)}
            placeholder="Например, Физика"
          />
        </AdminField>

        <AdminField
          label="Первые шаги"
          locked={locked.has('first_steps')}
          lockReason={LOCK_REASON}
          hint="Порядок важен — ученик идёт по шагам сверху вниз."
        >
          {/* `ordered` here and not on the lists above: the other three are
              sets, this one is a sequence the student follows. */}
          <StringListEditor
            ordered
            values={form.first_steps}
            onChange={(v) => setField('first_steps', v)}
            placeholder="Например, Сходить на день открытых дверей"
          />
        </AdminField>
      </AdminCard>

      <p className={ADMIN_META}>
        Slug ({detail.slug}) — адрес направления в продукте, задаётся при создании и здесь не меняется.
      </p>

      <AdminSaveBar
        dirty={dirty}
        saving={saving}
        changedLabels={changedLabels}
        onSave={() => save()}
        onReset={reset}
        state={state}
        locksOnSave
        blockedReason={hollandError && 'holland_code' in patch ? `Holland code: ${hollandError}` : null}
      />
    </>
  );
}
