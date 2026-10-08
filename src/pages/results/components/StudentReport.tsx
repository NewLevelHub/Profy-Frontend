import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ArrowDown, Sprout } from 'lucide-react';
import type { AgeGroup, AssessmentGoal, ResultResponse } from '@/shared/types';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { scrollToStudentSection } from '@/shared/ui/redesign/scrollToStudentSection';
import { ResultsReportBody } from './ResultsReportBody';

export function StudentReport({ report, ageGroup, goal, onDownload, children, readOnly = false }: {
  report: ResultResponse; ageGroup: AgeGroup | undefined; goal: AssessmentGoal | null | undefined;
  onDownload: () => void; children?: ReactNode; readOnly?: boolean;
}) {
  const { t } = useTranslation('results');
  const sections = [
    ['report-summary', 'summary'], ['report-interests', 'interests'], ['report-strengths', 'strengths'],
    ...(report.personality_notes.length ? [['report-personality', 'personality']] : []),
    ['report-thinking', 'thinking'],
    ...(report.exploration_activities.length ? [['report-exploration', 'exploration']] : []),
    ...(report.final_analysis ? [['report-analysis', 'analysis']] : []),
    ['results-goal-branch', 'next'],
  ];
  return <div className="rd-report">
    <StudentPageHeading title={t('redesign.title')} subtitle={t('redesign.subtitle')}>
      <button type="button" className="rd-button rd-button-outline rd-button-small" onClick={onDownload}><Download size={16} />{t('page.downloadPdf')}</button>
    </StudentPageHeading>
    <div className="rd-report-layout">
      <div className="rd-report-body">
        <ResultsReportBody redesigned report={report} ageGroup={ageGroup} goal={goal} readOnly={readOnly} />
        {children}
      </div>
      <aside className="rd-report-sidebar">
        <nav aria-label={t('redesign.contents')}><p className="rd-eyebrow">{t('redesign.contents')}</p>
          {sections.map(([id, key], index) => <a href={`#${id}`} key={id} onClick={event => scrollToStudentSection(event, id)}><span>{String(index + 1).padStart(2, '0')}</span>{t(`redesign.sections.${key}`)}</a>)}
        </nav>
        <div className="rd-report-note"><Sprout size={22} aria-hidden="true" /><p>{t('redesign.note')}</p>
          <a href="#results-goal-branch" onClick={event => scrollToStudentSection(event, 'results-goal-branch')}>{t('redesign.toNext')}<ArrowDown size={15} aria-hidden="true" /></a>
        </div>
      </aside>
    </div>
  </div>;
}
