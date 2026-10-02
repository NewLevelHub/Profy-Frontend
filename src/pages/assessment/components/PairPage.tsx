import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import type { QuestionPair, QuestionPairOption } from '@/shared/types';
import { useFollowActiveItem } from '../hooks/useFollowActiveItem';

interface PairPageProps {
  pairs: QuestionPair[];
  /** pair_index → id of the picked option. */
  answers: Record<number, string>;
  onSelect: (pairIndex: number, questionId: string) => void;
  onSubmit: () => void;
  /** Blocks input immediately on click — a save is in flight, however fast. */
  saving: boolean;
  /** Delayed mirror of `saving` that drives the spinner — see LikertPage. */
  savingVisible: boolean;
}

/* Ten cards on one page: a picked card has to read as picked at a glance,
   and a pair that's done has to step back, so the eye lands on the pair
   still waiting. Picked — brand tint + check; its partner — dimmed (full
   again on hover/focus, the pick can still be changed). */
function PairOption({
  option,
  isSelected,
  isPartnerPicked,
  onSelect,
}: {
  option: QuestionPairOption;
  isSelected: boolean;
  isPartnerPicked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => {
        playClick('soft');
        onSelect();
      }}
      className={cn(
        // min-h fits two lines of text: one- and two-line pairs share a
        // height, only a genuinely long option makes its row taller.
        'relative flex min-h-25 flex-col items-center justify-center gap-3 rounded-[18px] border-2 px-3 py-5 sm:px-5 sm:py-6',
        'transition-[border-color,background-color,opacity] duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
        isSelected
          ? 'border-brand bg-[color-mix(in_srgb,var(--brand)_12%,var(--bg-surface))]'
          : 'border-default bg-surface hover:border-brand',
        isPartnerPicked && 'opacity-60 hover:opacity-100 focus-visible:opacity-100',
      )}
    >
      {isSelected && (
        <span
          aria-hidden="true"
          className="likert-check-pop absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full"
          style={{ background: 'var(--brand)' }}
        >
          <Check size={14} strokeWidth={3} color="var(--text-on-brand)" />
        </span>
      )}
      {option.icon && <span style={{ fontSize: 44, lineHeight: 1 }}>{option.icon}</span>}
      <span className="font-semibold text-primary text-center text-body-md">{option.text}</span>
    </button>
  );
}

/** A page of forced-choice pairs ("Что тебе ближе?"), sent together on
 *  "Далее" — the pair counterpart of LikertPage, same card and rhythm. */
export function PairPage({ pairs, answers, onSelect, onSubmit, saving, savingVisible }: PairPageProps) {
  const { t } = useTranslation('assessment');
  const { t: tCommon } = useTranslation('common');
  const allAnswered = pairs.every(pair => answers[pair.pair_index] !== undefined);
  const activePair = pairs.find(pair => answers[pair.pair_index] === undefined) ?? null;
  const itemRef = useFollowActiveItem(activePair ? String(activePair.pair_index) : null, 'reveal');

  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-8 !p-6 sm:!p-8">
        {/* Semibold like LikertPage's question text — the stock medium read
            lighter than the semibold answer cards under it. */}
        <Heading level="display-sm" as="h2" className="text-primary text-center font-semibold">
          {t('format.pickCloser')}
        </Heading>

        {/* Phones drop the "или" column, so the pairs are told apart by
            spacing alone: wide between pairs, tight inside one. */}
        <div className="flex flex-col gap-8 sm:gap-6">
          {pairs.map(pair => {
            const picked = answers[pair.pair_index];
            return (
              <div key={pair.pair_index} ref={itemRef(String(pair.pair_index))} className="flex flex-col gap-3 scroll-mt-28 scroll-mb-6">
                {pair.frame && (
                  <p className="font-semibold text-secondary text-center text-body-sm">{pair.frame}</p>
                )}
                <div
                  role="group"
                  aria-label={pair.frame ?? t('format.pickCloser')}
                  className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3"
                >
                  <PairOption
                    option={pair.option_a}
                    isSelected={picked === pair.option_a.id}
                    isPartnerPicked={picked === pair.option_b.id}
                    onSelect={() => onSelect(pair.pair_index, pair.option_a.id)}
                  />
                  <span aria-hidden="true" className="hidden sm:flex items-center text-caption font-semibold text-muted">
                    {t('format.or')}
                  </span>
                  <PairOption
                    option={pair.option_b}
                    isSelected={picked === pair.option_b.id}
                    isPartnerPicked={picked === pair.option_a.id}
                    onSelect={() => onSelect(pair.pair_index, pair.option_b.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={onSubmit}
          disabled={!allAnswered || saving}
          isLoading={savingVisible}
          size="lg"
          className="w-full max-w-[560px] mx-auto rounded-pill text-body-lg font-extrabold"
          style={{ height: 60 }}
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
