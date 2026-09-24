import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_RADIUS, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychologistResultDetail, PsychologistResultPatch } from '@/shared/types';
import { ReviewTextField } from './components/ReviewTextField';
import { ReviewCardsEditor } from './components/ReviewCardsEditor';
import { ReviewCareersEditor } from './components/ReviewCareersEditor';
import { ReviewPersonalityNotesEditor } from './components/ReviewPersonalityNotesEditor';
import { ReviewStringListEditor } from './components/ReviewStringListEditor';

const EDITABLE_KEYS = [
  'summary',
  'careers',
  'strength_cards',
  'personality_notes',
  'thinking_style_notes',
  'motivation_highlights',
  'final_analysis',
] as const;

type EditableKey = (typeof EDITABLE_KEYS)[number];
type Draft = Pick<PsychologistResultDetail, EditableKey>;

const BRAND_BUTTON =
  'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand';

function toDraft(detail: PsychologistResultDetail): Draft {
  return {
    summary: detail.summary,
    careers: detail.careers,
    strength_cards: detail.strength_cards,
    personality_notes: detail.personality_notes,
    thinking_style_notes: detail.thinking_style_notes,
    motivation_highlights: detail.motivation_highlights,
    final_analysis: detail.final_analysis,
  };
}

function buildPatch(detail: PsychologistResultDetail, draft: Draft): PsychologistResultPatch {
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE_KEYS) {
    if (JSON.stringify(draft[key]) !== JSON.stringify(detail[key])) patch[key] = draft[key];
  }
  return patch as PsychologistResultPatch;
}

function validateDraft(draft: Draft): string | null {
  if (!draft.summary.trim()) return 'Сводка не может быть пустой';
  if (!draft.final_analysis.trim()) return 'Итог не может быть пустым';
  const sections: [string, typeof draft.strength_cards][] = [
    ['Сильные стороны', draft.strength_cards],
    ['Стиль мышления', draft.thinking_style_notes],
  ];
  for (const [name, cards] of sections) {
    if (cards.some((card) => !card.title.trim() || !card.description.trim())) {
      return `В блоке «${name}» есть карточка без заголовка или описания`;
    }
  }
  if (draft.motivation_highlights.some((item) => !item.trim())) {
    return 'Удалите пустые пункты мотивации';
  }
  return null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function errorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const status = err.response?.status;
  if (status === 409) return 'Отчёт уже опубликован — правки больше не принимаются';
  if (status === 404) return 'Отчёт не найден или ученик больше не назначен вам';
  if (status === 422) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    return typeof detail === 'string'
      ? `Сервер отклонил правки: ${detail}`
      : 'Сервер отклонил правки — проверьте, что все поля заполнены';
  }
  return fallback;
}

export interface PsychologistStudentReportEditorProps {
  studentId: string;
  assessmentId: string;
  onPublished?: (published: PsychologistResultDetail) => void;
}

