import { Navigate, useParams } from 'react-router';

/**
 * Legacy route redirect.
 * Both the diagnostic report and the student report review/editor
 * have been unified into /psychologist/students/:studentId/assessments/:assessmentId/report.
 */
export default function PsychologistResultReviewPage() {
  const { studentId = '', assessmentId = '' } = useParams<{ studentId: string; assessmentId: string }>();
  return (
    <Navigate
      to={`/psychologist/students/${studentId}/assessments/${assessmentId}/report?tab=review`}
      replace
    />
  );
}
