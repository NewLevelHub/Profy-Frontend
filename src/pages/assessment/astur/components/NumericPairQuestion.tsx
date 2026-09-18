import { Input } from '@/shared/ui/Input';

interface NumericPairQuestionProps {
  index: number;
  sequence: number[];
  value: [string, string];
  onChange: (value: [string, string]) => void;
}

/** Субтест «Числовые ряды» — продолжить ряд двумя числами. */
export function NumericPairQuestion({ index, sequence, value, onChange }: NumericPairQuestionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-md text-primary font-semibold">
        {index}. {sequence.join(', ')}, …, …
      </p>
      <div className="flex items-center gap-3 max-w-xs">
        <Input
          type="number"
          inputMode="numeric"
          value={value[0]}
          onChange={(e) => onChange([e.target.value, value[1]])}
          placeholder="1-е число"
        />
        <Input
          type="number"
          inputMode="numeric"
          value={value[1]}
          onChange={(e) => onChange([value[0], e.target.value])}
          placeholder="2-е число"
        />
      </div>
    </div>
  );
}
