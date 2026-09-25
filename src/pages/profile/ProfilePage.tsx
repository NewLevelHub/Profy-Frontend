import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useProfile } from './hooks/useProfile';
import { ProfileLedger } from './sections/ProfileLedger';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { profile } = useProfile();

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      {!profile ? (
        <JourneyEmptyState
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
