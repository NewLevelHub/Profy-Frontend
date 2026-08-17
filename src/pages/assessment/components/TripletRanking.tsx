import React from 'react';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
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
import { playClick } from '@/shared/lib/sounds';
import type { MotivationStatement } from '@/shared/types';

interface TripletRankingProps {
  /** Exactly 3 statements, already in the current ranking order:
   *  index 0 = most, index 1 = neutral, index 2 = least. This component
   *  never reorders anything on its own — it only reports a new order via
   *  onReorder; the hook owns the source of truth. */
  statements: MotivationStatement[];
  /** Fires once, on drag/keyboard-move commit — not during live drag-over
   *  hover — so it maps 1:1 to "the user made a decision." */
  onReorder: (ranking: string[]) => void;
  disabled?: boolean;
}

const ROLE_BY_INDEX = [
  { badgeBg: 'var(--pine)', badgeColor: '#fff', border: 'border-brand', bg: 'bg-active-tint', pill: 'Важнее всего', pillClass: 'text-brand bg-brand-subtle' },
  { badgeBg: 'var(--bg-surface)', badgeColor: 'var(--text-subtle)', border: 'border-default', bg: 'bg-surface', pill: null, pillClass: '' },
  { badgeBg: 'var(--bg-surface)', badgeColor: 'var(--text-subtle)', border: 'border-default', bg: 'bg-danger-subtle', pill: 'Менее всего', pillClass: 'text-danger' },
] as const;

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Чтобы изменить порядок, нажми пробел или Enter на карточке. ' +
    'Используй стрелки вверх и вниз, чтобы переместить её. ' +
    'Нажми пробел или Enter ещё раз, чтобы отпустить, или Escape, чтобы отменить.',
};

function labelFor(statements: MotivationStatement[], id: string | number) {
  return statements.find(s => s.id === id)?.text ?? '';
}

function positionOf(statements: MotivationStatement[], id: string | number) {
  return statements.findIndex(s => s.id === id);
}

interface SortableCardProps {
  statement: MotivationStatement;
  index: number;
  disabled?: boolean;
}

function SortableCard({ statement, index, disabled }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: statement.id,
    disabled,
  });
  const role = ROLE_BY_INDEX[index];

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
        opacity: isDragging ? 0.4 : 1,
        borderRadius: 18,
      }}
      className={cn(
        'w-full flex items-center gap-3 border-2 px-5 py-[18px] cursor-grab active:cursor-grabbing transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        role.border,
        role.bg,
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-roledescription="перетаскиваемая карточка"
      aria-label={`${statement.text}, приоритет ${index + 1} из 3`}
    >
      <span
        className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
        style={{
          borderRadius: '50%',
          fontSize: 15,
          background: role.badgeBg,
          color: role.badgeColor,
          border: index === 0 ? 'none' : '1.5px solid var(--hairline)',
        }}
      >
        {index + 1}
      </span>
      <span className="flex-1 flex flex-col gap-2">
        <span className="font-bold text-primary leading-snug" style={{ fontSize: 16 }}>
          {statement.text}
        </span>
        {role.pill && (
          <span className={cn('self-start font-extrabold rounded-pill px-3 py-1', role.pillClass)} style={{ fontSize: 12 }}>
            {role.pill}
          </span>
        )}
      </span>
      <GripVertical className="w-5 h-5 flex-none" style={{ color: 'var(--text-subtle)' }} aria-hidden />
    </div>
  );
}

export const TripletRanking = React.memo(function TripletRanking({
  statements,
  onReorder,
  disabled,
}: TripletRankingProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Поднята карточка «${labelFor(statements, active.id)}»`,
    onDragOver: ({ active, over }) =>
      over
        ? `Карточка «${labelFor(statements, active.id)}» перемещена на позицию ${positionOf(statements, over.id) + 1} из 3`
        : `Карточка «${labelFor(statements, active.id)}» вне зоны сортировки`,
    onDragEnd: ({ active, over }) =>
      over
        ? `Карточка «${labelFor(statements, active.id)}» размещена на позиции ${positionOf(statements, over.id) + 1} из 3`
        : 'Перемещение отменено',
    onDragCancel: ({ active }) => `Перемещение карточки «${labelFor(statements, active.id)}» отменено`,
  };

  function handleDragStart(event: DragStartEvent) {
    playClick('soft');
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = statements.map(s => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  const activeStatement = activeId ? statements.find(s => s.id === activeId) : undefined;
  const activeIndex = activeStatement ? statements.indexOf(activeStatement) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={statements.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-[10px]">
          {statements.map((statement, index) => (
            <SortableCard key={statement.id} statement={statement} index={index} disabled={disabled} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {activeStatement && activeIndex !== -1 ? (
          <div
            className={cn(
              'w-full flex items-center gap-3 border-2 px-5 py-[18px]',
              ROLE_BY_INDEX[activeIndex].border,
              ROLE_BY_INDEX[activeIndex].bg,
              'triplet-drag-lift',
            )}
            style={{ borderRadius: 18 }}
          >
            <span
              className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
              style={{
                borderRadius: '50%',
                fontSize: 15,
                background: ROLE_BY_INDEX[activeIndex].badgeBg,
                color: ROLE_BY_INDEX[activeIndex].badgeColor,
              }}
            >
              {activeIndex + 1}
            </span>
            <span className="flex-1 font-bold text-primary leading-snug" style={{ fontSize: 16 }}>
              {activeStatement.text}
            </span>
            <GripVertical className="w-5 h-5 flex-none" style={{ color: 'var(--text-subtle)' }} aria-hidden />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
