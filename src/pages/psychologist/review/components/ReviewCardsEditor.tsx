import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_BUTTON, ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import type { PsychologistReviewCard } from '@/shared/types';

interface ReviewCardsEditorProps {
  cards: PsychologistReviewCard[];
  onChange: (cards: PsychologistReviewCard[]) => void;
  disabled?: boolean;
  addLabel: string;
}

/** Title + description cards — "Сильные стороны", "Стиль мышления". */
export function ReviewCardsEditor({ cards, onChange, disabled, addLabel }: ReviewCardsEditorProps) {
  function patchCard(index: number, patch: Partial<PsychologistReviewCard>) {
    onChange(cards.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.length === 0 ? (
        <p className={cn(ADMIN_META, 'm-0')}>Карточек нет</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
          {cards.map((card, index) => (
            <li key={index} className="py-3 flex gap-2 items-start">
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                  value={card.title}
                  onChange={(e) => patchCard(index, { title: e.target.value })}
                  disabled={disabled}
                  placeholder="Заголовок"
                  aria-label="Заголовок карточки"
                  className={cn(ADMIN_INPUT, 'font-semibold')}
                />
                <textarea
                  value={card.description}
                  onChange={(e) => patchCard(index, { description: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  placeholder="Описание"
                  aria-label="Описание карточки"
                  className={ADMIN_TEXTAREA}
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
                  aria-label="Удалить карточку"
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
