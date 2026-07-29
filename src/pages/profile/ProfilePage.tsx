import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { useProfile } from './hooks/useProfile';
import { getAgeGroupLabel } from './utils/ageGroupLabel';
import { PROFILE_CARD_CLASS } from './utils/profileStyles';
import { ProfileHero } from './sections/ProfileHero';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SubjectsSection } from './sections/SubjectsSection';
import { RestartAssessmentSection } from './sections/RestartAssessmentSection';
import { SoundSettingsSection } from './sections/SoundSettingsSection';
import { cn } from '@/shared/lib/cn';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    displayName,
    initial,
    hasSubjects,
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  } = useProfile();
  const { soundEnabled, toggleSound, prefersReducedMotion } = useSoundEnabled();

  return (
    <PageContainer className="space-y-4 lg:space-y-8">
      <PageHeader title="Профиль" titleClassName="text-[26px] lg:text-[30px]" />

      <ProfileHero
        displayName={displayName}
        initial={initial}
        email={user?.email}
        ageGroupLabel={getAgeGroupLabel(profile?.age_group)}
      />

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-4">
          {profile ? (
            <>
              <PersonalInfoSection profile={profile} onEdit={() => navigate('/onboarding/profile')} />
              {hasSubjects && <SubjectsSection profile={profile} />}
            </>
          ) : (
            <Card className={cn(PROFILE_CARD_CLASS, 'flex flex-col items-center py-10 text-center')}>
              <span className="text-5xl mb-3" aria-hidden="true">📝</span>
              <p className="text-title font-black text-primary mb-1">Профиль не заполнен</p>
              <p className="text-body text-secondary">
                Данные появятся после прохождения настройки профиля
              </p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <SoundSettingsSection
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            prefersReducedMotion={prefersReducedMotion}
          />
          <RestartAssessmentSection
            confirmRestart={confirmRestart}
            onRequest={handleRestartRequest}
            onConfirm={handleRestartConfirm}
            onCancel={handleRestartCancel}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-[50px] flex items-center justify-center gap-2 text-muted font-extrabold transition-colors hover:text-danger text-label"
          >
            <LogOut size={14} />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
