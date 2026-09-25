import { ArrowDown, ArrowUp, Check, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/cn';

interface HierarchyDragQuestionProps {
  index: number;
  /** Текущий (перемешанный или уже переставленный пользователем) порядок. */
  value: string[];
  /** The student has worked with (or explicitly accepted) this order. The
   *  served order is a shuffle, so untouched it is not an answer (PRO-427 §11). */
  confirmed: boolean;
  onChange: (order: string[]) => void;
}

interface SortableConceptProps {
  concept: string;
  position: number;
  total: number;
  onMove: (from: number, to: number) => void;
}

function SortableConcept({ concept, position, total, onMove }: SortableConceptProps) {
  const { t } = useTranslation('assessment');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: concept });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-[14px] border border-default bg-page px-4 py-3"
    >
      <span className="w-7 h-7 flex-shrink-0 rounded-full bg-raised text-body-sm font-semibold flex items-center justify-center text-secondary">
        {position + 1}
      </span>
      <span
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className="flex-1 flex items-center gap-2 text-body-md text-primary cursor-grab active:cursor-grabbing"
        role="button"
        tabIndex={0}
        aria-label={t('astur.hierarchyItemAria', { concept, position: position + 1 })}
      >
        <span className="flex-1">{concept}</span>
        <GripVertical size={16} className="text-muted flex-shrink-0" aria-hidden />
      </span>
      {/* Buttons for everyone who can't or doesn't want to drag. */}
      <button
        type="button"
        onClick={() => onMove(position, position - 1)}
        disabled={position === 0}
        className="p-1.5 rounded-lg text-secondary hover:text-primary disabled:opacity-30"
        aria-label={t('astur.moveUp', { concept })}
      >
        <ArrowUp size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(position, position + 1)}
        disabled={position === total - 1}
        className="p-1.5 rounded-lg text-secondary hover:text-primary disabled:opacity-30"
        aria-label={t('astur.moveDown', { concept })}
      >
        <ArrowDown size={16} aria-hidden />
      </button>
    </div>
  );
}

export function HierarchyDragQuestion({ index, value, confirmed, onChange }: HierarchyDragQuestionProps) {
  const { t } = useTranslation('assessment');
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    onChange(arrayMove(value, from, to));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    move(value.indexOf(String(active.id)), value.indexOf(String(over.id)));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-md text-primary font-semibold">
        {index}. {t('astur.hierarchyPrompt')}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {value.map((concept, position) => (
              <SortableConcept key={concept} concept={concept} position={position} total={value.length} onMove={move} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => onChange([...value])}
        aria-pressed={confirmed}
        className={cn(
          'self-start inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors',
          confirmed ? 'text-brand' : 'text-secondary hover:text-primary',
        )}
      >
        <Check size={14} aria-hidden />
        {confirmed ? t('astur.orderConfirmed') : t('astur.confirmOrder')}
      </button>
    </div>
  );
}
