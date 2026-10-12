import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useProfile } from './hooks/useProfile';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { ProfileLedger } from './sections/ProfileLedger';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { profile } = useProfile();

  return (
    <PageContainer className="rd-profile">
      <StudentPageHeading title={t('redesign.title')} subtitle={t('redesign.subtitle')} />
      {!profile ? (
        <JourneyEmptyState
          illustration="/mascot/redesign/notepad.png"
          mascotState="waiting"
          title={t('page.notFilledTitle')}
          body={t('page.notFilledBody')}
        />
      ) : (
        <ProfileLedger />
      )}
    </PageContainer>
  );
}
