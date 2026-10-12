import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { ArrowRight, Award, Compass, Target } from 'lucide-react';
import { JourneyCheckpoint } from '@/shared/ui';
import { useGoalCheck, type GoalSuggestion } from './hooks/useGoalCheck';

const SUGGESTION_ICONS = { career: Target, interest: Compass, strength: Award } as const;

function SuggestionIcon({ kind }: { kind: GoalSuggestion['kind'] }) {
  const Icon = SUGGESTION_ICONS[kind];
  return <Icon aria-hidden="true" />;
}

/** Real report data only; the view is also used by the isolated design preview. */
export function GoalCheckView({ showsCareers, suggestions, onContinue }: {
  showsCareers: boolean; suggestions: GoalSuggestion[]; onContinue: () => void;
}) {
  const { t } = useTranslation('assessment');
  const hasSuggestions = suggestions.length > 0;
  return <JourneyCheckpoint kicker={t('goalCheck.kicker')} title={t(hasSuggestions ? 'goalCheck.title' : 'goalCheck.emptyTitle')}
    body={t(!hasSuggestions ? 'goalCheck.fullReadyBody' : showsCareers ? 'goalCheck.subtitleCareers' : 'goalCheck.subtitleInterests')}
    actions={<button type="button" className="rd-button" onClick={onContinue}>{t('goalCheck.showReport')}<ArrowRight size={18} aria-hidden="true" /></button>}>
    {hasSuggestions && <div className="rd-checkpoint-options">
      {suggestions.slice(0, 2).map((suggestion, index) => <section key={suggestion.key} className="rd-checkpoint-option">
        <span className={`rd-icon-tile ${index === 0 ? 'rd-lilac' : 'rd-peach'}`}><SuggestionIcon kind={suggestion.kind} /></span>
        <p className="rd-eyebrow">{t(index === 0 ? (showsCareers ? 'goalCheck.bestMatch' : 'goalCheck.strongInAnswers') : 'goalCheck.alsoFits')}</p>
        <h2>{suggestion.title}</h2>
        <p>{suggestion.subtitle}</p>
      </section>)}
    </div>}
    {hasSuggestions && <button type="button" className="rd-checkpoint-unsure" onClick={onContinue}>
      <span><strong>{t('goalCheck.dontKnowYet')}</strong><span>{t('goalCheck.dontKnowBody')}</span></span>
      <ArrowRight size={20} aria-hidden="true" />
    </button>}
  </JourneyCheckpoint>;
}

export default function GoalCheckPage() {
  const { hasReport, showsCareers, suggestions, handleContinue } = useGoalCheck();
  if (!hasReport) return <Navigate to="/results" replace />;
  return <GoalCheckView showsCareers={showsCareers} suggestions={suggestions} onContinue={handleContinue} />;
}
