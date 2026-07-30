import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import type { KnownProfessionQuizState } from '@/app/routes';
import type { AgeGroup, DirectionBrief } from '@/shared/types';

interface FilteredProfession {
  specialty: DirectionBrief;
  matchedProfession: string | null;
}

function labelFor({ specialty, matchedProfession }: FilteredProfession, ageGroup: AgeGroup): string {
  const label =
    ageGroup === 'junior' && specialty.label_junior ? specialty.label_junior : specialty.name;
  return matchedProfession ?? label;
}

/** Two-step "pick, then confirm" selection for the profession list — matches
 * the mockup's CTA bar that stays disabled until a profession is picked. */
export function useProfessionSelection(
  sphereSlug: string | undefined,
  sphereName: string | undefined,
  filteredProfessions: FilteredProfession[],
  ageGroup: AgeGroup,
) {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selected = filteredProfessions.find(p => p.specialty.slug === selectedSlug) ?? null;

  const hint = selected
    ? `Дальше — короткий тест: проверим, совпадает ли «${labelFor(selected, ageGroup)}» с твоими интересами.`
    : 'Выбери профессию, чтобы продолжить';

  function toggle(slug: string) {
    setSelectedSlug(current => (current === slug ? null : slug));
  }

  function confirm() {
    if (!selected || !sphereSlug) return;
    navigate(ROUTES.knownProfessionQuiz(sphereSlug, selected.specialty.slug), {
      state: { professionName: labelFor(selected, ageGroup), sphereName } satisfies KnownProfessionQuizState,
    });
  }

  return { selectedSlug, toggle, ready: selected !== null, hint, confirm };
}
