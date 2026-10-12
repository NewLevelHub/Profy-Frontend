import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '@/shared/ui/redesign/redesign.css';
import '../assessment.css';
import '../special-assessments.css';

/** Opt-in shell: assessment stages share tokens without changing other application pages. */
export function AssessmentLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('onboarding');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return (
    <div className="redesign rd-assessment">
      <a className="rd-skip" href="#assessment-content">{t('redesign.skip')}</a>
      {children}
    </div>
  );
}
