import { Input } from '@/shared/ui/Input';

interface OpenTextQuestionProps {
  index: number;
  pair: [string, string];
  value: string;
  onChange: (value: string) => void;
}

/** Субтест «Обобщение» — вписать одно слово/словосочетание, обобщающее пару понятий. */
export function OpenTextQuestion({ index, pair, value, onChange }: OpenTextQuestionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-md text-primary font-semibold">
        {index}. {pair[0]}, {pair[1]} — ?
      </p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Обобщающее слово или словосочетание"
      />
    </div>
  );
}
