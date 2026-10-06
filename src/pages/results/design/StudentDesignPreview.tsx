import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StudentNavigation } from '@/shared/ui/redesign/StudentNavigation';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { StudentReport } from '../components/StudentReport';
import { AssessmentNotStartedCard } from '../components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from '../components/AssessmentInProgressCard';
import { AssessmentCompletedCard } from '../components/AssessmentCompletedCard';
import { FeedbackSection } from '../components/FeedbackSection';
import { ProfileLedgerView } from '@/pages/profile/sections/ProfileLedger';
import { CertificateEditView } from '@/pages/profile/certificates/CertificatesEditPage';
import { CERTIFICATE_TYPES, validateCertificateScore } from '@/shared/config/certificates';
import { translateErrors } from '@/shared/lib/validationMessage';
import type { CertificateType, ValidationMessage } from '@/shared/types';
import { studentFixtures } from './studentFixtures';
import '@/shared/ui/redesign/redesign.css';
import '@/shared/ui/redesign/student.css';
import '@/shared/ui/redesign/journey.css';

const VIEWS = ['report', 'explore', 'notStarted', 'inProgress', 'completed', 'error', 'profile', 'scores'] as const;
type View = typeof VIEWS[number];

export default function StudentDesignPreview() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('report');
  const [notice, setNotice] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scores, setScores] = useState<Record<CertificateType, string>>({ ielts: '6.5', unt: '112', sat: '', toefl: '' });
  const [errors, setErrors] = useState<Partial<Record<CertificateType, ValidationMessage>>>({});
  const mainRef = useRef<HTMLElement>(null);
  const { report, profile } = studentFixtures(t);
  const select = (value: View) => { setView(value); setNotice(false); setConfirmRestart(false); mainRef.current?.scrollTo({ top: 0 }); };
  const showNotice = () => setNotice(true);
  const model = {
    profile, displayName: profile.name, initial: profile.name[0], hasSubjects: true,
    artifacts: profile.artifacts, certificates: profile.certificates,
    railSections: ['personal', 'subjects', 'artifacts', 'certificates', 'settings'].map((id, index) => ({ id, number: `0${index + 1}`, label: t(`profile:rail.${id}`) })),
    confirmRestart, handleLogout: showNotice, handleRestartRequest: () => setConfirmRestart(true),
    handleRestartConfirm: () => select('notStarted'), handleRestartCancel: () => setConfirmRestart(false),
    handleEditPersonal: showNotice, handleEditSubjects: showNotice, handleEditArtifacts: showNotice, handleEditCertificates: () => select('scores'),
  };
  function saveScores() {
    const nextErrors = Object.fromEntries(CERTIFICATE_TYPES.map(type => [type, validateCertificateScore(type, scores[type])]));
    setErrors(nextErrors);
    if (Object.values(nextErrors).every(value => !value)) showNotice();
  }
  return <div className="redesign rd-student flex flex-col overflow-hidden">
    <aside className="rd-student-preview">
      <p>{t('results:redesign.preview.title')}</p>
      <nav aria-label={t('results:redesign.preview.viewsLabel')}>{VIEWS.map(value => <button type="button" key={value} aria-pressed={view === value} onClick={() => select(value)}>{t(`results:redesign.preview.views.${value}`)}</button>)}</nav>
      {notice && <p role="status">{t('results:redesign.preview.notice')}</p>}
    </aside>
    <StudentNavigation persistLocale={false} activePath={view === 'profile' || view === 'scores' ? '/profile' : '/results'} identity={profile.name} onLogout={showNotice}
      onNavigate={path => path === '/profile' ? select('profile') : path === '/results' ? select('report') : showNotice()} />
    <main id="student-content" ref={mainRef} onClickCapture={event => {
      const link = (event.target as Element).closest('a');
      if (link?.getAttribute('href')?.startsWith('/results/directions/')) { event.preventDefault(); showNotice(); }
    }} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-[var(--main-pad-y)]">
      <PageContainer>
        {(view === 'report' || view === 'explore') && <StudentReport report={report} ageGroup="senior" goal={view === 'explore' ? 'explore' : 'university'} onDownload={showNotice}><FeedbackSection assessmentId={null} /></StudentReport>}
        {view === 'notStarted' && <AssessmentNotStartedCard onStart={() => select('inProgress')} />}
        {view === 'inProgress' && <AssessmentInProgressCard completedPhaseCount={2} totalPhaseCount={4} progress={64} currentPhase="belbin" onContinue={() => select('completed')} />}
        {view === 'completed' && <AssessmentCompletedCard onOpenProfile={() => select('profile')} onOpenUniversities={showNotice} />}
        {view === 'error' && <JourneyEmptyState illustration="/mascot/redesign/rest.png" title={t('results:error.somethingWrong')} body={t('results:error.loadResults')} actionLabel={t('common:retry')} onAction={() => select('report')} />}
        {view === 'profile' && <div className="rd-profile"><StudentPageHeading kicker={t('profile:redesign.kicker')} title={t('profile:redesign.title')} subtitle={t('profile:redesign.subtitle')} />
          <ProfileLedgerView persistLocale={false} model={model} sound={{ soundEnabled, toggleSound: () => setSoundEnabled(value => !value), prefersReducedMotion: false }} />
        </div>}
        {view === 'scores' && <div className="rd-journey rd-certificate-edit"><CertificateEditView model={{ scores,
          setScore: (type, value) => { setScores(previous => ({ ...previous, [type]: value })); setErrors(previous => ({ ...previous, [type]: undefined })); },
          errors: translateErrors(errors, t), isLoading: false, saveError: false, handleSave: saveScores, handleCancel: () => select('profile'),
        }} /></div>}
      </PageContainer>
    </main>
  </div>;
}
