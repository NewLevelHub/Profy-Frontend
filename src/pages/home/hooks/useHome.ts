import { useNavigate } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { BLOCK_NAMES } from '@/shared/config/constants';
import { getAssessmentBlocks } from '@/pages/assessment/utils/assessmentBlocks';

export function useHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const currentBlock = useAssessmentStore(s => s.currentBlock);

  const ageGroup = profile?.age_group ?? 'middle';
  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;
  const hasAssessment = assessmentId !== null && goal !== null;
  const isCompleted = hasAssessment && currentBlock >= totalBlocks;
  const inProgress = hasAssessment && !isCompleted;

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';
  const initial = displayName[0]?.toUpperCase() ?? 'A';

  const completedCount = Math.min(currentBlock, totalBlocks);
  const nextBlockName =
    inProgress && currentBlock < activeBlocks.length
      ? BLOCK_NAMES[activeBlocks[currentBlock]]
      : null;

  function handleContinue() {
    if (isCompleted) {
      navigate('/assessment/loading');
    } else if (inProgress) {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  function handleRetakeBlock(blockIndex: number) {
    navigate(`/assessment?retake=${blockIndex}`);
  }

  return {
    displayName,
    initial,
    activeBlocks,
    totalBlocks,
    hasAssessment,
    isCompleted,
    inProgress,
    currentBlock,
    completedCount,
    nextBlockName,
    handleContinue,
    handleRetakeBlock,
  };
}
