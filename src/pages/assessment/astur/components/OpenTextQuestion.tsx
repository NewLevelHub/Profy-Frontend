import { Input } from '@/shared/ui/Input';
import { useTranslation } from 'react-i18next';

interface OpenTextQuestionProps {
  index: number;
  pair: [string, string];
  value: string;
  onChange: (value: string) => void;
}

export function OpenTextQuestion({ index, pair, value, onChange }: OpenTextQuestionProps) {
  const { t } = useTranslation('assessment');
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-md text-primary font-semibold">
        {index}. {pair[0]}, {pair[1]} — ?
      </p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('astur.generalizationPlaceholder')}
        // Открытый ответ — короткая фраза, а не личные данные, так что
        // включаем обычную мобильную клавиатуру с предиктивным набором
        // (T9-стиль) и автокоррекцией/подсказками слов вместо более
        // строгого набора без подсказок, который некоторые UI используют
        // по умолчанию для полей ввода в тестах.
        autoComplete="on"
        name={`astur-generalization-${index}`}
        inputMode="text"
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        enterKeyHint="next"
      />
    </div>
  );
}
