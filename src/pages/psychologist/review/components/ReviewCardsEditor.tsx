import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_BUTTON, ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import type { PsychologistReviewCard } from '@/shared/types';

interface ReviewCardsEditorProps {
  cards: PsychologistReviewCard[];
  onChange: (cards: PsychologistReviewCard[]) => void;
  disabled?: boolean;
  addLabel: string;
  /** Genitive name of one card ("сильной стороны") — both sections on the
   *  page use this editor, so the field labels must say which one is which. */
  itemName: string;
  /** Strength cards (PRO-432): show what each card is grounded in. */
  withStrengthBasis?: boolean;
}

/** Title + description cards — "Сильные стороны", "Стиль мышления". */
export function ReviewCardsEditor({
  cards,
  onChange,
  disabled,
  addLabel,
  itemName,
  withStrengthBasis = false,
}: ReviewCardsEditorProps) {
  const { t } = useTranslation('psychologist');
  function patchCard(index: number, patch: Partial<PsychologistReviewCard>) {
    onChange(cards.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.length === 0 ? (
        <p className={cn(ADMIN_META, 'm-0')}>{t('reportEditor.cards.none')}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
          {cards.map((card, index) => (
            <li key={index} className="py-3 flex gap-2 items-start">
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {withStrengthBasis && card.basis && (
                  <div>
                    <AdminBadge
                      tone="quiet"
                      title={t('reportEditor.cards.basisTitle', { basis: t(`reportEditor.cards.basis.${card.basis}`) })}
                    >
                      {t(`reportEditor.cards.basis.${card.basis}`)}
                    </AdminBadge>
                  </div>
                )}
                <input
                  value={card.title}
                  onChange={(e) => patchCard(index, { title: e.target.value })}
                  disabled={disabled}
                  placeholder={t('reportEditor.cards.title')}
                  aria-label={t('reportEditor.cards.titleAria', { item: itemName })}
                  className={cn(ADMIN_INPUT, 'font-semibold')}
                />
                <textarea
                  value={card.description}
                  onChange={(e) => patchCard(index, { description: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  placeholder={t('reportEditor.cards.description')}
                  aria-label={t('reportEditor.cards.descriptionAria', { item: itemName })}
                  className={ADMIN_TEXTAREA}
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
                  aria-label={t('reportEditor.cards.remove', { title: card.title.trim() || itemName })}
                  onClick={() => onChange(cards.filter((_, i) => i !== index))}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <div>
          <button
            type="button"
            className={ADMIN_BUTTON}
            onClick={() => onChange([...cards, { title: '', description: '' }])}
          >
            <Plus size={13} />
            {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}
