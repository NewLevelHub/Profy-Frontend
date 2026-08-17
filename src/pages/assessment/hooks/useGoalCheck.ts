import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { InterestMapItem, StudentCareer } from '@/shared/types';

export interface GoalSuggestion {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
}

// The "not sure yet" interstitial only makes sense for students whose
// stated goal was uncertain — the data model has no separate "uncertain"
// flag (AssessmentGoal is just 'explore' | 'profession' | 'university'),
// so 'explore' is the real, stored signal for "wants to explore rather
// than chase one already-known target" (both explore-flavored cards on
// GoalSelectionPage — "Понять себя" and "Пока не знаю" — write this same
// value). We don't invent a second signal that isn't actually persisted.
export function shouldShowGoalCheck(goal: string | null): boolean {
  return goal === 'explore';
}

// Only 2 real suggestion slots — the design's 3rd card is the fixed
// "ЕСЛИ НИ ТО, НИ ДРУГОЕ" (show the report anyway) option, not a 3rd
// diagnostic match. See GoalCheckPage.
function buildRiasecSuggestions(careers: StudentCareer[]): GoalSuggestion[] {
  return [...careers]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 2)
    .map(c => ({
      key: c.slug,
      icon: '🎯',
      title: c.name,
      subtitle: c.why,
    }));
}

function buildMiSuggestions(items: InterestMapItem[]): GoalSuggestion[] {
  // Prefer clearly-expressed interests; only reach into medium-level ones
  // if there aren't at least 2 high ones — still real diagnostic data,
  // just a lower confidence tier, never a fabricated default.
  const high = items.filter(i => i.level === 'high');
  const pool = high.length >= 2 ? high : [...high, ...items.filter(i => i.level === 'medium')];
  return pool.slice(0, 2).map(i => ({
    key: i.code,
    icon: '🧭',
    title: i.sphere,
    subtitle: 'Ярко проявилось в твоих ответах',
  }));
}

export function useGoalCheck() {
  const navigate = useNavigate();
  const report = useResultStore(s => s.report);
  const goal = useAssessmentStore(s => s.goal);

  const isJunior = report?.interest_instrument === 'mi';

  const suggestions = useMemo<GoalSuggestion[]>(() => {
    if (!report) return [];
    return isJunior
      ? buildMiSuggestions(report.interest_map)
      : buildRiasecSuggestions(report.careers);
  }, [report, isJunior]);

  function handleContinue() {
    navigate('/results', { replace: true });
  }

  return {
    hasReport: report !== null,
    goal,
    isJunior,
    suggestions,
    handleContinue,
  };
}
