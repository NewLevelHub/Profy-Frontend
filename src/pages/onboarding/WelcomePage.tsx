import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Clock, PauseCircle, Smile } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

// ── Pre-test intro ────────────────────────────────────────────────────────
// Shown exactly once per account, right before a user's first-ever
// assessment attempt — not right after registration (see useGoalSelection's
// "wasFirstEver" check, which routes here instead of straight to
// /assessment only the first time). By this point profile setup and
// artifacts are already done, so this is purely "here's how the test
// itself works," not a map of the rest of onboarding.

const FEATURES = [
  { Icon: Clock, titleKey: 'welcome.feature.timeTitle', subKey: 'welcome.feature.timeSub', tone: 'pine' as const },
  { Icon: PauseCircle, titleKey: 'welcome.feature.pauseTitle', subKey: 'welcome.feature.pauseSub', tone: 'dawn' as const },
  { Icon: Smile, titleKey: 'welcome.feature.gradeTitle', subKey: 'welcome.feature.gradeSub', tone: 'iris' as const },
] as const;

export default function WelcomePage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();

  return (
    <div className="journey-page min-h-screen flex flex-col">
      <div className="relative z-[1] flex-1 overflow-y-auto px-3 py-10 sm:px-4 lg:px-6 lg:py-14">
        <div className="w-full max-w-5xl mx-auto">
          <div className="onboarding-welcome-in journey-shell flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-11">
            <span className="journey-kicker">{t('welcome.kicker')}</span>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
              <div className="flex flex-col gap-3 min-w-0 flex-1">
                <Heading level="display-lg" className="text-[color:var(--text-heading)] text-balance">
                  {t('welcome.title')}
                </Heading>
                <Text variant="body-md" className="text-secondary max-w-[54ch]">
                  {t('welcome.body')}
                </Text>
              </div>
              <div className="journey-mascot-well journey-mascot-well--lg self-center sm:self-auto">
                <Mascot state="welcome" size={124} interactive />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FEATURES.map(({ Icon, titleKey, subKey, tone }) => (
                <div key={titleKey} className="journey-feature">
                  <span className={`journey-feature-icon journey-feature-icon--${tone}`} aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-md font-semibold text-[color:var(--text-heading)]">{t(titleKey)}</span>
                    <span className="text-body-sm font-book text-muted">{t(subKey)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between pt-1 border-t border-default">
              <p className="text-body-sm text-muted sm:max-w-[36ch] pt-3 sm:pt-0">
                Можно выйти и вернуться позже — прогресс не потеряется.
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:pt-3">
                {/* Assessment record already exists at this point (goal picked,
                    0 answered) — leaving here is the same "continue later" state
                    as exiting mid-quiz, just before the first question. */}
                <Button variant="text" onClick={() => navigate('/results')}>
                  {t('welcome.later')}
                </Button>
                <Button
                  variant="primary"
                  className={cn('w-full sm:w-auto')}
                  style={{ minHeight: 48 }}
                  onClick={() => navigate('/assessment')}
                >
                  {t('welcome.start')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
