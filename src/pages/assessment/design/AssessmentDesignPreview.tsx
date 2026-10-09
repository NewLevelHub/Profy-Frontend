import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Instrument, MotivationStatement, Question, QuestionPair } from '@/shared/types';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentLayout } from '../components/AssessmentLayout';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { LikertPage } from '../components/LikertPage';
import { PairPage } from '../components/PairPage';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';
import { MotivationQuestion } from '../motivation/MotivationQuestion';
import { CheckInStep } from '../psychoemotional/components/CheckInStep';
import { ColorCircleStep } from '../psychoemotional/components/ColorCircleStep';
import '../psychoemotional/psychoemotional.css';

const VIEWS = ['intro', 'likert', 'abilities', 'binary', 'anxiety', 'pairs', 'motivation', 'checkin', 'colors'] as const;
type View = typeof VIEWS[number];
const INSTRUMENTS: Partial<Record<View, Instrument>> = {
  likert: 'riasec', abilities: 'professional_types_abilities', binary: 'eysenck', anxiety: 'kondash_anxiety',
};

/** DEV-only: no assessment hooks, stores or API calls. Safe for design review. */
export default function AssessmentDesignPreview() {
  const { t } = useTranslation('assessment');
  const [view, setView] = useState<View>('intro');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pairs, setPairs] = useState<Record<number, string>>({});
  const [order, setOrder] = useState([0, 1, 2]);
  const [confirmed, setConfirmed] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  function selectView(next: View) {
    setView(next); setAnswers({}); setPairs({}); setConfirmed(false); setOrder([0, 1, 2]);
    setRevision(r => r + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const questions: Question[] = [0, 1].map(index => ({
    id: String(index), instrument: INSTRUMENTS[view] ?? 'riasec', riasec_type: null, bigfive_domain: null,
    bigfive_scale: false, order: index, text: t(`redesign.preview.questions.${index}`),
  }));
  const pair: QuestionPair = {
    pair_index: 0, instrument: 'professional_types', frame: t('format.pickCloser'), display_order: 0,
    option_a: { id: 'a', text: t('redesign.preview.pairA'), icon: null, riasec_type: null, bigfive_domain: null },
    option_b: { id: 'b', text: t('redesign.preview.pairB'), icon: null, riasec_type: null, bigfive_domain: null },
  };
  const statements: MotivationStatement[] = order.map(index => ({
    id: String(index), triplet_index: 0, order: index, text: t(`redesign.preview.statements.${index}`),
  }));
  const next = () => selectView(VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length]);
  const title = view === 'motivation' ? t('rail.sectionMotivation') : t('rail.sectionDiagnostic');

  return <AssessmentLayout>
    <aside className="rd-assessment-preview" aria-label={t('redesign.preview.title')}>
      <div><p>{t('redesign.preview.title')}</p><LanguageSwitcher /></div>
      <nav aria-label={t('redesign.preview.formats')}>
        {VIEWS.map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => selectView(item)}>
          {t(`redesign.preview.views.${item}`)}
        </button>)}
      </nav>
    </aside>
    <AssessmentRail title={view === 'motivation' ? t('rail.questionOf', { current: 1, total: 12 }) : title}
      sectionLabel={title} progressAriaLabel={t('rail.progressAriaTest')} progress={view === 'intro' ? 0 : 24}
      showBack={view !== 'intro'} onBack={() => selectView(VIEWS[Math.max(0, VIEWS.indexOf(view) - 1)])}
      onExit={() => setExitOpen(true)} />
    <main id="assessment-content" tabIndex={-1} className="rd-assessment-main" key={revision}>
      {view === 'intro' && <AssessmentIntro illustrated kicker={t('intro.diagnostic.kicker')}
        title={t('intro.diagnostic.title')} subtitle={t('intro.diagnostic.subtitle')}
        itemCountLabel={t('intro.itemCount', { count: 20 })} durationLabel={t('intro.durationMin', { count: 6 })}
        ctaLabel={t('intro.diagnostic.cta')} onStart={next} />}
      {INSTRUMENTS[view] && <div className="rd-assessment-workspace"><LikertPage questions={questions}
        answers={answers} onSelect={(id, value) => setAnswers(a => ({ ...a, [id]: value }))} onSubmit={next} saving={false} savingVisible={false} /></div>}
      {view === 'pairs' && <div className="rd-assessment-workspace"><PairPage pairs={[pair]} answers={pairs}
        onSelect={(id, value) => setPairs(a => ({ ...a, [id]: value }))} onSubmit={next} saving={false} savingVisible={false} /></div>}
      {view === 'motivation' && <div className="rd-assessment-workspace"><div className="rd-assessment-ranking"><MotivationQuestion
        statements={statements} onReorder={ids => { setOrder(ids.map(Number)); setConfirmed(true); }}
        onConfirm={() => setConfirmed(true)} confirmed={confirmed} canProceed={confirmed} onNext={next} disabled={false} /></div></div>}
      {view === 'checkin' && <CheckInStep onSubmit={next} />}
      {view === 'colors' && <ColorCircleStep instruction={t('psychoemotional.circle1.instruction')} onComplete={next} />}
    </main>
    <ExitAssessmentModal redesigned open={exitOpen}
      title={view === 'motivation' ? t('redesign.motivationExitTitle') : undefined}
      body={view === 'motivation' ? t('redesign.motivationExitBody', { continueLabel: t('priority.continue') }) : undefined}
      saveAndExitLabel={view === 'motivation' ? t('rail.exit') : undefined} onContinue={() => setExitOpen(false)}
      onSaveAndExit={() => { setExitOpen(false); selectView('intro'); }} />
  </AssessmentLayout>;
}
