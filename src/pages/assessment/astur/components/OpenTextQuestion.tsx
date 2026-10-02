import { Input } from '@/shared/ui/Input';
import { useTranslation } from 'react-i18next';

// Mirrors the backend's MAX_OPEN_TEXT_LENGTH (app/services/astur/runs.py).
// An answer is a word or a short phrase; anything longer made the server
// reject the whole subtest — including the automatic submit on timer expiry.
const OPEN_TEXT_MAX_LENGTH = 200;

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
        maxLength={OPEN_TEXT_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('astur.generalizationPlaceholder')}
        // Keyboard prediction/autocorrect stay on (a short phrase typed on a
        // phone), but the browser's own form history is off: on a later attempt it
        // would offer the student their previous answers (PRO-427 §16).
        autoComplete="off"
        inputMode="text"
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        enterKeyHint="next"
      />
    </div>
  );
}
