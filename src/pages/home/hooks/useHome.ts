import { useNavigate } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const answeredCount = useAssessmentStore(s => s.answeredCount);
  const totalQuestions = useAssessmentStore(s => s.totalQuestions);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);

  const hasAssessment = assessmentId !== null && goal !== null;
  const isCompleted = hasAssessment && hasCompletedAssessment;
  const inProgress = hasAssessment && !isCompleted;

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';
  const initial = displayName[0]?.toUpperCase() ?? 'A';

  function handleContinue() {
    if (isCompleted) {
      navigate('/assessment/loading');
    } else if (inProgress) {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  return {
    displayName,
    initial,
    hasAssessment,
    isCompleted,
    inProgress,
    answeredCount,
    totalQuestions,
    handleContinue,
  };
}
