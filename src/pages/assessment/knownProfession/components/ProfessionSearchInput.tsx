import { Search, X } from 'lucide-react';

interface ProfessionSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProfessionSearchInput({
  value,
  onChange,
  placeholder = 'Найди профессию или специальность',
}: ProfessionSearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
      />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Поиск профессии"
        className="w-full pl-11 pr-10 py-3 border-[1.5px] border-default bg-surface text-primary font-semibold placeholder:text-secondary placeholder:font-semibold focus:outline-none focus:border-[#C4B5FD] transition-colors"
        style={{ borderRadius: 16, fontSize: 15 }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
