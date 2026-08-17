import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { useProfile } from './hooks/useProfile';
import { ProfileHero } from './sections/ProfileHero';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SubjectsSection } from './sections/SubjectsSection';
import { ArtifactsSection } from './sections/ArtifactsSection';
import { RestartAssessmentSection } from './sections/RestartAssessmentSection';
import { SoundSettingsSection } from './sections/SoundSettingsSection';
import { SelfDescriptionSection } from './sections/junior/SelfDescriptionSection';
import { StrengthsSection } from './sections/junior/StrengthsSection';
import { ParentAccessSection } from './sections/senior/ParentAccessSection';
import { AttemptHistorySection } from './sections/senior/AttemptHistorySection';
import { AccountAccessSection } from './sections/senior/AccountAccessSection';

// Same layout scale/radii/grid for every age — the difference is in block
// composition and access, not the visual system (design spec §12). Junior
// (under-12, "Мои штуки") gets a lighter, content-only page: what they told
// us about themselves + their strengths. Everything settings/account-shaped
// (password, email, parent access, attempt history) is explicitly withheld —
// there is no `/parent` surface anywhere in this app yet (see
// ParentAccessSection's header comment), so the footer just tells the child
// where that lives conceptually rather than linking to a page that doesn't
// exist. Restart/sound/logout stay available to every age — those are real
// device-level affordances a child still needs, not "settings" in the
// parent-only sense the spec withholds.
export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    displayName,
    isJunior,
    hasSubjects,
    artifacts,
    strengthCards,
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  } = useProfile();
  const { soundEnabled, toggleSound, prefersReducedMotion } = useSoundEnabled();

  return (
    <PageContainer size="narrow" className="space-y-6 lg:space-y-8">
      <PageHeader title="Профиль" />

      <ProfileHero
        isJunior={isJunior}
        displayName={displayName}
        age={profile?.age}
        grade={profile?.grade}
      />

      {!profile ? (
        <Card className="flex flex-col items-center py-10 text-center">
          <span className="text-5xl mb-3" aria-hidden="true">📝</span>
          <p className="text-title font-black text-primary mb-1">Профиль не заполнен</p>
          <p className="text-body text-secondary">
            Данные появятся после прохождения настройки профиля
          </p>
        </Card>
      ) : isJunior ? (
        <>
          <SelfDescriptionSection />
          <StrengthsSection cards={strengthCards} />
          <p className="text-secondary text-center" style={{ fontSize: 15 }}>
            Настройки и почта — у мамы. Если что-то нужно поменять, скажи ей.
          </p>
        </>
      ) : (
        <>
          <ParentAccessSection />
          <AttemptHistorySection entries={[]} />
          <AccountAccessSection email={user?.email} grade={profile?.grade} />
          <PersonalInfoSection profile={profile} onEdit={() => navigate('/onboarding/profile', { state: { fromSettings: true } })} />
          {hasSubjects && <SubjectsSection profile={profile} />}
          <ArtifactsSection artifacts={artifacts} onEdit={() => navigate('/onboarding/artifacts')} />
        </>
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
    </PageContainer>
  );
}
