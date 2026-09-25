import { useTranslation } from 'react-i18next';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import type { IntelligenceSection as IntelligenceSectionData } from '@/shared/types';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { AsturAttemptMeta } from './intelligence/AsturAttemptMeta';
import { AsturSkillRows } from './intelligence/AsturSkillRows';
import { AsturKnowledgeProfile } from './intelligence/AsturKnowledgeProfile';
import { AsturQuickInstructions } from './intelligence/AsturQuickInstructions';
import { getAsturMethodology } from '../model/psychTestExplanations';

/**
 * АСТУР — «Когнитивные навыки (учебные задания)», PRO-427. Renders the
 * frozen snapshot of the latest completed attempt: percent + `score/max`
 * per skill, the equal-weight overall percent, the subject-knowledge
 * profile with number-series reasoning next to it, and observed quick-
 * instruction accuracy. No IQ, norms, СПН or fatigue verdicts.
 */
export function IntelligenceSection({ section }: { section: IntelligenceSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  return (
    <AdminCard title={t('psychReport:astur.cardTitle')} description={t('psychReport:astur.cardDescription')}>
      <PsychTestHeaderInfo methodology={getAsturMethodology(t)} />
      <AsturAttemptMeta section={section} />
      <AsturSkillRows subtests={section.subtests} overallPercent={section.overall_percent} />
      <AsturKnowledgeProfile profile={section.subject_profile} math={section.math_reasoning} />
      {section.quick_instructions && <AsturQuickInstructions quick={section.quick_instructions} />}
    </AdminCard>
  );
}
