import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ClipboardCheck, FileText, Pencil, Trash2 } from 'lucide-react';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import { AgeBadge } from '@/shared/ui/admin/AgeBadge';
import { formatDate } from '@/shared/i18n/format';
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

export default function PsychologistStudentDetailPage() {
  const { t } = useTranslation(['psychologist', 'admin', 'common', 'profile']);
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
            setError(t('detail.notFound'));
          }
        } catch {
          setError(t('detail.notFound'));
        }
      } else {
        setError(t('detail.loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, [studentId, t]);

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
        setNoteError(t('detail.noteCreateBlocked'));
      } else {
        setNoteError(t('detail.noteSaveError'));
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
      setNoteError(t('detail.noteUpdateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm(t('detail.deleteConfirm'))) return;
    setSaving(true);
    setNoteError(null);
    try {
      await psychologistApi.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      setNoteError(t('detail.noteDeleteError'));
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
            { label: t('detail.crumbStudents'), to: '/psychologist' },
            { label: t('detail.crumbCard') },
          ]}
          title={t('detail.unavailableTitle')}
        />
        <AdminError message={error} />
      </PageContainer>
    );
  }

  const named = Boolean(student?.profile?.name);
  const title = student?.profile?.name ?? student?.email ?? t('detail.studentFallback');

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminPageHeader
        crumbs={[
          { label: t('detail.crumbStudents'), to: '/psychologist' },
          { label: title },
        ]}
        title={
          <span className={cn(!named && 'font-mono text-mono-md tracking-normal')}>{title}</span>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(ADMIN_NUM, 'text-muted')}>{student?.email ?? studentId}</span>
            {student?.profile && <AgeBadge age={student.profile.age} />}
            {!canAddNotes && (
              <AdminBadge tone="accent">{t('detail.assignmentRemoved')}</AdminBadge>
            )}
          </div>
        }
      />

      {student?.profile && (
        <AdminCard title={t('detail.profileTitle')}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 m-0">
            <div>
              <dt className={ADMIN_META}>{t('detail.ageGrade')}</dt>
              <dd className={cn(ADMIN_TEXT, 'm-0 text-primary')}>
                {t('detail.ageGradeValue', {
                  age: t('common:ageYears', { count: student.profile.age }),
                  grade: t('profile:personal.gradeValue', { count: student.profile.grade }),
                })}
              </dd>
            </div>
            <div>
              <dt className={ADMIN_META}>{t('detail.city')}</dt>
              <dd className={cn(ADMIN_TEXT, 'm-0 text-primary')}>
                {student.profile.city}, {student.profile.country}
              </dd>
            </div>
          </dl>
        </AdminCard>
      )}

      {student && student.assessments.length > 0 && (
        <AdminCard title={t('detail.diagnosticsTitle')} description={t('detail.diagnosticsHint')}>
          <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
            {student.assessments.map((a) => (
              <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
                    {ASSESSMENT_GOAL_LABELS[a.goal] ? t(ASSESSMENT_GOAL_LABELS[a.goal]) : a.goal}
                  </p>
                  <p className={cn(ADMIN_NUM, 'text-muted m-0 mt-0.5')}>
                    {formatDate(a.created_at, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AdminBadge tone={a.status === 'completed' ? 'quiet' : 'accent'}>
                    {ASSESSMENT_STATUS_LABELS[a.status]
                      ? t(ASSESSMENT_STATUS_LABELS[a.status])
                      : a.status}
                  </AdminBadge>
                  {a.review_status === 'pending_review' && (
                    <AdminBadge tone="accent">{t('psychologist:detail.pendingReview', 'На проверке')}</AdminBadge>
                  )}
                  {a.review_status === 'published' && (
                    <AdminBadge tone="brand">{t('psychologist:detail.published', 'Опубликовано')}</AdminBadge>
                  )}
                  {a.has_result && !a.review_status && <AdminBadge tone="quiet">{t('detail.hasResult')}</AdminBadge>}
                  {/* Single unified report button */}
                  {(a.has_result || a.review_status) && (
                    <Link
                      to={
                        a.review_status === 'pending_review'
                          ? `/psychologist/students/${studentId}/assessments/${a.id}/report?tab=review`
                          : `/psychologist/students/${studentId}/assessments/${a.id}/report`
                      }
                      className={cn(
                        ADMIN_BUTTON,
                        a.review_status === 'pending_review'
                          ? 'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand shadow-sm font-semibold'
                          : 'hover:border-strong hover:text-primary',
                      )}
                    >
                      {a.review_status === 'pending_review' ? (
                        <>
                          <ClipboardCheck size={14} />
                          {t('psychologist:detail.checkReport', 'Проверить отчёт')}
                        </>
                      ) : (
                        <>
                          <FileText size={14} />
                          {t('psychologist:detail.openReport', 'Открыть отчёт')}
                        </>
                      )}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <AdminCard
        title={t('detail.notesTitle')}
        description={canAddNotes ? t('detail.notesHintActive') : t('detail.notesHintReadonly')}
        aside={<span className={cn(ADMIN_NUM, 'text-muted')}>{notes.length}</span>}
      >
        {canAddNotes && (
          <form onSubmit={handleCreateNote} className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={t('detail.notePlaceholder')}
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
                {t('detail.addNote')}
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
          <p className={cn(ADMIN_META, 'm-0')}>{t('detail.notesEmpty')}</p>
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
                        {t('detail.cancel')}
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
                        {t('detail.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={cn(ADMIN_TEXT, 'text-primary m-0 whitespace-pre-wrap')}>
                      {note.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={cn(ADMIN_NUM, 'text-muted')}>
                        {formatDate(note.created_at, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={cn(ADMIN_BUTTON, 'px-2')}
                          aria-label={t('detail.editAria')}
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
                          aria-label={t('detail.deleteAria')}
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
