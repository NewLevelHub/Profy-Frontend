import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';

interface ReviewStringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  addLabel: string;
}

/** A list of short phrases — "Что тебя драйвит". */
export function ReviewStringListEditor({ items, onChange, disabled, addLabel }: ReviewStringListEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className={cn(ADMIN_META, 'm-0')}>Пунктов нет</p>
      ) : (
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {items.map((item, index) => (
            <li key={index} className="flex gap-2 items-start">
              <textarea
                value={item}
                onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
                disabled={disabled}
                rows={2}
                aria-label={`Пункт ${index + 1}`}
                className={cn(ADMIN_TEXTAREA, 'min-h-[56px]')}
              />
              {!disabled && (
                <button
                  type="button"
                  className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
                  aria-label="Удалить пункт"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <div>
          <button type="button" className={ADMIN_BUTTON} onClick={() => onChange([...items, ''])}>
            <Plus size={13} />
            {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}
