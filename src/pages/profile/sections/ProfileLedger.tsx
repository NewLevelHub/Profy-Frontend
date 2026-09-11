import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { localizeGeo } from '@/shared/i18n/geo';
import { useProfile } from '../hooks/useProfile';
import { IdentityRail } from './IdentityRail';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SubjectsSection } from './SubjectsSection';
import { ArtifactsSection } from './ArtifactsSection';
import { CertificatesSection } from './CertificatesSection';
import { SettingsSection } from './SettingsSection';

// Full (non-junior) profile — glass identity rail + numbered ledger over the
// mesh canvas. Reads its own data/handlers off useProfile rather than taking
// two dozen props, since it's the only caller.
export function ProfileLedger() {
  const {
    profile,
    displayName,
    hasSubjects,
    artifacts,
    certificates,
    railSections,
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
    handleEditPersonal,
    handleEditSubjects,
    handleEditArtifacts,
    handleEditCertificates,
  } = useProfile();
  const { soundEnabled, toggleSound, prefersReducedMotion } = useSoundEnabled();

  if (!profile) return null;

  return (
    <div className="panel-glass overflow-hidden lg:grid lg:grid-cols-[300px_1fr]">
      <IdentityRail
        displayName={displayName}
        age={profile.age}
        grade={profile.grade}
        city={localizeGeo(profile.city)}
        sections={railSections}
      />
      <div className="flex flex-col min-w-0 bg-[color-mix(in_srgb,var(--paper)_45%,transparent)]">
        <PersonalInfoSection profile={profile} onEdit={handleEditPersonal} />
        {hasSubjects && <SubjectsSection profile={profile} onEdit={handleEditSubjects} />}
        <ArtifactsSection artifacts={artifacts} onEdit={handleEditArtifacts} />
        <CertificatesSection
          certificates={certificates}
          onEdit={handleEditCertificates}
        />
        <SettingsSection
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          prefersReducedMotion={prefersReducedMotion}
          confirmRestart={confirmRestart}
          onRestartRequest={handleRestartRequest}
          onRestartConfirm={handleRestartConfirm}
          onRestartCancel={handleRestartCancel}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
