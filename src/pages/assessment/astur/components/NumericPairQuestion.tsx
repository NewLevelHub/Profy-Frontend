import { useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/Input';

interface NumericPairQuestionProps {
  index: number;
  sequence: number[];
  value: [string, string];
  onChange: (value: [string, string]) => void;
}

/** Marks the first field of every numeric pair, so Enter in a second field
 *  can move on to the next item without knowing about its neighbours. */
const FIRST_FIELD_ATTR = 'data-astur-numeric-first';

/** Enter moves 1st → 2nd field → next item's 1st field; it never submits
 *  the subtest (PRO-427 §11). An empty field stays empty — never 0. */
export function NumericPairQuestion({ index, sequence, value, onChange }: NumericPairQuestionProps) {
  const { t } = useTranslation('assessment');
  const secondRef = useRef<HTMLInputElement>(null);

  function onFirstKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    secondRef.current?.focus();
  }

  function onSecondKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const firsts = Array.from(document.querySelectorAll<HTMLInputElement>(`[${FIRST_FIELD_ATTR}]`));
    const next = firsts.find((el) => el.compareDocumentPosition(event.currentTarget) & Node.DOCUMENT_POSITION_PRECEDING);
    if (next) next.focus();
    else event.currentTarget.blur();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-md text-primary font-semibold">
        {index}. {sequence.join(', ')}, …, …
      </p>
      <div className="flex items-center gap-3 max-w-xs">
        <Input
          type="number"
          inputMode="numeric"
          step={1}
          value={value[0]}
          onChange={(e) => onChange([e.target.value, value[1]])}
          onKeyDown={onFirstKey}
          enterKeyHint="next"
          placeholder={t('astur.numericPairFirst')}
          {...{ [FIRST_FIELD_ATTR]: '' }}
        />
        <Input
          ref={secondRef}
          type="number"
          inputMode="numeric"
          step={1}
          value={value[1]}
          onChange={(e) => onChange([value[0], e.target.value])}
          onKeyDown={onSecondKey}
          enterKeyHint="next"
          placeholder={t('astur.numericPairSecond')}
        />
      </div>
    </div>
  );
}
