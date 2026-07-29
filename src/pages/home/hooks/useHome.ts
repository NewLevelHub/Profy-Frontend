import { useNavigate } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useKnownProfessionTree } from '@/pages/assessment/knownProfession/hooks/useKnownProfessionTree';

export type HomeStatus = 'not_started' | 'in_progress' | 'completed';

const SPHERES_PREVIEW_COUNT = 5;

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

  const { data: sphereTree, isLoading: spheresLoading } = useKnownProfessionTree();
  const spheresPreview = sphereTree?.slice(0, SPHERES_PREVIEW_COUNT) ?? [];
  const spheresTotal = sphereTree?.length ?? 0;

  function handleContinue() {
    if (status === 'completed') {
      navigate('/results');
    } else if (status === 'in_progress') {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  function goToSpheres() {
    navigate('/assessment/known-profession');
  }

  function goToSphere(slug: string) {
    navigate(`/assessment/known-profession/${slug}`);
  }

  return {
    displayName,
    status,
    spheresPreview,
    spheresTotal,
    spheresLoading,
    handleContinue,
    goToSpheres,
    goToSphere,
  };
}
