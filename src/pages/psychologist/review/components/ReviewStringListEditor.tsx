import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Mono, Text } from '@/shared/ui/typography';
import { REVIEW_LINE_INPUT } from './reviewFieldStyles';

interface ReviewStringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  addLabel: string;
}

/** A list of short phrases — "Что тебя драйвит". */
export function ReviewStringListEditor({ items, onChange, disabled, addLabel }: ReviewStringListEditorProps) {
  const { t } = useTranslation('psychologist');
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <Text variant="body-sm" className="text-muted m-0">
          {t('review.list.empty')}
        </Text>
      ) : (
        <ol className="flex flex-col gap-1 m-0 p-0 list-none">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3.5 items-center">
              <Mono variant="sm" className="text-[color:var(--dawn-deep)] w-6 flex-none">
                {String(index + 1).padStart(2, '0')}
              </Mono>
              <input
                value={item}
                onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
                disabled={disabled}
                aria-label={t('review.list.itemAria', { number: index + 1 })}
                className={REVIEW_LINE_INPUT}
              />
              {!disabled && (
                <button
                  type="button"
                  className="w-10 h-10 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 flex-none inline-flex items-center justify-center rounded-[8px] border border-default text-[color:var(--clay)] hover:border-[color:var(--clay)] transition-colors"
                  aria-label={t('review.list.removeAria', { number: index + 1 })}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
      {!disabled && (
        <Button
          type="button"
          variant="text"
          size="sm"
          muteSound
          className="min-h-10 [@media(pointer:coarse)]:min-h-11 self-start px-0 no-underline hover:underline"
          onClick={() => onChange([...items, ''])}
        >
          <Plus size={16} aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
