import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useProfile } from './hooks/useProfile';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { ProfileLedger } from './sections/ProfileLedger';
import { MASCOT } from '@/shared/ui/redesign/mascotArt';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { profile } = useProfile();

  return (
    <PageContainer className="rd-profile">
      <StudentPageHeading title={t('redesign.title')} subtitle={t('redesign.subtitle')} />
      {!profile ? (
        <JourneyEmptyState
          illustration={MASCOT.notepad}
          title={t('page.notFilledTitle')}
          body={t('page.notFilledBody')}
        />
      ) : (
        <ProfileLedger />
      )}
    </PageContainer>
  );
}
