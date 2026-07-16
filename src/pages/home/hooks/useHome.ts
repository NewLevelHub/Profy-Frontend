import { useNavigate } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';

export type HomeStatus = 'not_started' | 'in_progress' | 'completed';

export function useHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);

  const hasAssessment = assessmentId !== null && goal !== null;
  const status: HomeStatus = !hasAssessment
    ? 'not_started'
    : hasCompletedAssessment
    ? 'completed'
    : 'in_progress';

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';
  const initial = displayName[0]?.toUpperCase() ?? 'A';

  function handleContinue() {
    if (status === 'completed') {
      navigate('/results');
    } else if (status === 'in_progress') {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  return {
    displayName,
    initial,
    status,
    handleContinue,
  };
}
