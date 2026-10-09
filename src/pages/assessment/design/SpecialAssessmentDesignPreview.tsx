import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AsturSubtestKey } from '@/shared/types';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentLayout } from '../components/AssessmentLayout';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { AssessmentCompletion } from '../components/AssessmentCompletion';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';
import { BelbinBlock } from '../belbin/components/BelbinBlock';
import { SubtestIntro } from '../astur/components/SubtestIntro';
import { SubtestRunner } from '../astur/components/SubtestRunner';
import { LabilityRunner } from '../astur/components/LabilityRunner';
import { ASTUR_PREVIEW_KEYS, specialAssessmentFixtures } from './specialAssessmentFixtures';

const VIEWS = ['belbinIntro', 'belbin', 'belbinDone', 'asturIntro', 'asturInstruction', 'astur', 'asturDone'] as const;
type View = typeof VIEWS[number];
const PREVIEW_RUN_ID = 'design-preview-only';

/** DEV-only: no assessment API calls or application stores. Lability's local
 * draft uses a dedicated preview key and is removed when this page closes. */
export default function SpecialAssessmentDesignPreview() {
  const { t } = useTranslation('assessment');
  const [view, setView] = useState<View>('belbinIntro');
  const [kind, setKind] = useState<AsturSubtestKey>('awareness');
  const [allocation, setAllocation] = useState<Record<string, number>>({});
  const [revision, setRevision] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [timerSlot, setTimerSlot] = useState<HTMLDivElement | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const { belbin, subtest } = specialAssessmentFixtures(t, kind);
  const isBelbin = view.startsWith('belbin');
  const title = t(isBelbin ? 'rail.sectionBelbin' : 'rail.sectionAstur');

  useEffect(() => {
    const clearDraft = () => { try { sessionStorage.removeItem(`profy-astur-lability:${PREVIEW_RUN_ID}`); } catch { /* Optional draft storage. */ } };
    clearDraft();
    return clearDraft;
  }, []);

  function selectView(next: View) {
    setView(next); setAllocation({}); setRevision(r => r + 1);
    setStartedAt(new Date().toISOString());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const next = () => selectView(VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length]);

  return <AssessmentLayout>
    <aside className="rd-assessment-preview" aria-label={t('redesign.preview.title')}>
      <div><p>{t('redesign.preview.title')}</p><LanguageSwitcher /></div>
      <nav aria-label={t('redesign.preview.formats')}>
        {VIEWS.map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => selectView(item)}>
          {t(`redesign.specialPreview.views.${item}`)}
        </button>)}
      </nav>
      {!isBelbin && view !== 'asturDone' && <nav className="rd-assessment-preview-subnav" aria-label={t('rail.sectionAstur')}>
        {ASTUR_PREVIEW_KEYS.map(item => <button key={item} type="button" aria-pressed={kind === item}
          onClick={() => { setKind(item); selectView(view === 'asturIntro' ? 'asturInstruction' : view); }}>
          {t(`redesign.specialPreview.${item}.name`)}
        </button>)}
      </nav>}
    </aside>
    <AssessmentRail title={title} sectionLabel={title} progressAriaLabel={t('rail.progressAriaTest')}
      progress={isBelbin ? 60 : 80} onExit={() => setExitOpen(true)} statusSlotRef={setTimerSlot} />
    <main id="assessment-content" tabIndex={-1} className="rd-assessment-main">
      {view === 'belbinIntro' && <AssessmentIntro illustrated kicker={t('intro.belbin.kicker')}
        title={t('intro.belbin.title')} subtitle={t('intro.belbin.subtitle')}
        itemCountLabel={t('intro.itemCount', { count: 7 })} durationLabel={t('intro.durationMin', { count: 10 })}
        ctaLabel={t('intro.belbin.cta')} onStart={next} />}
      {view === 'asturIntro' && <AssessmentIntro illustrated kicker={t('intro.astur.kicker')}
        title={t('intro.astur.title')} subtitle={t('intro.astur.subtitle')}
        itemCountLabel={t('intro.astur.itemCount', { count: 8 })} durationLabel={t('intro.durationUpToMin', { count: 40 })}
        ctaLabel={t('intro.astur.cta')} onStart={next} secondaryCtaLabel={t('intro.astur.pause')}
        onSecondaryAction={() => setExitOpen(true)} />}
      {view === 'asturInstruction' && <SubtestIntro subtest={subtest} index={subtest.number - 1} count={8} labilityItemLimitMs={15000} starting={false} onStart={next} />}
      {view === 'belbin' && <div className="rd-assessment-workspace"><BelbinBlock section={belbin} sectionIndex={0} sectionCount={7}
        allocation={allocation} blockTotal={10} isValid={Object.values(allocation).reduce((a, b) => a + b, 0) === 10}
        isLastBlock={false} submitting={false} submitError={null} onChange={setAllocation}
        onBack={() => selectView('belbinIntro')} onNext={next} /></div>}
      {view === 'astur' && <div className="rd-assessment-workspace" key={`${kind}-${revision}`}>
        {kind === 'lability' ? <LabilityRunner subtest={subtest} runId={PREVIEW_RUN_ID} startedAt={startedAt} serverClock={null}
          itemLimitMs={15000} submitting={false} submitError={null} onSubmit={next} />
          : <SubtestRunner subtest={subtest} startedAt={startedAt} serverClock={null} timerSlot={timerSlot} submitting={false} submitError={null} onSubmit={next} />}
      </div>}
      {(view === 'belbinDone' || view === 'asturDone') && <div className="rd-assessment-workspace"><AssessmentCompletion
        title={t(isBelbin ? 'belbin.doneTitle' : 'astur.doneTitle')}
        message={t(isBelbin ? 'belbin.doneMessage' : 'astur.doneMessage')}
        action={t(isBelbin ? 'belbin.toAstur' : 'astur.generateReport')} onContinue={next} /></div>}
    </main>
    <ExitAssessmentModal redesigned open={exitOpen} onContinue={() => setExitOpen(false)}
      title={!isBelbin ? t('astur.exit.title') : undefined} body={!isBelbin ? t('astur.exit.body') : undefined}
      saveAndExitLabel={!isBelbin ? t('astur.exit.confirm') : undefined}
      onSaveAndExit={() => { setExitOpen(false); selectView(isBelbin ? 'belbinIntro' : 'asturIntro'); }} />
  </AssessmentLayout>;
}
