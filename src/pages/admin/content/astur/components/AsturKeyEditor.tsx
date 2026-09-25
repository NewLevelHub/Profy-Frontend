import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import type { AsturBankItem, AsturBankLocalizedList, AsturBankLocalizedText, AsturScoringMethod } from '@/shared/types';

interface AsturKeyEditorProps {
  method: AsturScoringMethod;
  item: AsturBankItem;
  onChange: (item: AsturBankItem) => void;
}

const DYNAMIC_LABELS: Record<string, string> = {
  day_of_week: 'Ключ зависит от дня недели в момент ответа',
  own_name: 'Ключ зависит от первой буквы имени ученика',
};

/** The answer key, edited by option POSITION so RU and KK always point at
 *  the same option — the server rejects a key that isn't among the options
 *  or differs between languages anyway. */
export function AsturKeyEditor({ method, item, onChange }: AsturKeyEditorProps) {
  switch (method) {
    case 'single_choice':
    case 'quick_instruction': {
      if (item.dynamic) {
        return <KeyNote>{DYNAMIC_LABELS[item.dynamic] ?? item.dynamic}</KeyNote>;
      }
      const options = item.options ?? { ru: [], kk: [] };
      const answer = item.answer as AsturBankLocalizedText | undefined;
      const selected = answer ? options.ru.indexOf(answer.ru) : -1;
      return (
        <KeyBlock label="Правильный ответ">
          <div role="radiogroup" className="flex flex-col gap-1.5">
            {options.ru.map((option, i) => (
              <label key={i} className={cn(ADMIN_TEXT, 'flex items-center gap-2 cursor-pointer')}>
                <input
                  type="radio"
                  name={`key-${item.item_id}`}
                  checked={selected === i}
                  onChange={() => onChange({ ...item, answer: { ru: options.ru[i], kk: options.kk[i] ?? '' } })}
                />
                <span>{option}</span>
                <span className={ADMIN_META}>/ {options.kk[i]}</span>
              </label>
            ))}
          </div>
        </KeyBlock>
      );
    }
    case 'pick_pair': {
      const words = item.words ?? { ru: [], kk: [] };
      const answer = (item.answer as AsturBankLocalizedList | undefined) ?? { ru: [], kk: [] };
      const selected = new Set(answer.ru.map((w) => words.ru.indexOf(w)).filter((i) => i >= 0));
      const toggle = (i: number) => {
        const next = new Set(selected);
        if (next.has(i)) next.delete(i);
        else if (next.size < 2) next.add(i);
        const ordered = [...next].sort((a, b) => a - b);
        onChange({ ...item, answer: { ru: ordered.map((j) => words.ru[j]), kk: ordered.map((j) => words.kk[j] ?? '') } });
      };
      return (
        <KeyBlock label="Правильная пара (ровно 2 слова)">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {words.ru.map((word, i) => (
              <label key={i} className={cn(ADMIN_TEXT, 'flex items-center gap-2 cursor-pointer')}>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} />
                <span>{word}</span>
                <span className={ADMIN_META}>/ {words.kk[i]}</span>
              </label>
            ))}
          </div>
        </KeyBlock>
      );
    }
    case 'open_text_tiers': {
      const tier = (key: 'score_2' | 'score_1') => item[key] ?? { ru: [], kk: [] };
      const setTier = (key: 'score_2' | 'score_1', lang: 'ru' | 'kk', values: string[]) =>
        onChange({ ...item, [key]: { ...tier(key), [lang]: values } });
      return (
        <KeyBlock label="Словарь ответов">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <StringListEditor label="2 балла (RU)" values={tier('score_2').ru} onChange={(v) => setTier('score_2', 'ru', v)} />
            <StringListEditor label="2 балла (KK)" values={tier('score_2').kk} onChange={(v) => setTier('score_2', 'kk', v)} />
            <StringListEditor label="1 балл (RU)" values={tier('score_1').ru} onChange={(v) => setTier('score_1', 'ru', v)} />
            <StringListEditor label="1 балл (KK)" values={tier('score_1').kk} onChange={(v) => setTier('score_1', 'kk', v)} />
          </div>
        </KeyBlock>
      );
    }
    case 'chain_links':
      return <KeyNote>Ключ — сам порядок понятий выше: от общего к частному.</KeyNote>;
    case 'number_pair': {
      const answer = (item.answer as number[] | undefined) ?? [0, 0];
      const setAt = (i: number, value: string) => {
        const next = [...answer];
        next[i] = Number(value);
        onChange({ ...item, answer: next });
      };
      return (
        <KeyBlock label="Правильное продолжение ряда">
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {[0, 1].map((i) => (
              <input
                key={i}
                type="number"
                className={ADMIN_INPUT}
                value={Number.isFinite(answer[i]) ? answer[i] : ''}
                onChange={(e) => setAt(i, e.target.value)}
                aria-label={`${i + 1}-е число`}
              />
            ))}
          </div>
        </KeyBlock>
      );
    }
  }
}

function KeyBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-[14px] border border-brand bg-[color-mix(in_srgb,var(--brand)_6%,transparent)]">
      <p className={cn(MONO_LABEL, 'text-brand m-0')}>Ключ · {label}</p>
      {children}
    </div>
  );
}

function KeyNote({ children }: { children: ReactNode }) {
  return <p className={cn(ADMIN_META, 'm-0')}>Ключ: {children}</p>;
}
