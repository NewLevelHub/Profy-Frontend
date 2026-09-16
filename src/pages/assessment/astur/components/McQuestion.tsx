import { cn } from '@/shared/lib/cn';

interface McQuestionProps {
  index: number;
  prompt: string;
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function McQuestion({ index, prompt, options, value, onChange }: McQuestionProps) {
  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
      <legend className="text-body-md text-primary font-semibold">
        {index}. {prompt}
      </legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={cn(
                'flex items-center gap-3 rounded-[14px] border px-4 py-2.5 cursor-pointer transition-colors',
                selected ? 'border-brand bg-brand-subtle' : 'border-default hover:border-strong',
              )}
            >
              <input
                type="radio"
                name={`mc-${index}`}
                checked={selected}
                onChange={() => onChange(option)}
                className="accent-[var(--brand)]"
              />
              <span className="text-body-sm text-primary">{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
