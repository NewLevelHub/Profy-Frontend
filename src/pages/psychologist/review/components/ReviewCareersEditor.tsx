import { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
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
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychologistReviewCareer } from '@/shared/types';

interface ReviewCareersEditorProps {
  careers: PsychologistReviewCareer[];
  onChange: (careers: PsychologistReviewCareer[]) => void;
  disabled?: boolean;
}

function moveItem(list: PsychologistReviewCareer[], from: number, to: number): PsychologistReviewCareer[] {
  if (to < 0 || to >= list.length) return list;
  return arrayMove(list, from, to);
}

/** Backend stores Pearson / normalized match as 0–1 (PRO-385). Older rows
 *  may still be 0–100 ints — don't double-scale those. PRO-417. */
function formatMatchPercent(score: number): string {
  const pct = score <= 1 ? score * 100 : score;
  const rounded = Math.round(pct * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

interface SortableCareerRowProps {
  career: PsychologistReviewCareer;
  index: number;
  total: number;
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}

function SortableCareerRow({
  career,
  index,
  total,
  disabled,
  onMove,
  onRemove,
}: SortableCareerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: career.slug,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className="py-3 flex flex-wrap items-center justify-between gap-2 bg-surface"
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 min-w-0 flex-1',
          !disabled && 'cursor-grab active:cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
      >
        {!disabled && (
          <GripVertical size={14} className="text-muted flex-shrink-0" aria-hidden />
        )}
        <span className={cn(ADMIN_NUM, 'text-muted')}>{index + 1}.</span>
        <span className={cn(ADMIN_TEXT, 'font-semibold text-primary')}>{career.name}</span>
        <AdminBadge tone="quiet">{career.holland_code}</AdminBadge>
        <span className={cn(ADMIN_NUM, 'text-muted')}>{formatMatchPercent(career.match_score)}</span>
      </div>
      {!disabled && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            className={ADMIN_BUTTON}
            disabled={index === 0}
            aria-label={`Поднять «${career.name}» выше`}
            onClick={() => onMove(index, index - 1)}
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            className={ADMIN_BUTTON}
            disabled={index === total - 1}
            aria-label={`Опустить «${career.name}» ниже`}
            onClick={() => onMove(index, index + 1)}
          >
            <ChevronDown size={13} />
          </button>
          <button
            type="button"
            className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
            aria-label={`Убрать направление «${career.name}»`}
            onClick={() => onRemove(index)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </li>
  );
}

/**
 * Matched directions in the order the student will see them. Drag a row
 * (or use the arrows) to change priority; drop a direction that does not fit.
 */
export function ReviewCareersEditor({ careers, onChange, disabled }: ReviewCareersEditorProps) {
  const [dragging, setDragging] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (careers.length === 0) {
    return <p className={cn(ADMIN_META, 'm-0')}>Направления не подбирались</p>;
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = careers.findIndex((c) => c.slug === active.id);
    const to = careers.findIndex((c) => c.slug === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(careers, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragging(false)}
    >
      <SortableContext items={careers.map((c) => c.slug)} strategy={verticalListSortingStrategy}>
        <ol
          className={cn(
            'divide-y divide-[var(--border)] m-0 p-0 list-none',
            dragging && 'select-none',
          )}
        >
          {careers.map((career, index) => (
            <SortableCareerRow
              key={career.slug}
              career={career}
              index={index}
              total={careers.length}
              disabled={disabled}
              onMove={(from, to) => onChange(moveItem(careers, from, to))}
              onRemove={(i) => onChange(careers.filter((_, j) => j !== i))}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
