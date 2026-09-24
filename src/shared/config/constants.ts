// Enum codes, icon/emoji maps and ordering arrays live here as plain data.
// Every `*_LABELS` / `*_DESCRIPTIONS` / `*_HINTS` map now holds **i18n key
// strings**, not display text — resolve at the call site with
// `t(MAP[code])` (see docs/i18n.md). Icons/emojis are not text and stay literal.

export const ASSESSMENT_GOALS = {
  EXPLORE: 'explore',
  PROFESSION: 'profession',
  UNIVERSITY: 'university',
} as const;

export type AssessmentGoal = (typeof ASSESSMENT_GOALS)[keyof typeof ASSESSMENT_GOALS];

export const ASSESSMENT_GOAL_LABELS: Record<AssessmentGoal, string> = {
  [ASSESSMENT_GOALS.EXPLORE]: 'assessment:goal.explore',
  [ASSESSMENT_GOALS.PROFESSION]: 'assessment:goal.profession',
  [ASSESSMENT_GOALS.UNIVERSITY]: 'assessment:goal.university',
};

export const RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

export const RIASEC_LABELS: Record<string, string> = {
  R: 'results:riasecLabel.R',
  I: 'results:riasecLabel.I',
  A: 'results:riasecLabel.A',
  S: 'results:riasecLabel.S',
  E: 'results:riasecLabel.E',
  C: 'results:riasecLabel.C',
};

export const RIASEC_ICONS: Record<string, string> = {
  R: '🔧',
  I: '🔬',
  A: '🎨',
  S: '🤝',
  E: '🚀',
  C: '📋',
};

// Plain-language, one-sentence gloss for each RIASEC letter — the label
// alone ("Реалистичный", "Конвенциональный") is Holland-code jargon that
// doesn't explain itself to a student, so the type grid pairs it with this.
export const RIASEC_DESCRIPTIONS: Record<string, string> = {
  R: 'results:riasecDesc.R',
  I: 'results:riasecDesc.I',
  A: 'results:riasecDesc.A',
  S: 'results:riasecDesc.S',
  E: 'results:riasecDesc.E',
  C: 'results:riasecDesc.C',
};

// Junior's (6-9) interest instrument, replacing RIASEC — see MIType.
export const MI_TYPES = [
  'verbal', 'logical', 'musical', 'visual', 'bodily',
  'interpersonal', 'intrapersonal', 'naturalistic',
] as const;

export const MI_LABELS: Record<string, string> = {
  verbal: 'results:miLabel.verbal',
  logical: 'results:miLabel.logical',
  musical: 'results:miLabel.musical',
  visual: 'results:miLabel.visual',
  bodily: 'results:miLabel.bodily',
  interpersonal: 'results:miLabel.interpersonal',
  intrapersonal: 'results:miLabel.intrapersonal',
  naturalistic: 'results:miLabel.naturalistic',
};

export const MI_ICONS: Record<string, string> = {
  verbal: '📚',
  logical: '🧩',
  musical: '🎵',
  visual: '🎨',
  bodily: '🤸',
  interpersonal: '🤝',
  intrapersonal: '💭',
  naturalistic: '🌿',
};

// One-sentence gloss per MI type — connects the label to what it looks like.
export const MI_DESCRIPTIONS: Record<string, string> = {
  verbal: 'results:miDesc.verbal',
  logical: 'results:miDesc.logical',
  musical: 'results:miDesc.musical',
  visual: 'results:miDesc.visual',
  bodily: 'results:miDesc.bodily',
  interpersonal: 'results:miDesc.interpersonal',
  intrapersonal: 'results:miDesc.intrapersonal',
  naturalistic: 'results:miDesc.naturalistic',
};

export const LIKERT_SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'assessment:likert.1' },
  { value: 2, label: 'assessment:likert.2' },
  { value: 3, label: 'assessment:likert.3' },
  { value: 4, label: 'assessment:likert.4' },
  { value: 5, label: 'assessment:likert.5' },
];

export const BIGFIVE_LIKERT_SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'assessment:bigfiveLikert.1' },
  { value: 2, label: 'assessment:bigfiveLikert.2' },
  { value: 3, label: 'assessment:bigfiveLikert.3' },
  { value: 4, label: 'assessment:bigfiveLikert.4' },
  { value: 5, label: 'assessment:bigfiveLikert.5' },
];

// PRO-338 Ф0.5 — Eysenck (57п.) and Elers (41п.) are Да/Нет instruments,
// reusing the Likert engine with a 2-point scale instead of 5. Backend
// write semantics (app/models/user_response.py, question_service): plain
// answer_value 1=Нет, 2=Да — not the 5-point 1..5 semantics reused at a
// different range, an explicit 2-value scale of its own.
export const YES_NO_SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'assessment:yesNo.no' },
  { value: 2, label: 'assessment:yesNo.yes' },
];

