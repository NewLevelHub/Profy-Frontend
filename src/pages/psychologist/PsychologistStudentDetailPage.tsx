import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import {
  ADMIN_BUTTON,
  ADMIN_META,
  ADMIN_NUM,
  ADMIN_TEXT,
  ADMIN_TEXTAREA,
} from '@/shared/ui/admin/density';
import { PageContainer } from '@/shared/ui/PageContainer';
import type {
  AgeGroup,
  PsychologistNote,
  PsychologistStudentDetail,
} from '@/shared/types';

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PsychologistStudentDetailPage() {
  const { studentId = '' } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<PsychologistStudentDetail | null>(null);
  const [notes, setNotes] = useState<PsychologistNote[]>([]);
  const [canAddNotes, setCanAddNotes] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, noteRows] = await Promise.all([
        psychologistApi.getStudent(studentId),
        psychologistApi.listNotes(studentId),
      ]);
      setStudent(detail);
      setNotes(noteRows);
      setCanAddNotes(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStudent(null);
        setCanAddNotes(false);
        try {
          const noteRows = await psychologistApi.listNotes(studentId);
          setNotes(noteRows);
          if (noteRows.length === 0) {
            setError('Ученик не найден или больше не назначен вам');
          }
        } catch {
          setError('Ученик не найден или больше не назначен вам');
        }
      } else {
        setError('Не удалось загрузить карточку ученика');
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !studentId) return;
    setSaving(true);
    setNoteError(null);
    try {
      const note = await psychologistApi.createNote(studentId, { content });
      setNotes((prev) => [note, ...prev]);
      setDraft('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setCanAddNotes(false);
        setNoteError('Ученик больше не назначен — новые заметки создать нельзя');
      } else {
        setNoteError('Не удалось сохранить заметку');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(noteId: string) {
    const content = editDraft.trim();
    if (!content) return;
    setSaving(true);
    setNoteError(null);
    try {
      const updated = await psychologistApi.updateNote(noteId, { content });
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      setEditingId(null);
      setEditDraft('');
    } catch {
      setNoteError('Не удалось обновить заметку');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm('Удалить эту заметку?')) return;
    setSaving(true);
    setNoteError(null);
    try {
      await psychologistApi.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      setNoteError('Не удалось удалить заметку');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer className="pb-10">
        <AdminLoading />
      </PageContainer>
    );
  }

  if (error && !student && notes.length === 0) {
    return (
      <PageContainer className="pb-10 flex flex-col gap-4">
        <AdminPageHeader
          crumbs={[
            { label: 'Ученики', to: '/psychologist' },
            { label: 'Карточка' },
          ]}
          title="Ученик недоступен"
        />
        <AdminError message={error} />
      </PageContainer>
    );
  }

  const named = Boolean(student?.profile?.name);
  const title = student?.profile?.name ?? student?.email ?? 'Ученик';
  const ageGroup = student?.profile?.age_group as AgeGroup | undefined;

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminPageHeader
        crumbs={[
          { label: 'Ученики', to: '/psychologist' },
          { label: title },
        ]}
        title={
          <span className={cn(!named && 'font-mono text-mono-md tracking-normal')}>{title}</span>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(ADMIN_NUM, 'text-muted')}>{student?.email ?? studentId}</span>
            {ageGroup && (
              <AdminBadge tone="quiet">{AGE_TIER_LABELS[ageGroup] ?? ageGroup}</AdminBadge>
            )}
            {!canAddNotes && (
              <AdminBadge tone="accent">Назначение снято</AdminBadge>
            )}
          </div>
        }
      />

      {student?.profile && (
        <AdminCard title="Профиль">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 m-0">
            <div>
              <dt className={ADMIN_META}>Возраст / класс</dt>
              <dd className={cn(ADMIN_TEXT, 'm-0 text-primary')}>
                {student.profile.age} лет · {student.profile.grade} класс
              </dd>
            </div>
            <div>
              <dt className={ADMIN_META}>Город</dt>
              <dd className={cn(ADMIN_TEXT, 'm-0 text-primary')}>
                {student.profile.city}, {student.profile.country}
              </dd>
            </div>
          </dl>
        </AdminCard>
      )}

      {student && student.assessments.length > 0 && (
        <AdminCard
          title="Диагностики"
          description="Краткое саммари — полный отчёт психологу в этом релизе не отдаётся."
        >
          <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
            {student.assessments.map((a) => (
              <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
                    {ASSESSMENT_GOAL_LABELS[a.goal] ?? a.goal}
                  </p>
                  <p className={cn(ADMIN_NUM, 'text-muted m-0 mt-0.5')}>{formatDate(a.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AdminBadge tone={a.status === 'completed' ? 'quiet' : 'accent'}>
                    {ASSESSMENT_STATUS_LABELS[a.status] ?? a.status}
                  </AdminBadge>
                  {a.has_result && <AdminBadge tone="quiet">Результат</AdminBadge>}
                  {a.has_roadmap && <AdminBadge tone="quiet">План</AdminBadge>}
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <AdminCard
        title="Заметки"
        description={
          canAddNotes
            ? 'Видны только вам. После снятия назначения новые заметки создать нельзя, старые останутся.'
            : 'Назначение снято — можно править и удалять старые заметки, но не создавать новые.'
        }
        aside={<span className={cn(ADMIN_NUM, 'text-muted')}>{notes.length}</span>}
      >
        {canAddNotes && (
          <form onSubmit={handleCreateNote} className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Новая заметка…"
              className={ADMIN_TEXTAREA}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                className={cn(
                  ADMIN_BUTTON,
                  'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand',
                )}
              >
                Добавить
              </button>
            </div>
          </form>
        )}

        {noteError && (
          <p className={cn(ADMIN_TEXT, 'text-danger m-0')} role="alert">
            {noteError}
          </p>
        )}

        {notes.length === 0 ? (
          <p className={cn(ADMIN_META, 'm-0')}>Заметок пока нет</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
            {notes.map((note) => (
              <li key={note.id} className="py-3.5">
                {editingId === note.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={3}
                      className={ADMIN_TEXTAREA}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className={ADMIN_BUTTON}
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft('');
                        }}
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        disabled={saving || !editDraft.trim()}
                        className={cn(
                          ADMIN_BUTTON,
                          'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand',
                        )}
                        onClick={() => void handleSaveEdit(note.id)}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={cn(ADMIN_TEXT, 'text-primary m-0 whitespace-pre-wrap')}>
                      {note.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(note.created_at)}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={cn(ADMIN_BUTTON, 'px-2')}
                          aria-label="Редактировать"
                          onClick={() => {
                            setEditingId(note.id);
                            setEditDraft(note.content);
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
                          aria-label="Удалить"
                          disabled={saving}
                          onClick={() => void handleDelete(note.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </PageContainer>
  );
}
