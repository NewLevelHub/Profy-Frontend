import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { useProfile } from './hooks/useProfile';
import { ProfileHero } from './sections/ProfileHero';
import { ProfileLedger } from './sections/ProfileLedger';
import { SelfDescriptionSection } from './sections/junior/SelfDescriptionSection';
import { StrengthsSection } from './sections/junior/StrengthsSection';

// Same layout scale/radii/grid for every age — the difference is in block
// composition and access, not the visual system (design spec §12). Junior
// (under-12, "Мои штуки") gets a lighter, content-only page: what they told
// us about themselves + their strengths. Everyone else gets the full
// "vedomost" ledger — identity rail + numbered sections (see ProfileLedger).
// Settings/account-shaped affordances (password, email, parent access,
// attempt history) stay withheld for junior — there is no `/parent` surface
// anywhere in this app yet (see ParentAccessSection's header comment), so
// the footer just tells the child where that lives conceptually rather than
// linking to a page that doesn't exist.
//
// Page entrance lives on AppLayout (`.page-enter`) so Results / Universities /
// Profile share one motion — don't re-wrap blocks here.
export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { profile, displayName, isJunior, strengthCards } = useProfile();

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      {!profile ? (
        <Card className="flex flex-col items-center py-10 text-center bg-transparent">
          <span className="text-5xl mb-3" aria-hidden="true">📝</span>
          <p className="text-title font-black text-primary mb-1">{t('page.notFilledTitle')}</p>
          <p className="text-body text-secondary">
            {t('page.notFilledBody')}
          </p>
        </Card>
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
