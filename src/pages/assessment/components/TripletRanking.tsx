import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { ReorderArrows } from './ReorderArrows';

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

// Neutral, uniform styling across all three positions — only the number
// badge communicates rank now, no most/least framing or color coding.
const CARD_STYLE = { badgeBg: 'var(--bg-surface)', badgeColor: 'var(--text-subtle)', border: 'border-default', bg: 'bg-surface' } as const;

function labelFor(statements: MotivationStatement[], id: string | number) {
  return statements.find(s => s.id === id)?.text ?? '';
}

function positionOf(statements: MotivationStatement[], id: string | number) {
  return statements.findIndex(s => s.id === id);
}

interface SortableCardProps {
  statement: MotivationStatement;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

/* Only the badge · text · grip part drags (and takes the keyboard pick-up):
   the ↑/↓ buttons beside it are their own controls, not nested inside a
   draggable role="button". */
function SortableCard({ statement, index, total, onMove, disabled }: SortableCardProps) {
  const { t } = useTranslation('assessment');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: statement.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        borderRadius: 18,
      }}
      className={cn(
        'rd-assessment-rank-card w-full flex items-center gap-2 border-2 py-[18px] pl-5 pr-3 transition-colors duration-150',
        CARD_STYLE.border,
        CARD_STYLE.bg,
      )}
    >
      <span
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className={cn(
          'flex-1 min-w-0 flex items-center gap-3 rounded-[12px] cursor-grab active:cursor-grabbing',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4',
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-roledescription={t('triplet.cardRoleDesc')}
        aria-label={t('triplet.cardAria', { text: statement.text, index: index + 1 })}
      >
        <span
          className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
          style={{
            borderRadius: '50%',
            fontSize: 15,
            background: CARD_STYLE.badgeBg,
            color: CARD_STYLE.badgeColor,
            border: '1.5px solid var(--hairline)',
          }}
        >
          {/* Fixed to the card's own original order, not its current slot —
              renumbering every card as they shuffle past each other mid-drag
              read as confusing. Actual rank is communicated by position
              (top → bottom) and the aria-label below, not this badge. */}
          {statement.order + 1}
        </span>
        <span className="flex-1 font-bold text-primary leading-snug text-body-md">
          {statement.text}
        </span>
        <GripVertical className="w-5 h-5 flex-none" style={{ color: 'var(--text-subtle)' }} aria-hidden />
      </span>
      <ReorderArrows label={statement.text} position={index} total={total} onMove={onMove} disabled={disabled} />
    </div>
  );
}

export const TripletRanking = React.memo(function TripletRanking({
  statements,
  onReorder,
  disabled,
}: TripletRankingProps) {
  const { t } = useTranslation('assessment');
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const screenReaderInstructions: ScreenReaderInstructions = { draggable: t('triplet.keyboardInstructions') };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('triplet.dndPicked', { card: labelFor(statements, active.id) }),
    onDragOver: ({ active, over }) =>
      over
        ? t('triplet.dndMovedTo', { card: labelFor(statements, active.id), position: positionOf(statements, over.id) + 1 })
        : t('triplet.dndOutside', { card: labelFor(statements, active.id) }),
    onDragEnd: ({ active, over }) =>
      over
        ? t('triplet.dndPlacedAt', { card: labelFor(statements, active.id), position: positionOf(statements, over.id) + 1 })
        : t('triplet.dndCancelledMove'),
    onDragCancel: ({ active }) => t('triplet.dndCancelledCard', { card: labelFor(statements, active.id) }),
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

  // The ↑/↓ buttons commit a move in one step — same contract as a drop.
  function handleMove(from: number, to: number) {
    if (to < 0 || to >= statements.length) return;
    playClick('soft');
    onReorder(arrayMove(statements.map(s => s.id), from, to));
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
            <SortableCard
              key={statement.id}
              statement={statement}
              index={index}
              total={statements.length}
              onMove={handleMove}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {activeStatement && activeIndex !== -1 ? (
          <div
            className={cn(
              'rd-assessment-rank-card w-full flex items-center gap-2 border-2 py-[18px] pl-5 pr-3',
              CARD_STYLE.border,
              CARD_STYLE.bg,
              'triplet-drag-lift',
            )}
            style={{ borderRadius: 18 }}
          >
            <span className="flex-1 min-w-0 flex items-center gap-3">
              <span
                className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
                style={{
                  borderRadius: '50%',
                  fontSize: 15,
                  background: CARD_STYLE.badgeBg,
                  color: CARD_STYLE.badgeColor,
                }}
              >
                {activeStatement.order + 1}
              </span>
              <span className="flex-1 font-bold text-primary leading-snug text-body-md">
                {activeStatement.text}
              </span>
              <GripVertical className="w-5 h-5 flex-none" style={{ color: 'var(--text-subtle)' }} aria-hidden />
            </span>
            {/* Same row shape as the card it lifts off — the arrows are inert here. */}
            <span aria-hidden="true" className="flex items-center gap-2">
              <ReorderArrows label={activeStatement.text} position={activeIndex} total={statements.length} onMove={() => {}} disabled />
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
