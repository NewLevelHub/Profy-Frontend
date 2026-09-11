import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { psychologistApi } from '@/shared/api/psychologist';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Skeleton } from '@/shared/ui/Skeleton';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { ResultsReportBody } from '@/pages/results/components/ResultsReportBody';
import type {
  AgeGroup,
  AssessmentGoal,
  PsychologistStudentDetail,
  ResultResponse,
} from '@/shared/types';

/**
 * Read-only view of a student's full /result report for the psychologist —
 * RIASEC / Big Five + the «Психоэмоциональный тест» and «Достоверность
 * протокола» sections (attached server-side because the viewer is a
 * psychologist). Reuses ResultsReportBody so the body is identical to what
 * the student sees, plus the psych block; `readOnly` there turns the
 * "Направления под цель" list into plain rows — no navigation into the
 * student's own direction/university browsing flow.
 */
export default function PsychologistStudentReportPage() {
  const { studentId = '', assessmentId = '' } = useParams<{
    studentId: string;
    assessmentId: string;
  }>();

  const [report, setReport] = useState<ResultResponse | null>(null);
  const [student, setStudent] = useState<PsychologistStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId || !assessmentId) return;
    setLoading(true);
    setError(null);
    try {
      const [rep, detail] = await Promise.all([
        psychologistApi.getStudentReport(studentId, assessmentId),
        psychologistApi.getStudent(studentId),
      ]);
      setReport(rep);
      setStudent(detail);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Отчёт не найден — возможно, ученик ещё не завершил диагностику');
      } else {
        setError('Не удалось загрузить отчёт ученика');
      }
    } finally {
      setLoading(false);
    }
  }, [studentId, assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = student?.profile?.name ?? student?.email ?? 'Ученик';
  const ageGroup = student?.profile?.age_group as AgeGroup | undefined;
  const goal: AssessmentGoal | undefined = student?.assessments.find(
    (a) => a.id === assessmentId,
  )?.goal;
  const isJunior = ageGroup === 'junior';

  return (
    <PageContainer className="flex flex-col gap-6 pb-10">
      <AdminPageHeader
        crumbs={[
          { label: 'Ученики', to: '/psychologist' },
          { label: title, to: `/psychologist/students/${studentId}` },
          { label: 'Отчёт' },
        ]}
        title={`Отчёт — ${title}`}
      />

      {loading ? (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </>
      ) : error || !report ? (
        <AdminError message={error ?? 'Отчёт недоступен'} onRetry={() => void load()} />
      ) : (
        <ResultsReportBody
          report={report}
          ageGroup={ageGroup}
          goal={goal}
          isJunior={isJunior}
          readOnly
        />
      )}
    </PageContainer>
  );
}
