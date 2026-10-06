import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { GoalCheckView } from '../GoalCheckPage';
import { RestStopView } from '../RestStopPage';
import { ResultLoadingView } from '../components/ResultLoadingView';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import { JourneyCheckpoint } from '@/shared/ui';
import { FullScreenPreferences } from '@/shared/ui/FullScreenPreferences';
import { PrintDocument } from '@/pages/results/print/components/PrintDocument';
import { PrintToolbar } from '@/pages/results/print/components/PrintToolbar';
import { UsersPrintReport } from '@/pages/admin/components/UsersPrintReport';
import { AssessmentPrintReport } from '@/pages/admin/components/AssessmentPrintReport';
import { studentFixtures } from '@/pages/results/design/studentFixtures';
import { printWithTitle } from '@/shared/lib/printDocument';
import type { AdminUserListItem, AdminUserDetail, AdminAssessmentDetail } from '@/shared/types';
import type { JourneyStage } from '@/shared/lib/journeyProgress';
import '@/shared/ui/redesign/redesign.css';
import '@/shared/ui/redesign/checkpoints.css';

const VIEWS = ['goal', 'empty', 'rest', 'speed', 'loading', 'error', 'notFound', 'print', 'users', 'assessment'] as const;
/** Fictional fixtures only. No assessment/store writes or content API calls. */
export default function FinishingDesignPreview() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const view = VIEWS.find(value => value === params.get('view')) ?? 'goal';
  const select = (value: typeof VIEWS[number]) => { setParams({ view: value }); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const { report, profile } = studentFixtures(t);
  const next = () => select('print');
  const stages: JourneyStage[] = [{ id: 'diagnostic', fraction: 1 }, { id: 'motivation', fraction: .5 }, { id: 'belbin', fraction: 0 }, { id: 'astur', fraction: 0 }];
  const users: AdminUserListItem[] = Array.from({ length: 36 }, (_, i) => ({
    id: `preview-${i}`, email: `student-${i + 1}@example.test`, is_verified: true, is_active: true, role: 'student', is_admin: false,
    created_at: report.created_at, last_active_at: null, has_profile: true, profile_name: `${profile.name} · ${i + 1}`,
    city: profile.city, grade: 10, age: 16, assessments_count: 1, latest_assessment_status: 'completed', latest_assessment_goal: 'university',
    riasec: null, mi: null, big_five: null,
  }));
  const user: AdminUserDetail = { ...users[0], profile, artifacts: [], assessments: [] };
  const assessment: AdminAssessmentDetail = {
    id: 'preview', user_id: user.id, user_email: user.email, profile_name: profile.name, goal: 'university', status: 'completed',
    answered_count: 1, total_questions: 1, created_at: report.created_at, completed_at: report.created_at,
    responses: [], motivation_responses: [], astur_runs: [], belbin_runs: [], psychoemotional_runs: [], analysis_result: {
      id: 'preview-analysis', assessment_id: 'preview', profile: { R: 35, I: 82, A: 85, S: 58, E: 40, C: 36 }, code: ['A', 'I'],
      meta: { differentiation: 50, consistency: 'high', aversion: {} }, careers: [], strengths: [], weaknesses: [],
      development_plan: { reinforce: [], compensate: [] }, big_five: { O: 80, C: 65, E: 60, A: 72, N: 30 },
      thinking_style: { creative_think: 78, systematic: 64, strategic: 59, practical: 68 },
      personality_highlights: [], personality_profile: {}, personality_notes: {},
      motivation: { interest: 8, challenge: 6, helping: 4, freedom: 5, money: 3, recognition: 2, stability: 1, creation: 7, teamwork: 4 },
      motivation_top: ['interest', 'creation'], motivation_highlights: report.motivation_highlights,
      strength_cards: report.strength_cards, thinking_style_notes: report.thinking_style_notes,
      report_version: 2, summary: report.summary, created_at: report.created_at,
    },
  };
  return <div className="redesign rd-finishing-preview">
    <aside data-print-hide className="rd-finishing-preview-bar">
      <p>{t('common:finishingPreview.title')}</p>
      <nav aria-label={t('common:finishingPreview.viewsLabel')}>{VIEWS.map(value => <button type="button" key={value} aria-pressed={view === value} onClick={() => select(value)}>{t(`common:finishingPreview.views.${value}`)}</button>)}</nav>
    </aside>
    {(view === 'goal' || view === 'empty') && <GoalCheckView showsCareers suggestions={view === 'empty' ? [] : report.careers.slice(0, 2).map(c => ({ key: c.slug, icon: '', title: c.name, subtitle: c.why }))} onContinue={next} />}
    {(view === 'rest' || view === 'speed') && <RestStopView state={{ returnTo: '/design/finishing', stages, totalAnswered: 156 }} isSpeedVariant={view === 'speed'} onContinue={next} onPause={() => select('goal')} />}
    {view === 'loading' && <ResultLoadingView fullPage />}
    {view === 'error' && <JourneyCheckpoint kicker={t('assessment:goalCheck.kicker')} title={t('common:errorBoundary.title')} body={t('assessment:resultLoading.error')} illustration="rest"
      actions={<button type="button" className="rd-button" onClick={() => select('loading')}>{t('common:retry')}</button>} />}
    {view === 'notFound' && <NotFoundPage />}
    {['print', 'users', 'assessment'].includes(view) && <div className="print-shell px-4 py-6">
      <div className="print-page-frame max-w-[210mm] mx-auto">
        <div data-print-hide className="print-screen-header"><span className="rd-eyebrow">{t('common:finishingPreview.title')}</span><FullScreenPreferences /></div>
        <PrintToolbar onBack={() => select('goal')} onPrint={() => void printWithTitle('Profile-design-preview')} />
        {view === 'print' ? <PrintDocument report={report} profile={profile} ageGroup="senior" goal="university" /> : <div className="print-sheet">
          {view === 'users' ? <UsersPrintReport preview items={users} total={users.length} filters={[t('admin:users.filterStatus', { status: t('admin:status.completed') })]} truncated={false} />
            : <AssessmentPrintReport preview user={user} assessment={assessment} index={1} />}
        </div>}
      </div>
    </div>}
  </div>;
}
