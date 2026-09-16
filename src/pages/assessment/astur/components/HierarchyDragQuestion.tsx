import { GripVertical } from 'lucide-react';
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
  onChange: (order: string[]) => void;
}

function SortableConcept({ concept, position }: { concept: string; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: concept });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: 'none', opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-[14px] border border-default bg-page px-4 py-2.5 cursor-grab active:cursor-grabbing"
      role="button"
      tabIndex={0}
      aria-label={`${concept}, позиция ${position + 1}`}
    >
      <span className="w-6 h-6 flex-shrink-0 rounded-full bg-raised text-mono-xs flex items-center justify-center text-secondary">
        {position + 1}
      </span>
      <span className="flex-1 text-body-sm text-primary">{concept}</span>
      <GripVertical size={16} className="text-muted flex-shrink-0" aria-hidden />
    </div>
  );
}

/** Субтест «Логические схемы» — расставить понятия от общего к частному
 *  перетаскиванием (dnd-kit, уже используется в проекте — TripletRanking.tsx). */
export function HierarchyDragQuestion({ index, value, onChange }: HierarchyDragQuestionProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-md text-primary font-semibold">
        {index}. Расставьте от самого общего к самому частному
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <div className={cn('flex flex-col gap-1.5')}>
            {value.map((concept, position) => (
              <SortableConcept key={concept} concept={concept} position={position} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
