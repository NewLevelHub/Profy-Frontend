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
      />
    </div>
  );
}