export function PsychologistStudentReportEditor({
  studentId,
  assessmentId,
  onPublished,
}: PsychologistStudentReportEditorProps) {
  const [detail, setDetail] = useState<PsychologistResultDetail | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!studentId || !assessmentId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await psychologistApi.getResultForReview(studentId, assessmentId);
      setDetail(result);
      setDraft(toDraft(result));
    } catch (err) {
      setLoadError(errorMessage(err, 'Не удалось загрузить отчёт для проверки'));
    } finally {
      setLoading(false);
    }
  }, [studentId, assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useMemo(() => (detail && draft ? buildPatch(detail, draft) : {}), [detail, draft]);
  const isDirty = Object.keys(patch).length > 0;
  const isPublished = detail?.review_status === 'published';

  useUnsavedGuard(isDirty);

  function update<K extends EditableKey>(key: K, value: Draft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setNotice(null);
  }

  async function handleSave() {
    if (!draft || !isDirty) return;
    const invalid = validateDraft(draft);
    if (invalid) {
      setActionError(invalid);
      return;
    }
    setBusy('save');
    setActionError(null);
    try {
      const updated = await psychologistApi.updateResultContent(studentId, assessmentId, patch);
      setDetail(updated);
      setDraft(toDraft(updated));
      setNotice('Изменения сохранены');
    } catch (err) {
      setActionError(errorMessage(err, 'Не удалось сохранить изменения'));
      if (axios.isAxiosError(err) && err.response?.status === 409) void load();
    } finally {
      setBusy(null);
    }
  }

  function requestPublish() {
    if (isDirty || busy !== null) return;
    setPublishConfirmOpen(true);
  }

  async function handlePublishConfirm() {
    setBusy('publish');
    setActionError(null);
    try {
      const published = await psychologistApi.publishResult(studentId, assessmentId);
      setDetail(published);
      setDraft(toDraft(published));
      setNotice('Отчёт опубликован — ученик уже может его открыть в своём кабинете');
      setPublishConfirmOpen(false);
      onPublished?.(published);
    } catch (err) {
      setActionError(errorMessage(err, 'Не удалось опубликовать отчёт'));
      if (axios.isAxiosError(err) && err.response?.status === 409) void load();
      setPublishConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <AdminLoading />;
  }

  if (loadError || !detail || !draft) {
    return <AdminError message={loadError ?? 'Не удалось загрузить отчёт для проверки'} onRetry={() => void load()} />;
  }

  const locked = isPublished || busy !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[14px] bg-[color-mix(in_srgb,var(--paper)_75%,transparent)] border border-default">
        <div className="flex flex-wrap items-center gap-2.5">
          <AdminBadge tone={isPublished ? 'brand' : 'accent'}>
            {isPublished ? 'Опубликовано' : 'На проверке'}
          </AdminBadge>
          <span className={cn(ADMIN_NUM, 'text-muted')}>
            Сформирован {formatDate(detail.created_at)}
          </span>
          {detail.reviewed_at && (
            <span className={cn(ADMIN_NUM, 'text-muted')}>
              · Проверен {formatDate(detail.reviewed_at)}
            </span>
          )}
          {detail.published_at && (
            <span className={cn(ADMIN_NUM, 'text-muted')}>
              · Опубликован {formatDate(detail.published_at)}
            </span>
          )}
        </div>

        <p className={cn(ADMIN_META, 'm-0')}>
          {isPublished
            ? 'Отчёт виден ученику. Изменение опубликованного отчёта заблокировано.'
            : 'Ученик не увидит отчёт, пока вы его не проверите и не нажмёте «Опубликовать».'}
        </p>
      </div>

      <AdminCard title="Сводка" description="Первый блок, который читает ученик в начале отчёта.">
        <ReviewTextField
          value={draft.summary}
          onChange={(value) => update('summary', value)}
          disabled={locked}
          rows={5}
        />
      </AdminCard>

      <AdminCard
        title="Интересы и направления"
        description="Перетащите направление или стрелками поменяйте порядок; неподходящее можно убрать. Баллы остаются как посчитала система."
        aside={
          <div className="flex flex-wrap gap-1.5 justify-end">
            {detail.strengths.map((code) => (
              <AdminBadge key={`s-${code}`} tone="brand" title="Выраженная сфера">
                {code}
              </AdminBadge>
            ))}
            {detail.weaknesses.map((code) => (
              <AdminBadge key={`w-${code}`} tone="quiet" title="Слабо выраженная сфера">
                {code}
              </AdminBadge>
            ))}
          </div>
        }
      >
        <ReviewCareersEditor
          careers={draft.careers}
          onChange={(value) => update('careers', value)}
          disabled={locked}
        />
      </AdminCard>

      <AdminCard title="Сильные стороны" description="Ключевые преимущества и способности подростка.">
        <ReviewCardsEditor
          cards={draft.strength_cards}
          onChange={(value) => update('strength_cards', value)}
          disabled={locked}
          addLabel="Добавить сильную сторону"
          itemName="сильной стороны"
        />
      </AdminCard>

      <AdminCard
        title="Характер"
        description="Это текст, который читает ученик. Он рассчитан по шкалам — правьте только то, что нужно исправить: нетронутые черты продолжат считаться автоматически."
      >
        <ReviewPersonalityNotesEditor
          notes={draft.personality_notes}
          onChange={(value) => update('personality_notes', value)}
          disabled={locked}
        />
      </AdminCard>

      <AdminCard title="Стиль мышления" description="Особенности восприятия информации и принятия решений.">
        <ReviewCardsEditor
          cards={draft.thinking_style_notes}
          onChange={(value) => update('thinking_style_notes', value)}
          disabled={locked}
          addLabel="Добавить заметку"
          itemName="заметки о мышлении"
        />
      </AdminCard>

      <AdminCard title="Что драйвит" description="Источники внутренней мотивации и вовлечённости.">
        <ReviewStringListEditor
          items={draft.motivation_highlights}
          onChange={(value) => update('motivation_highlights', value)}
          disabled={locked}
          addLabel="Добавить пункт"
        />
      </AdminCard>

      <AdminCard title="Итог" description="Завершает отчёт ученика персональными выводами и напутствием.">
        <ReviewTextField
          value={draft.final_analysis}
          onChange={(value) => update('final_analysis', value)}
          disabled={locked}
          rows={5}
        />
      </AdminCard>

      {!isPublished && (
        <div
          className={cn(
            'sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 border border-default bg-surface p-4 shadow-xl backdrop-blur-md',
            ADMIN_RADIUS,
          )}
        >
          <div className="min-w-0" aria-live="polite">
            {actionError ? (
              <p className={cn(ADMIN_TEXT, 'text-danger font-medium m-0')} role="alert">
                {actionError}
              </p>
            ) : notice ? (
              <p className={cn(ADMIN_TEXT, 'text-brand font-medium m-0')}>{notice}</p>
            ) : (
              <p className={cn(ADMIN_META, 'm-0')}>
                {isDirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
              </p>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              className={ADMIN_BUTTON}
              disabled={!isDirty || busy !== null}
              onClick={() => void handleSave()}
            >
              {busy === 'save' ? 'Сохраняем…' : 'Сохранить черновик'}
            </button>
            <button
              type="button"
              className={cn(ADMIN_BUTTON, BRAND_BUTTON, 'shadow-sm font-semibold')}
              disabled={isDirty || busy !== null}
              title={isDirty ? 'Сначала сохраните изменения' : undefined}
              onClick={requestPublish}
            >
              {busy === 'publish' ? 'Публикуем…' : 'Опубликовать ученику'}
            </button>
          </div>
        </div>
      )}

      {isPublished && notice && (
        <div className="p-3 rounded-[10px] bg-brand-subtle text-brand border border-brand/20">
          <p className={cn(ADMIN_TEXT, 'font-medium m-0')}>{notice}</p>
        </div>
      )}

      <ConfirmDialog
        open={publishConfirmOpen}
        title="Опубликовать отчёт?"
        body="Ученик сразу его увидит, а исправить отчёт после публикации будет нельзя."
        confirmLabel="Опубликовать"
        cancelLabel="Отмена"
        confirming={busy === 'publish'}
        onConfirm={() => void handlePublishConfirm()}
        onCancel={() => {
          if (busy !== 'publish') setPublishConfirmOpen(false);
        }}
      />
    </div>
  );
}
