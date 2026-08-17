import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { useProfile } from './hooks/useProfile';
import { useChangeGoal } from '@/shared/hooks/useChangeGoal';
import { getAgeGroupLabel } from './utils/ageGroupLabel';
import { ProfileHero } from './sections/ProfileHero';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SubjectsSection } from './sections/SubjectsSection';
import { RestartAssessmentSection } from './sections/RestartAssessmentSection';
import { ChangeGoalSection } from './sections/ChangeGoalSection';
import { SoundSettingsSection } from './sections/SoundSettingsSection';

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
  const {
    canChangeGoal,
    currentGoal,
    availableGoals,
    pickerOpen,
    isPending: isChangingGoal,
    limitReached: goalLimitReached,
    errorMessage: goalErrorMessage,
    handleOpenPicker,
    handleClosePicker,
    handleSelectGoal,
  } = useChangeGoal();

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      <PageHeader title="Профиль" />

      <ProfileHero
        displayName={displayName}
        initial={initial}
        email={user?.email}
        ageGroupLabel={getAgeGroupLabel(profile?.age_group)}
      />

      <div className="grid gap-5 lg:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {profile ? (
          <>
            <PersonalInfoSection profile={profile} onEdit={() => navigate('/onboarding/profile')} />
            {hasSubjects && <SubjectsSection profile={profile} />}
          </>
        ) : (
          <Card className="flex flex-col items-center py-10 text-center">
            <span className="text-5xl mb-3" aria-hidden="true">📝</span>
            <p className="text-title font-black text-primary mb-1">Профиль не заполнен</p>
            <p className="text-body text-secondary">
              Данные появятся после прохождения настройки профиля
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <SoundSettingsSection
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            prefersReducedMotion={prefersReducedMotion}
          />
          {canChangeGoal && (
            <ChangeGoalSection
              currentGoal={currentGoal}
              availableGoals={availableGoals}
              pickerOpen={pickerOpen}
              isPending={isChangingGoal}
              limitReached={goalLimitReached}
              errorMessage={goalErrorMessage}
              onOpen={handleOpenPicker}
              onClose={handleClosePicker}
              onSelect={handleSelectGoal}
            />
          )}
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