// PRO-338 Ф1.2 — ДДО "способности" (professional_types_abilities) is a
// genuine 0-3 scale in the source spec ("совсем не выражено".."ярко
// выражено"), not a shifted 1-5 — backend stores the literal 0-3
// answer_value (app/schemas/response.py widened its floor to 0 for this),
// so professional_types_service reads raw scores directly with no +1/-1
// conversion anywhere.
export const ABILITIES_LIKERT_SCALE: { value: number; label: string }[] = [
  { value: 0, label: 'assessment:abilitiesLikert.0' },
  { value: 1, label: 'assessment:abilitiesLikert.1' },
  { value: 2, label: 'assessment:abilitiesLikert.2' },
  { value: 3, label: 'assessment:abilitiesLikert.3' },
];

// PRO-338 Ф1.10 — Kondash/Prikhozhan «тревожность» (kondash_anxiety, 40п.)
// is a genuine 0-4 scale (Нет/Немного/Достаточно/Значительно/Очень, source:
// docs/psych/new-tests-content-sources.md "Пробел 3"), stored as the literal
// 0-4 answer_value — same widened-floor convention as ABILITIES_LIKERT_SCALE
// above, no +1/-1 conversion in kondash_anxiety scoring (Ф1.11).
export const KONDASH_ANXIETY_SCALE: { value: number; label: string }[] = [
  { value: 0, label: 'assessment:kondashAnxietyLikert.0' },
  { value: 1, label: 'assessment:kondashAnxietyLikert.1' },
  { value: 2, label: 'assessment:kondashAnxietyLikert.2' },
  { value: 3, label: 'assessment:kondashAnxietyLikert.3' },
  { value: 4, label: 'assessment:kondashAnxietyLikert.4' },
];

export const THINKING_STYLE_LABELS: Record<string, string> = {
  creative_think: 'results:thinkingStyle.creative_think',
  systematic: 'results:thinkingStyle.systematic',
  strategic: 'results:thinkingStyle.strategic',
  practical: 'results:thinkingStyle.practical',
};

export const THINKING_STYLE_ICONS: Record<string, string> = {
  creative_think: '💡',
  systematic: '🗂️',
  strategic: '🧭',
  practical: '🔨',
};

export const PERSONALITY_LABELS: Record<string, string> = {
  openness: 'results:personality.openness',
  conscientiousness: 'results:personality.conscientiousness',
  extraversion: 'results:personality.extraversion',
  agreeableness: 'results:personality.agreeableness',
  emotional_stability: 'results:personality.emotional_stability',
};

export const PERSONALITY_ICONS: Record<string, string> = {
  openness: '🌱',
  conscientiousness: '🗂️',
  extraversion: '🎉',
  agreeableness: '🤝',
  emotional_stability: '🧘',
};

export const PERSONALITY_ORDER: string[] = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability',
];

// interest_map[].level (result-v2 contract §5) — opaque enum, never a
// percentage: the backend deliberately doesn't expose the score it was
// computed from, so this is display-only.
export const INTEREST_LEVEL_LABELS: Record<'low' | 'medium' | 'high', string> = {
  low: 'results:interestLevel.low',
  medium: 'results:interestLevel.medium',
  high: 'results:interestLevel.high',
};

// careers[].tier (result-v2 contract §6) — three-tier match instead of a
// score, per TZ §18.3 (no percentages shown to the student).
export const CAREER_TIER_LABELS: Record<'strong' | 'good' | 'worth_trying', string> = {
  strong: 'results:careerTier.strong',
  good: 'results:careerTier.good',
  worth_trying: 'results:careerTier.worth_trying',
};

export const AGE_GROUPS = {
  JUNIOR: 'junior',
  MIDDLE: 'middle',
  SENIOR: 'senior',
} as const;

export type AgeGroup = (typeof AGE_GROUPS)[keyof typeof AGE_GROUPS];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  [AGE_GROUPS.JUNIOR]: 'common:ageGroup.junior',
  [AGE_GROUPS.MIDDLE]: 'common:ageGroup.middle',
  [AGE_GROUPS.SENIOR]: 'common:ageGroup.senior',
};

export const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  hobby: 'onboarding:artifactType.hobby',
  club: 'onboarding:artifactType.club',
  sport: 'onboarding:artifactType.sport',
  achievement: 'onboarding:artifactType.achievement',
  goal: 'onboarding:artifactType.goal',
  book: 'onboarding:artifactType.book',
  game: 'onboarding:artifactType.game',
  topic: 'onboarding:artifactType.topic',
  profession: 'onboarding:artifactType.profession',
  university: 'onboarding:artifactType.university',
  dream: 'onboarding:artifactType.dream',
};
