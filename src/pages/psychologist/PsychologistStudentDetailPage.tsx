import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/lib/assessmentLabels';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { BackLink } from '@/shared/ui/BackLink';
import { Button, buttonClasses } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mono, Text, typeClass } from '@/shared/ui/typography';
import type { PsychologistAssessmentSummary } from '@/shared/types';
import { StatusMark } from './components/StatusMark';
import { REVIEW_TEXTAREA } from './review/components/reviewFieldStyles';
import { dateTimeLabel, gradeShort, shortDateLabel, studentName } from './components/cabinetFormat';
import { useStudentDetail } from './hooks/useCabinetQueries';

const PANEL = 'bg-surface border border-strong rounded-[10px]';

function reportPath(studentId: string, assessment: PsychologistAssessmentSummary) {
  return `/psychologist/students/${studentId}/assessments/${assessment.id}/report`;
}

/** The latest assessment that has a report — the one the card is about. */
function latestReported(assessments: PsychologistAssessmentSummary[]) {
  return [...assessments]
    .filter((a) => a.has_result || a.review_status)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

function ReportPath({ assessment }: { assessment: PsychologistAssessmentSummary | undefined }) {
  const { t } = useTranslation('psychologist');
  const published = assessment?.review_status === 'published';
  const pending = assessment?.review_status === 'pending_review';
  const completedAt = assessment?.completed_at;

  const nodes: SpineNode[] = [
    {
      id: 'test',
      status: completedAt ? 'done' : 'current',
      label: completedAt
        ? t('detail.path.testDone', { date: shortDateLabel(completedAt) })
        : t('detail.path.testInProgress'),
      labelColor: completedAt ? 'var(--pine)' : 'var(--dawn-deep)',
    },
    {
      id: 'review',
      status: published ? 'done' : pending ? 'current' : 'upcoming',
      label: published ? t('detail.path.reviewed') : t('detail.path.review'),
      labelColor: published ? 'var(--pine)' : pending ? 'var(--dawn-deep)' : undefined,
    },
    {
      id: 'student',
      status: published ? 'done' : 'upcoming',
      label: published ? t('detail.path.studentSees') : t('detail.path.studentWillSee'),
      labelColor: published ? 'var(--pine)' : undefined,
    },
  ];

  return (
    <section className={cn(PANEL, 'rounded-b-none px-6 pt-6 pb-5')}>
      <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
        {t('detail.path.title')}
      </Text>
      <Spine nodes={nodes} showLabels className="mt-5" ariaLabel={t('detail.path.title')} />
    </section>
  );
}

export default function PsychologistStudentDetailPage() {
  const { t } = useTranslation(['psychologist', 'admin', 'common', 'profile']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentId = '' } = useParams<{ studentId: string }>();

  const student = useStudentDetail(studentId);
  const notesKey = psychologistKeys.notes(studentId);
  const notes = useQuery({
    queryKey: notesKey,
    queryFn: () => psychologistApi.listNotes(studentId),
    enabled: !!studentId,
  });

  // A 404 on the student means the assignment is gone: old notes stay
  // readable and editable, new ones can't be created.
  const unassigned = axios.isAxiosError(student.error) && student.error.response?.status === 404;
  const canAddNotes = !!student.data;

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  const refreshNotes = () => void queryClient.invalidateQueries({ queryKey: notesKey });
  const createNote = useMutation({
    mutationFn: (content: string) => psychologistApi.createNote(studentId, { content }),
    onSuccess: () => {
      setDraft('');
      refreshNotes();
    },
    onError: (err) =>
      setNoteError(
        axios.isAxiosError(err) && err.response?.status === 404
          ? t('detail.noteCreateBlocked')
          : t('detail.noteSaveError'),
      ),
  });
  const updateNote = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => psychologistApi.updateNote(id, { content }),
    onSuccess: () => {
      setEditingId(null);
      setEditDraft('');
      refreshNotes();
    },
    onError: () => setNoteError(t('detail.noteUpdateError')),
  });
  const deleteNote = useMutation({
    mutationFn: (id: string) => psychologistApi.deleteNote(id),
    onSettled: () => setDeleteNoteId(null),
    onSuccess: refreshNotes,
    onError: () => setNoteError(t('detail.noteDeleteError')),
  });
  const savingNote = createNote.isPending || updateNote.isPending || deleteNote.isPending;

  if (student.isLoading || notes.isLoading) {
    return (
      <PageContainer className="pb-10">
        <AdminLoading />
      </PageContainer>
    );
  }

  if (!student.data && !(unassigned && (notes.data?.length ?? 0) > 0)) {
    return (
      <PageContainer className="pb-10 flex flex-col gap-5">
        <BackLink onClick={() => navigate('/psychologist/students')}>{t('detail.back')}</BackLink>
        <AdminError message={unassigned ? t('detail.notFound') : t('detail.loadError')} />
      </PageContainer>
    );
  }

  const data = student.data;
  const profile = data?.profile ?? null;
  const name = data ? studentName(profile?.name, data.email) : t('detail.studentFallback');
  const assessments = data?.assessments ?? [];
  const current = latestReported(assessments);
  const place = [profile?.city, profile?.country].filter(Boolean).join(', ');

  const facts = [
    {
      label: t('detail.facts.goal'),
      value: current ? t(ASSESSMENT_GOAL_LABELS[current.goal] ?? current.goal) : '—',
    },
    {
      label: t('detail.facts.ageGrade'),
      value: profile
        ? t('detail.ageGradeValue', {
            age: t('common:ageYears', { count: profile.age }),
            grade: t('detail.gradeValue', { grade: profile.grade }),
          })
        : '—',
    },
    { label: t('detail.facts.city'), value: place || '—' },
  ];

  return (
    <PageContainer className="flex flex-col gap-6 pb-16">
      <BackLink onClick={() => navigate('/psychologist/students')}>{t('detail.back')}</BackLink>

      <PageHeader
        level="display-md"
        kicker={profile ? t('detail.kicker', { grade: gradeShort(t, profile.grade) }) : t('detail.kickerNoProfile')}
        title={name}
        subtitle={
          data && (
            <Mono variant="sm" className="text-muted font-normal">
              {data.assigned_at
                ? t('detail.emailAssigned', { email: data.email, date: dateTimeLabel(data.assigned_at) })
                : data.email}
            </Mono>
          )
        }
        wrap
        className="pb-5 border-b border-strong"
        actions={
          current && (
            <Link to={reportPath(studentId, current)} className={buttonClasses({ size: 'md' })}>
              {current.review_status === 'pending_review' ? t('detail.checkReport') : t('detail.openReport')}
            </Link>
          )
        }
      />

      {unassigned && <AdminError message={t('detail.assignmentRemoved')} />}

      {data && (
        <div className="flex flex-col">
          <ReportPath assessment={current} />
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px m-0 bg-[color:var(--hairline)] border border-t-0 border-strong rounded-b-[10px] overflow-hidden">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-surface px-6 py-4">
                <dt className={cn(typeClass.caption, 'text-muted')}>{fact.label}</dt>
                <dd className={cn(typeClass.bodyMd, 'text-heading mt-1.5 m-0')}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {assessments.length > 0 && (
        <section className={PANEL}>
          <header className="px-6 pt-5 pb-3">
            <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
              {t('detail.diagnosticsTitle')}
            </Text>
          </header>
          <ul className="m-0 p-0 list-none">
            {assessments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-default"
              >
                <div className="min-w-0">
                  <Text variant="body-md" className="text-heading m-0">
                    {t(ASSESSMENT_GOAL_LABELS[a.goal] ?? a.goal)}
                  </Text>
                  <Mono variant="sm" className="text-muted">
                    {dateTimeLabel(a.created_at)}
                  </Mono>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {a.review_status === 'pending_review' ? (
                    <StatusMark tone="dawn">{t('detail.pendingReview')}</StatusMark>
                  ) : a.review_status === 'published' ? (
                    <StatusMark tone="pine">{t('detail.published')}</StatusMark>
                  ) : a.status === 'completed' ? (
                    <StatusMark tone="mute" hollow>{t('detail.noReport')}</StatusMark>
                  ) : (
                    <StatusMark tone="mute" hollow>{t('detail.inProgress')}</StatusMark>
                  )}
                  {(a.has_result || a.review_status) && (
                    <Link
                      to={reportPath(studentId, a)}
                      className={buttonClasses({
                        size: 'sm',
                        className: 'min-h-10 [@media(pointer:coarse)]:min-h-11',
                        variant: a.review_status === 'pending_review' ? 'primary' : 'ghost',
                      })}
                    >
                      {a.review_status === 'pending_review' ? t('detail.checkReport') : t('detail.openReport')}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={cn(PANEL, 'px-6 py-5 flex flex-col gap-4')}>
        <header className="flex items-baseline justify-between gap-3">
          <div>
            <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
              {t('detail.notesTitle')}
            </Text>
            <Text variant="body-sm" className="text-muted mt-1 mb-0">
              {canAddNotes ? t('detail.notesHintActive') : t('detail.notesHintReadonly')}
            </Text>
          </div>
          <Mono variant="sm" className="text-muted">
            {notes.data?.length ?? 0}
          </Mono>
        </header>

        {canAddNotes && (
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const content = draft.trim();
              if (!content) return;
              setNoteError(null);
              createNote.mutate(content);
            }}
          >
            <textarea
              value={draft}
              disabled={savingNote}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={t('detail.notePlaceholder')}
              aria-label={t('detail.notePlaceholder')}
              className={REVIEW_TEXTAREA}
            />
            <Button
              type="submit"
              size="sm"
              className="self-end min-h-10 [@media(pointer:coarse)]:min-h-11"
              muteSound
              isLoading={createNote.isPending}
              disabled={savingNote || !draft.trim()}
            >
              {t('detail.addNote')}
            </Button>
          </form>
        )}

        {noteError && (
          <Text variant="body-sm" className="text-danger m-0">
            {noteError}
          </Text>
        )}

        {(notes.data?.length ?? 0) === 0 ? (
          <Text variant="body-sm" className="text-muted m-0">
            {t('detail.notesEmpty')}
          </Text>
        ) : (
          <ul className="m-0 p-0 list-none">
            {notes.data?.map((note) => (
              <li key={note.id} className="py-3.5 border-t border-default">
                {editingId === note.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editDraft}
                      disabled={savingNote}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={3}
                      aria-label={t('detail.editAria')}
                      className={REVIEW_TEXTAREA}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        size="sm"
                        className="min-h-10 [@media(pointer:coarse)]:min-h-11"
                        variant="ghost"
                        muteSound
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft('');
                        }}
                      >
                        {t('detail.cancel')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="min-h-10 [@media(pointer:coarse)]:min-h-11"
                        muteSound
                        isLoading={updateNote.isPending}
                        disabled={savingNote || !editDraft.trim()}
                        onClick={() => updateNote.mutate({ id: note.id, content: editDraft.trim() })}
                      >
                        {t('detail.save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Text variant="body-md" className="text-heading m-0 whitespace-pre-wrap">
                      {note.content}
                    </Text>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Mono variant="sm" className="text-muted">
                        {dateTimeLabel(note.created_at)}
                      </Mono>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="w-10 h-10 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 inline-flex items-center justify-center rounded-[8px] border border-default text-secondary hover:border-brand"
                          aria-label={t('detail.editAria')}
                          onClick={() => {
                            setEditingId(note.id);
                            setEditDraft(note.content);
                          }}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 inline-flex items-center justify-center rounded-[8px] border border-default text-[color:var(--clay)] hover:border-[color:var(--clay)]"
                          aria-label={t('detail.deleteAria')}
                          disabled={savingNote}
                          onClick={() => setDeleteNoteId(note.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={deleteNoteId !== null}
        title={t('detail.deleteConfirm')}
        confirmLabel={t('detail.deleteAria')}
        cancelLabel={t('detail.cancel')}
        confirming={deleteNote.isPending}
        onConfirm={() => deleteNoteId && deleteNote.mutate(deleteNoteId)}
        onCancel={() => {
          if (!deleteNote.isPending) setDeleteNoteId(null);
        }}
      />
    </PageContainer>
  );
}
