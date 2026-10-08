import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { ArrowRight, Compass, RotateCcw } from 'lucide-react';
import { Button, Spinner } from '@/shared/ui';
import { JourneyShell } from '@/shared/ui/redesign/JourneyShell';
import { useGoalGuard, useGoalSelection } from './hooks/useGoalSelection';
import type { AssessmentGoal, AgeGroup } from '@/shared/types';

interface GoalCard {
  goal: AssessmentGoal;
  tag: string;
  title: string;
  subtitle: string;
  /** Card is hidden below this age group — matches the age-gating already
   *  used for the goal badge on /results (GoalBadge): an unavailable card
   *  is simply absent, never shown disabled-with-explanation. */
  minAgeGroup?: AgeGroup;
  /** Temporarily hidden while in testing — 'explore' is switched off for now
   *  so only the profession-choice goal is selectable; flip back to show it. */
  hidden?: boolean;
}

const AGE_RANK: Record<AgeGroup, number> = { junior: 0, middle: 1, senior: 2 };

const GOAL_CARDS: GoalCard[] = [
  {
    goal: 'explore',
    tag: 'goalSelection.cardExploreTag',
    title: 'goalSelection.cardExploreTitle',
    subtitle: 'goalSelection.cardExploreSubtitle',
    hidden: true,
  },
  {
    // Sends 'university' to the backend, not 'profession' — see
    // GoalBadge.tsx's comment for why the two values are treated as fully
    // equivalent everywhere they're read.
    goal: 'university',
    tag: 'goalSelection.cardProfessionTag',
    title: 'goalSelection.cardProfessionTitle',
    subtitle: 'goalSelection.cardProfessionSubtitle',
    minAgeGroup: 'middle',
  },
];

function GoalDialog({ open, title, body, onDismiss, children }: {
  open: boolean; title: string; body: string; onDismiss: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation('assessment');
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);
  return (
    <dialog ref={ref} className="rd-goal-dialog" aria-labelledby="goal-dialog-title" aria-describedby="goal-dialog-body" onCancel={event => { event.preventDefault(); onDismiss(); }}>
      <span className="rd-icon-tile rd-lilac"><RotateCcw aria-hidden="true" /></span>
      <h2 id="goal-dialog-title">{title}</h2>
      <p id="goal-dialog-body">{body}</p>
      <div className="rd-dialog-actions">{children}</div>
      <Button variant="text" onClick={onDismiss}>{t('goalSelection.notNow')}</Button>
    </dialog>
  );
}

export default function GoalSelectionPage() {
  const { t } = useTranslation('assessment');
  const { t: to } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const { shouldRedirect } = useGoalGuard();
  const {
    ageGroup, isLoading, isCheckingCurrent, error, resumeOpen, restartOpen,
    handleGoalSelect, handleResume, handleStartNew, handleViewResults, handleConfirmRestart, handleSkip,
  } = useGoalSelection();

  if (shouldRedirect) return <Navigate to="/results" replace />;
  const visibleCards = GOAL_CARDS.filter(card => !card.hidden && (!card.minAgeGroup || AGE_RANK[ageGroup] >= AGE_RANK[card.minAgeGroup]));

  return (
    <JourneyShell>
      <GoalDialog open={resumeOpen || restartOpen} title={t(resumeOpen ? 'goalSelection.incompleteTitle' : 'goalSelection.haveResultsTitle')} body={t(resumeOpen ? 'goalSelection.incompleteBody' : 'goalSelection.haveResultsBody')} onDismiss={handleSkip}>
        <Button className="rd-button" onClick={resumeOpen ? handleResume : handleViewResults}>{t(resumeOpen ? 'goalSelection.continueTest' : 'goalSelection.viewResults')}<ArrowRight size={17} aria-hidden="true" /></Button>
        <Button variant="ghost" className="rd-button rd-button-outline" onClick={resumeOpen ? handleStartNew : handleConfirmRestart}>{t(resumeOpen ? 'goalSelection.startOver' : 'goalSelection.retakeAgain')}</Button>
      </GoalDialog>
      <main id="journey-content" tabIndex={-1} className="rd-goal-main">
        <div className="rd-goal-heading">
          <span className="rd-icon-tile rd-peach"><Compass aria-hidden="true" /></span>
          
          <h1>{t('goalSelection.question')}</h1>
          <p>{t('goalSelection.hint')}</p>
        </div>
        {isCheckingCurrent || restartOpen ? (
          <div className="rd-goal-loading" role="status" aria-label={tc('loading')}><Spinner size="lg" /></div>
        ) : (
          <div className="rd-goal-cards">
            {visibleCards.map(card => (
              <article className="rd-goal-card" key={card.goal}>
                <div className="rd-goal-card-copy">
                  <span className="rd-eyebrow">{t(card.tag)}</span>
                  <h2>{t(card.title)}</h2>
                  <p>{t(card.subtitle)}</p>
                  <Button className="rd-button" isLoading={isLoading} onClick={() => handleGoalSelect(card.goal)}>{t('goalSelection.pickThisGoal')}<ArrowRight size={17} aria-hidden="true" /></Button>
                </div>
                <img src="/mascot/redesign/book.png" alt="" width="1254" height="1254" />
              </article>
            ))}
            {visibleCards.length === 0 && <p className="rd-journey-error">{to('redesign.goalUnavailable')}</p>}
          </div>
        )}
        {error && <p className="rd-journey-error" role="alert">{error}</p>}
        <div className="rd-goal-later"><Button variant="text" disabled={isLoading} onClick={handleSkip}>{t('goalSelection.notNow')}</Button></div>
      </main>
    </JourneyShell>
  );
}
