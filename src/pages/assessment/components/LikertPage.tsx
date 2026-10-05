import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { LikertScale } from '@/shared/ui';
import { playClick } from '@/shared/lib/sounds';
import {
  LIKERT_SCALE,
  BIGFIVE_LIKERT_SCALE,
  YES_NO_SCALE,
  ABILITIES_LIKERT_SCALE,
  KONDASH_ANXIETY_SCALE,
} from '@/shared/config/constants';
import type { Instrument, Question } from '@/shared/types';
import { useFollowActiveItem } from '../hooks/useFollowActiveItem';

/** PRO-338 Ф0.5: eysenck/elers/boyko_empathy are Да/Нет (binary) instruments
 * reusing this same Likert engine — 2 options instead of 5, everything else
 * (big_five's own 5-point wording, and the plain 5-point default) unchanged.
 * `boyko_empathy` was missing from this branch until Ф1.10 — its content
 * bank (Ф1.9) shipped without wiring the answer scale, so it silently fell
 * through to the 5-point default; fixed here alongside adding
 * kondash_anxiety's own 0-4 scale. */
function scaleForInstrument(instrument: Instrument) {
  if (instrument === 'big_five') return BIGFIVE_LIKERT_SCALE;
  if (instrument === 'eysenck' || instrument === 'elers' || instrument === 'boyko_empathy') return YES_NO_SCALE;
  if (instrument === 'professional_types_abilities') return ABILITIES_LIKERT_SCALE;
  if (instrument === 'kondash_anxiety') return KONDASH_ANXIETY_SCALE;
  return LIKERT_SCALE;
}

/** PRO-435: the generic "Совсем не моё…Точно моё" poles don't say what to
 * rate on instruments that measure a degree of something — abilities are
 * "выражено", Kondash asks how much a situation "тревожит". Returns the
 * i18n keys of the pole pair, or `undefined` to keep the generic pair. */
function polesForInstrument(instrument: Instrument) {
  if (instrument === 'professional_types_abilities') {
    return { left: 'scale.poleLeftAbilities', right: 'scale.poleRightAbilities' } as const;
  }
  if (instrument === 'kondash_anxiety') {
    return { left: 'scale.poleLeftAnxiety', right: 'scale.poleRightAnxiety' } as const;
  }
  return undefined;
}

interface LikertPageProps {
  questions: Question[];
  answers: Record<string, number>;
  onSelect: (questionId: string, value: number) => void;
  onSubmit: () => void;
  /** Blocks input immediately on click — a save is in flight, however fast. */
  saving: boolean;
  /**
   * Delayed mirror of `saving` (see useDelayedFlag) — only turns true once
   * the save has actually taken a while. Drives the spinner, separately from
   * `saving`, so a normal fast save just presses and moves on instead of
   * flashing a loading state no human could read in time.
   */
  savingVisible: boolean;
}

export function LikertPage({ questions, answers, onSelect, onSubmit, saving, savingVisible }: LikertPageProps) {
  const { t } = useTranslation('common');
  const { t: tAssessment } = useTranslation('assessment');
  const allAnswered = questions.every(question => answers[question.id] !== undefined);

  const activeQuestion = questions.find(question => answers[question.id] === undefined) ?? null;
  const itemRef = useFollowActiveItem(activeQuestion?.id ?? null);

  return (
    <div className="rd-assessment-battery" aria-busy={saving}>
      <h1 className="sr-only">{tAssessment('rail.sectionDiagnostic')}</h1>
      {questions.map((question, index) => {
        const poles = polesForInstrument(question.instrument);
        return (
          <div
            key={question.id}
            ref={itemRef(question.id)}
            className="rd-assessment-question"
            data-answered={answers[question.id] !== undefined}
          >
            <div className="rd-assessment-question-heading">
              <span className="rd-assessment-question-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h2>{question.text}</h2>
            </div>
            <LikertScale
              ariaLabel={question.text}
              selected={answers[question.id] ?? null}
              onSelect={value => {
                playClick('soft');
                onSelect(question.id, value);
              }}
              scale={scaleForInstrument(question.instrument)}
              poleLeft={poles ? tAssessment(poles.left) : undefined}
              poleRight={poles ? tAssessment(poles.right) : undefined}
            />
          </div>
        );
      })}

      <Button
        onClick={onSubmit}
        disabled={!allAnswered || saving}
        isLoading={savingVisible}
        size="lg"
        className="rd-assessment-next"
      >
        {t('next')}
      </Button>
    </div>
  );
}
