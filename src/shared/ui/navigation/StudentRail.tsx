import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/shared/store/profile';
import { StudentNavigation } from '@/shared/ui/redesign/StudentNavigation';
import { useRailSession } from './useRailSession';

/** The student header. Staff rails live in their lazy area shells (AdminArea,
 *  PsychologistArea), so students and guests don't download them. */
export function StudentRail() {
  const { t } = useTranslation('common');
  const { activePath, onLogout } = useRailSession();
  const profile = useProfileStore((s) => s.profile);
  const identity = profile ? `${profile.name} · ${t('ageYears', { count: profile.age })}` : null;
  return <StudentNavigation activePath={activePath} identity={identity} onLogout={onLogout} />;
}
