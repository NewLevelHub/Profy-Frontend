import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Mono, Text } from '@/shared/ui/typography';
import type { PsychologistReviewCard } from '@/shared/types';
import { REVIEW_LINE_INPUT, REVIEW_TEXTAREA } from './reviewFieldStyles';

interface ReviewCardsEditorProps {
  cards: PsychologistReviewCard[];
  onChange: (cards: PsychologistReviewCard[]) => void;
  disabled?: boolean;
  addLabel: string;
  /** Section name for the fields' accessible labels — two sections use this editor. */
  section: string;
  /** Strength cards (PRO-432): show what each card is grounded in and ask
   *  for the concrete answer or task result behind it. */
  withStrengthBasis?: boolean;
}

/** Title + description cards — "Сильные стороны", "Стиль мышления". */
export function ReviewCardsEditor({
  cards,
  onChange,
  disabled,
  addLabel,
  section,
  withStrengthBasis = false,
}: ReviewCardsEditorProps) {
  const { t } = useTranslation('psychologist');

  function patchCard(index: number, patch: Partial<PsychologistReviewCard>) {
    onChange(cards.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  }

  return (
    <div className="flex flex-col gap-5">
      {cards.length === 0 ? (
        <Text variant="body-sm" className="text-muted m-0">
          {t('review.cards.empty')}
        </Text>
      ) : (
        <ol className="flex flex-col gap-5 m-0 p-0 list-none">
          {cards.map((card, index) => {
            const number = index + 1;
            return (
              <li key={index} className="flex gap-3.5 items-start">
                <Mono variant="sm" className="text-[color:var(--dawn-deep)] pt-2.5 w-6 flex-none">
                  {String(number).padStart(2, '0')}
                </Mono>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {withStrengthBasis && card.basis && (
                    <span
                      className="self-start"
                      title={t('review.cards.basisTitle', { basis: t(`review.cards.basis.${card.basis}`) })}
                    >
                      <Mono variant="label" className="text-muted">
                        {t(`review.cards.basis.${card.basis}`)}
                      </Mono>
                    </span>
                  )}
                  <input
                    value={card.title}
                    onChange={(e) => patchCard(index, { title: e.target.value })}
                    disabled={disabled}
                    placeholder={t('review.cards.titlePlaceholder')}
                    aria-label={t('review.cards.titleAria', { section, number })}
                    className={cn(REVIEW_LINE_INPUT, 'font-semibold text-body-lg')}
                  />
                  <textarea
                    value={card.description}
                    onChange={(e) => patchCard(index, { description: e.target.value })}
                    disabled={disabled}
                    rows={2}
                    placeholder={t(
                      withStrengthBasis
                        ? 'review.cards.strengthExplanationPlaceholder'
                        : 'review.cards.descriptionPlaceholder',
                    )}
                    aria-label={t(
                      withStrengthBasis ? 'review.cards.strengthExplanationAria' : 'review.cards.descriptionAria',
                      { section, number },
                    )}
                    className={REVIEW_TEXTAREA}
                  />
                </div>
                {!disabled && (
                  <button
                    type="button"
                    className="mt-1.5 w-10 h-10 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 flex-none inline-flex items-center justify-center rounded-[8px] border border-default text-[color:var(--clay)] hover:border-[color:var(--clay)] transition-colors"
                    aria-label={t('review.cards.removeAria', { title: card.title.trim() || section })}
                    onClick={() => onChange(cards.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {!disabled && (
        <Button
          type="button"
          variant="text"
          size="sm"
          muteSound
          className="min-h-10 [@media(pointer:coarse)]:min-h-11 self-start px-0 no-underline hover:underline"
          onClick={() => onChange([...cards, { title: '', description: '' }])}
        >
          <Plus size={16} aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
