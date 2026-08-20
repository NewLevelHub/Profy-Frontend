import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { InterestMapItem, ResultResponse, StrengthCard, StudentCareer } from '@/shared/types';

export interface GoalSuggestion {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
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

function buildInterestMapSuggestions(items: InterestMapItem[]): GoalSuggestion[] {
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

function buildStrengthSuggestions(cards: StrengthCard[]): GoalSuggestion[] {
  return cards.slice(0, 2).map(c => ({
    key: c.title,
    icon: '✨',
    title: c.title,
    subtitle: c.description,
  }));
}

// Profession-agnostic version of this screen — used whenever the goal isn't
// specifically "pick a profession". Draws on the parts of the report that
// describe the student themself (strengths, then interest spheres as a
// fallback), never on `careers`/job titles — those would contradict a goal
// that's about self-understanding, not career matching.
function buildSelfInsightSuggestions(report: ResultResponse): GoalSuggestion[] {
  if (report.strength_cards.length >= 2) {
    return buildStrengthSuggestions(report.strength_cards);
  }
  return buildInterestMapSuggestions(report.interest_map);
}

export function useGoalCheck() {
  const navigate = useNavigate();
  const report = useResultStore(s => s.report);
  const goal = useAssessmentStore(s => s.goal);

  const isJunior = report?.interest_instrument === 'mi';

  // Mirrors the /results goal branch (GoalBranchSection): junior students
  // and the 'explore' goal always get the self-understanding read regardless
  // of instrument — careers only surface for 'profession'/'university',
  // and only when there's actually a RIASEC career list to draw from.
  const showsCareers = !isJunior && (goal === 'profession' || goal === 'university');

  const suggestions = useMemo<GoalSuggestion[]>(() => {
    if (!report) return [];
    if (showsCareers && report.interest_instrument === 'riasec') {
      return buildRiasecSuggestions(report.careers);
    }
    return buildSelfInsightSuggestions(report);
  }, [report, showsCareers]);

  function handleContinue() {
    navigate('/results', { replace: true });
  }

  return {
    hasReport: report !== null,
    goal,
    isJunior,
    showsCareers,
    suggestions,
    handleContinue,
  };
}
