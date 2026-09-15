import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useProfile } from './hooks/useProfile';
import { ProfileHero } from './sections/ProfileHero';
import { ProfileLedger } from './sections/ProfileLedger';
import { SelfDescriptionSection } from './sections/junior/SelfDescriptionSection';
import { StrengthsSection } from './sections/junior/StrengthsSection';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { profile, displayName, isJunior, strengthCards } = useProfile();

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      {!profile ? (
        <JourneyEmptyState
          mascotState="waiting"
          title={t('page.notFilledTitle')}
          body={t('page.notFilledBody')}
        />
      ) : isJunior ? (
        <>
          <ProfileHero isJunior displayName={displayName} age={profile.age} grade={profile.grade} />
          <SelfDescriptionSection />
          <StrengthsSection cards={strengthCards} />
          <p className="text-secondary text-center" style={{ fontSize: 15 }}>
            {t('page.juniorFooter')}
          </p>
        </>
      ) : (
        <ProfileLedger />
      )}
    </PageContainer>
  );
}
