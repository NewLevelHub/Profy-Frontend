import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useAuth } from '@/shared/hooks/useAuth';
import { AdminEmpty, AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { BackLink } from '@/shared/ui/BackLink';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Mono, Text } from '@/shared/ui/typography';
import type { PsychologistReviewEdit } from '@/shared/types';
import { dateTimeLabel, studentName } from './components/cabinetFormat';
import { useStudentDetail } from './hooks/useCabinetQueries';
import { useReportReview } from './hooks/useReportReview';

interface HistoryRow {
  key: string;
  field: string;
  when: string;
  who: string;
  old: unknown;
  new: unknown;
}

const FIELD_TITLE_KEYS: Record<string, string> = {
  summary: 'psychologist:review.blocks.summary.title',
  careers: 'psychologist:review.blocks.careers.title',
  strength_cards: 'psychologist:review.blocks.strengths.title',
  personality_notes: 'psychologist:review.blocks.traits.title',
  thinking_style_notes: 'psychologist:review.blocks.thinking.title',
  motivation_highlights: 'psychologist:review.blocks.motivation.title',
  final_analysis: 'psychologist:review.blocks.final.title',
};

/** One saved edit → one row per changed block; "Характер" splits further,
 *  per trait, because the stored diff carries all five phrases. */
function toRows(t: TFunction, edits: PsychologistReviewEdit[], currentUserId: string | undefined): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const edit of edits) {
    const when = dateTimeLabel(edit.edited_at);
    const who =
      edit.source === 'ai_recommendation'
        ? t('psychologist:history.aiEditor')
        : edit.editor_id && edit.editor_id === currentUserId
          ? t('psychologist:history.you')
          : (edit.editor_email ?? t('psychologist:history.unknownEditor'));
    for (const [field, change] of Object.entries(edit.changed_fields)) {
      const title = FIELD_TITLE_KEYS[field] ? t(FIELD_TITLE_KEYS[field]) : field;
      if (field === 'personality_notes') {
        const before = (change.old ?? {}) as Record<string, string>;
        const after = (change.new ?? {}) as Record<string, string>;
        for (const trait of Object.keys({ ...before, ...after })) {
          if (before[trait] === after[trait]) continue;
          rows.push({
            key: `${edit.id}-${field}-${trait}`,
            field: `${title} · ${t(`results:personality.${trait}`)}`,
            when,
            who,
            old: before[trait] ?? '',
            new: after[trait] ?? '',
          });
        }
        continue;
      }
      rows.push({ key: `${edit.id}-${field}`, field: title, when, who, old: change.old, new: change.new });
    }
  }
  return rows;
}

/** A stored value as the student would read it: text, or a numbered list
 *  for directions / cards / motivation points. */
function renderValue(value: unknown): ReactNode {
  if (typeof value === 'string') return value || '—';
  if (!Array.isArray(value)) return '—';
  if (value.length === 0) return '—';
  return (
    <ol className="m-0 pl-5 flex flex-col gap-1">
      {value.map((item, index) => {
        if (typeof item === 'string') return <li key={index}>{item}</li>;
        const record = item as Record<string, unknown>;
        if (typeof record.name === 'string') return <li key={index}>{record.name}</li>;
        return (
          <li key={index}>
            <span className="font-semibold">{String(record.title ?? '')}</span>
            {record.description ? ` — ${String(record.description)}` : ''}
          </li>
        );
      })}
    </ol>
  );
}

function ChangeSide({ tone, label, children }: { tone: 'old' | 'new'; label: string; children: ReactNode }) {
  const old = tone === 'old';
  return (
    <div
      className={
        old
          ? 'px-4 py-3 border-l-[3px] border-l-[color:var(--clay)] bg-danger-subtle'
          : 'px-4 py-3 border-l-[3px] border-l-[color:var(--pine)] bg-brand-subtle'
      }
    >
      <Mono
        variant="xs"
        as="div"
        className={`uppercase tracking-label mb-1 ${old ? 'text-[color:var(--clay)]' : 'text-[color:var(--pine)]'}`}
      >
        {label}
      </Mono>
      <Text as="div" variant="body-sm" className={old ? 'text-secondary' : 'text-heading'}>
        {children}
      </Text>
    </div>
  );
}

export default function PsychologistReportHistoryPage() {
  const { t } = useTranslation(['psychologist', 'results']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { studentId = '', assessmentId = '' } = useParams<{ studentId: string; assessmentId: string }>();
  const student = useStudentDetail(studentId);
  const review = useReportReview(studentId, assessmentId);

  const name = student.data ? studentName(student.data.profile?.name, student.data.email) : '';
  const rows = toRows(t, review.edits, user?.id);
  const reportPath = `/psychologist/students/${studentId}/assessments/${assessmentId}/report?tab=review`;

  return (
    <PageContainer className="flex flex-col gap-6 pb-16 max-w-4xl">
      <BackLink onClick={() => navigate(reportPath)}>{t('history.back')}</BackLink>

      <PageHeader
        level="display-md"
        kicker={
          review.detail
            ? t('history.kicker', { name, date: dateTimeLabel(review.detail.created_at) })
            : name || undefined
        }
        title={t('history.title')}
      />

      {review.isLoading || review.editsLoading ? (
        <AdminLoading />
      ) : review.loadError ? (
        <AdminError message={review.loadError} onRetry={review.reload} />
      ) : review.editsError ? (
        <AdminError message={t('history.loadError')} onRetry={review.reloadEdits} />
      ) : rows.length === 0 ? (
        <div className="bg-surface border border-strong rounded-[10px]">
          <AdminEmpty title={t('history.emptyTitle')} hint={t('history.emptyText')} />
        </div>
      ) : (
        <ol className="m-0 p-0 list-none bg-surface border border-strong rounded-[10px] overflow-hidden">
          {rows.map((row) => (
            <li key={row.key} className="px-5 py-5 border-b border-default last:border-b-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
                  {row.field}
                </Text>
                <Mono variant="sm" className="text-muted">
                  {row.when} · {row.who}
                </Mono>
              </div>
              <div className="grid gap-2.5 mt-3 sm:grid-cols-2">
                <ChangeSide tone="old" label={t('history.before')}>
                  {renderValue(row.old)}
                </ChangeSide>
                <ChangeSide tone="new" label={t('history.after')}>
                  {renderValue(row.new)}
                </ChangeSide>
              </div>
            </li>
          ))}
        </ol>
      )}
    </PageContainer>
  );
}
