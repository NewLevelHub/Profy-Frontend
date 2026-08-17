// Profile setup (4 steps) and artifacts (5 groups) are two separate pages/
// hooks, but one continuous onboarding sequence from the student's point of
// view — this shared count is what lets both pages render the same "Шаг X
// из Y" progress bar without either hardcoding the other's step count.
export const PROFILE_STEP_COUNT = 4;
export const ARTIFACT_STEP_COUNT = 5;
export const TOTAL_ONBOARDING_STEPS = PROFILE_STEP_COUNT + ARTIFACT_STEP_COUNT;
