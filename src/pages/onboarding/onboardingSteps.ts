// Profile setup (2 steps) and artifacts (2 steps) are two separate pages/
// hooks, but one continuous onboarding sequence from the student's point of
// view — this shared count is what lets both pages render the same "Шаг X
// из Y" progress bar without either hardcoding the other's step count.
//
// Each step below merges what used to be its own separate screen — same
// fields and validation, just grouped onto fewer screens:
//   Step 1 = имя+возраст merged with класс+город+страна (was steps 1+2)
//   Step 2 = предметы нравятся/не нравятся merged with легко/стараться (was steps 3+4)
//   Step 3 = все артефакты кроме мечт: увлечения, достижения, профессии, цели (was steps 5-8)
//   Step 4 = мечты и цели, alone (was step 9)
export const PROFILE_STEP_COUNT = 2;
export const ARTIFACT_STEP_COUNT = 2;
export const TOTAL_ONBOARDING_STEPS = PROFILE_STEP_COUNT + ARTIFACT_STEP_COUNT;
