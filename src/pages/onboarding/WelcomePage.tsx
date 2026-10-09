import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ArrowRight, Clock, PauseCircle, Smile } from 'lucide-react';
import { Button } from '@/shared/ui';
import { JourneyShell } from '@/shared/ui/redesign/JourneyShell';

// The assessment already exists here: this is the first-test intro after goal selection.
const FEATURES = [
  { Icon: Clock, titleKey: 'welcome.feature.timeTitle', subKey: 'welcome.feature.timeSub', tone: 'sage' },
  { Icon: PauseCircle, titleKey: 'welcome.feature.pauseTitle', subKey: 'welcome.feature.pauseSub', tone: 'peach' },
  { Icon: Smile, titleKey: 'welcome.feature.gradeTitle', subKey: 'welcome.feature.gradeSub', tone: 'lilac' },
] as const;

export default function WelcomePage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  return (
    <JourneyShell>
      <main id="journey-content" tabIndex={-1} className="rd-welcome-main">
        <div className="rd-welcome-intro">
          <div className="rd-welcome-copy">
            <p className="rd-eyebrow">{t('welcome.kicker')}</p>
            <h1>{t('welcome.title')}</h1>
            <p>{t('welcome.body')}</p>
          </div>
          <img src="/mascot/redesign/greeting.png" width="1254" height="1254" alt="" />
        </div>
        <div className="rd-welcome-features">
          {FEATURES.map(({ Icon, titleKey, subKey, tone }) => (
            <div key={titleKey} className="rd-welcome-feature">
              <span className={`rd-icon-tile rd-${tone}`}><Icon aria-hidden="true" /></span>
              <h2>{t(titleKey)}</h2>
              <p>{t(subKey)}</p>
            </div>
          ))}
        </div>
        <div className="rd-welcome-actions">
          <p>{t('welcome.exitHint')}</p>
          <div>
            <Button variant="text" onClick={() => navigate('/results')}>{t('welcome.later')}</Button>
            <Button className="rd-button" onClick={() => navigate('/assessment/psychoemotional-start')}>{t('welcome.start')}<ArrowRight size={17} aria-hidden="true" /></Button>
          </div>
        </div>
      </main>
    </JourneyShell>
  );
}
