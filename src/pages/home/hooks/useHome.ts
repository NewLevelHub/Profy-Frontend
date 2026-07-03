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
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);

  const ageGroup = profile?.age_group ?? 'middle';
  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;
  const hasAssessment = assessmentId !== null && goal !== null;
  // `currentBlock` mirrors the backend's required-block counter, which excludes
  // the optional `wellbeing` block — it never reaches `totalBlocks` on its own.
  // Completion is driven by `hasCompletedAssessment` instead, so the roadmap
  // still shows every node (including wellbeing) as done once the required
  // blocks are finished, letting the user open wellbeing later without it
  // ever blocking "completed" state.
  const isCompleted = hasAssessment && hasCompletedAssessment;
  const inProgress = hasAssessment && !isCompleted;

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';
  const initial = displayName[0]?.toUpperCase() ?? 'A';

  const completedCount = isCompleted ? totalBlocks : Math.min(currentBlock, totalBlocks);
  const roadmapCurrentBlock = isCompleted ? totalBlocks : currentBlock;
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
    roadmapCurrentBlock,
    completedCount,
    nextBlockName,
    handleContinue,
    handleRetakeBlock,
  };
}
