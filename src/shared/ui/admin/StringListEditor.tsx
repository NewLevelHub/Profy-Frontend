import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_BUTTON, ADMIN_INPUT, ADMIN_META, ADMIN_NUM, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';

interface StringListEditorProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /**
   * True when position carries meaning (a direction's "Первые шаги" is a
   * sequence, its "Профессии" is a set) — shows reorder controls.
   */
  ordered?: boolean;
  /**
   * What an empty list means for the product. Без неё пустой список выглядит
   * как поле, которое просто ещё не трогали, и ничем не отличается от
   * заполненного «по замыслу» — а у направлений именно пустое поле и есть
   * содержательный факт.
   */
  emptyNote?: string;
}

/**
 * Editable list of strings — aliases, exams, professions, first steps.
 *
 * Two gaps fixed in PRO-242: an existing entry could not be edited (only
 * deleted and retyped from scratch, losing a long line to fix one letter), and
 * entries could not be reordered even where order is the content — the
 * direction's "Первые шаги" is a numbered plan a student follows.
 *
 * Rows rather than chips: these hold sentences, and a chip row wrapped a
 * "Поговорить с преподавателем биологии о профильных классах" across three
 * lines with the delete button orphaned at the end.
 */
export function StringListEditor({ label, values, onChange, placeholder, ordered, emptyNote }: StringListEditorProps) {
  const [draft, setDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  }

  function commitEdit(index: number) {
    const trimmed = editingValue.trim();
    // An emptied row is a delete — the alternative is silently keeping the old
    // value, which reads as the edit having failed.
    onChange(trimmed ? values.map((v, i) => (i === index ? trimmed : v)) : values.filter((_, i) => i !== index));
    setEditingIndex(null);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {label && <p className={cn(MONO_LABEL, 'text-muted mb-1.5')}>{label}</p>}

      {values.length === 0 && emptyNote && <p className={cn(ADMIN_META, 'mb-2')}>{emptyNote}</p>}

      {values.length > 0 && (
        <ul className="flex flex-col gap-1 mb-2 border border-default rounded-[14px] p-1 bg-page">
          {values.map((value, index) => (
            <li key={`${value}-${index}`} className="flex items-center gap-1.5 group">
              {ordered && (
                <span className={cn(ADMIN_NUM, 'text-muted w-5 text-right flex-shrink-0')}>{index + 1}</span>
              )}

              {editingIndex === index ? (
                <>
                  <input
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitEdit(index);
                      }
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                    className={cn(ADMIN_INPUT, 'flex-1 min-w-0 py-1')}
                  />
                  <button
                    type="button"
                    onClick={() => commitEdit(index)}
                    className={cn(ADMIN_BUTTON, 'px-1.5')}
                    aria-label="Сохранить строку"
                  >
                    <Check size={12} />
                  </button>
                </>
              ) : (
                <>
                  <span className={cn(ADMIN_TEXT, 'flex-1 min-w-0 text-primary px-1.5 py-1 break-words')}>
                    {value}
                  </span>

                  {ordered && (
                    <span className="flex items-center">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-muted hover:text-primary disabled:opacity-25 transition-colors"
                        aria-label={`Поднять «${value}»`}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === values.length - 1}
                        className="p-1 text-muted hover:text-primary disabled:opacity-25 transition-colors"
                        aria-label={`Опустить «${value}»`}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(index);
                      setEditingValue(value);
                    }}
                    className="p-1 text-muted hover:text-primary transition-colors"
                    aria-label={`Изменить «${value}»`}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(values.filter((_, i) => i !== index))}
                    className="p-1 text-muted hover:text-danger transition-colors"
                    aria-label={`Убрать «${value}»`}
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? 'Добавить и нажать Enter'}
          className={cn(ADMIN_INPUT, 'flex-1 min-w-0 max-w-[360px] py-1.5')}
        />
        <button type="button" onClick={add} disabled={!draft.trim()} className={cn(ADMIN_BUTTON, ADMIN_TEXT)}>
          <Plus size={12} />
          Добавить
        </button>
      </div>
    </div>
  );
}
