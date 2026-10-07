import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { localizeGeo } from '@/shared/i18n/geo';
import { useProfile } from '../hooks/useProfile';
import { IdentityRail } from './IdentityRail';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SubjectsSection } from './SubjectsSection';
import { ArtifactsSection } from './ArtifactsSection';
import { CertificatesSection } from './CertificatesSection';
import { SettingsSection } from './SettingsSection';

// Keep account data and actions in the hook; the view is reusable for design review.
export function ProfileLedger() {
  const model = useProfile();
  const sound = useSoundEnabled();
  return <ProfileLedgerView model={model} sound={sound} />;
}

export function ProfileLedgerView({ model, sound, persistLocale = true }: {
  persistLocale?: boolean;
  model: ReturnType<typeof useProfile>;
  sound: Pick<ReturnType<typeof useSoundEnabled>, 'soundEnabled' | 'toggleSound' | 'prefersReducedMotion'>;
}) {
  const { profile, displayName, hasSubjects, artifacts, certificates, railSections, confirmRestart,
    handleLogout, handleRestartRequest, handleRestartConfirm, handleRestartCancel,
    handleEditPersonal, handleEditSubjects, handleEditArtifacts, handleEditCertificates } = model;
  const { soundEnabled, toggleSound, prefersReducedMotion } = sound;

  if (!profile) return null;

  return (
    <div className="rd-profile-layout">
      <IdentityRail
        displayName={displayName}
        age={profile.age}
        grade={profile.grade}
        city={localizeGeo(profile.city)}
        sections={railSections}
      />
      <div className="rd-profile-sections">
        <PersonalInfoSection profile={profile} onEdit={handleEditPersonal} />
        {hasSubjects && <SubjectsSection profile={profile} onEdit={handleEditSubjects} />}
        <ArtifactsSection artifacts={artifacts} onEdit={handleEditArtifacts} />
        <CertificatesSection
          certificates={certificates}
          onEdit={handleEditCertificates}
        />
        <SettingsSection
          persistLocale={persistLocale}
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
