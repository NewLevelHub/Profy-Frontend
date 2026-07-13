import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { useProfile } from './hooks/useProfile';
import { getAgeGroupLabel } from './utils/ageGroupLabel';
import { ProfileHero } from './sections/ProfileHero';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SubjectsSection } from './sections/SubjectsSection';
import { RestartAssessmentSection } from './sections/RestartAssessmentSection';
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

  return (
    <div className="max-w-[1260px] mx-auto space-y-6 lg:space-y-8">
      <h1 className="font-black text-primary text-center tracking-[-0.01em] text-display">Профиль</h1>

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
    </div>
  );
}
