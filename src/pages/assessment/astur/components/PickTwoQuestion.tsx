import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';

interface PickTwoQuestionProps {
  index: number;
  words: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function PickTwoQuestion({ index, words, value, onChange }: PickTwoQuestionProps) {
  const { t } = useTranslation('assessment');
  function toggle(word: string) {
    if (value.includes(word)) {
      onChange(value.filter((w) => w !== word));
      return;
    }
    if (value.length >= 2) return;
    onChange([...value, word]);
  }

  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
      <legend className="text-body-md text-primary font-semibold">
        {index}. {t('astur.pickTwoPrompt')}
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {words.map((word) => {
          const selected = value.includes(word);
          const disabled = !selected && value.length >= 2;
          return (
            <button
              key={word}
              type="button"
              disabled={disabled}
              onClick={() => toggle(word)}
              className={cn(
                'rounded-[14px] border px-3 py-3 text-body-md transition-colors text-center',
                selected ? 'border-brand bg-brand-subtle text-primary' : 'border-default text-secondary hover:border-strong',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {word}
            </button>
          );
        })}
      </div>
      <span className="text-body-sm text-muted">{t('astur.selectedCount', { current: value.length, total: 2 })}</span>
    </fieldset>
  );
}
