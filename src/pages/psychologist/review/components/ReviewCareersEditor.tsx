import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
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
import { formatNumber } from '@/shared/i18n/format';
import { Mono, Text } from '@/shared/ui/typography';
import type { PsychologistReviewCareer } from '@/shared/types';

interface ReviewCareersEditorProps {
  careers: PsychologistReviewCareer[];
  onChange: (careers: PsychologistReviewCareer[]) => void;
  disabled?: boolean;
}

/** Backend stores Pearson / normalized match as 0–1 (PRO-385). Older rows
 *  may still be 0–100 ints — don't double-scale those. PRO-417. */
function formatMatchPercent(score: number): string {
  const pct = score <= 1 ? score * 100 : score;
  return formatNumber(pct, { maximumFractionDigits: 1 });
}

const ICON_BUTTON =
  'w-10 h-10 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 inline-flex items-center justify-center text-secondary ' +
  'hover:bg-hover hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none';

const ROW_GRID = 'grid grid-cols-[24px_minmax(0,1fr)] sm:grid-cols-[28px_minmax(0,1fr)_52px_72px_148px] items-center gap-3';

interface SortableCareerRowProps {
  career: PsychologistReviewCareer;
  index: number;
  total: number;
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}

function SortableCareerRow({ career, index, total, disabled, onMove, onRemove }: SortableCareerRowProps) {
  const { t } = useTranslation('psychologist');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: career.slug,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      className={cn(ROW_GRID, 'px-4 py-2 border-b border-default last:border-b-0 bg-surface')}
    >
      <Mono variant="md" className="text-muted">
        {String(index + 1).padStart(2, '0')}
      </Mono>
      <button
        type="button"
        disabled={disabled}
        className={cn('appearance-none p-0 border-0 bg-transparent flex items-center gap-2 min-w-0 min-h-11 text-left', !disabled && 'cursor-grab active:cursor-grabbing')}
        {...attributes}
        {...listeners}
      >
        {!disabled && <GripVertical size={16} className="text-muted flex-none" aria-hidden="true" />}
        <span className="min-w-0">
          <Text as="span" variant="body-md" className="block text-heading">
            {career.name}
          </Text>
          <Mono variant="sm" className="block sm:hidden text-muted mt-1">
            {career.holland_code} · {formatMatchPercent(career.match_score)}%
          </Mono>
        </span>
      </button>
      <Mono variant="sm" className="hidden sm:inline text-[color:var(--lake)]">
        {career.holland_code}
      </Mono>
      <Mono variant="md" className="hidden sm:inline text-right tabular-nums">
        {formatMatchPercent(career.match_score)}
      </Mono>
      <div className="col-start-2 sm:col-auto flex justify-end gap-2">
        {!disabled && (
          <>
            <span className="inline-flex rounded-[8px] border border-default overflow-hidden">
              <button
                type="button"
                className={ICON_BUTTON}
                disabled={index === 0}
                aria-label={t('review.careers.upAria', { name: career.name })}
                onClick={() => onMove(index, index - 1)}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(ICON_BUTTON, 'border-l border-default')}
                disabled={index === total - 1}
                aria-label={t('review.careers.downAria', { name: career.name })}
                onClick={() => onMove(index, index + 1)}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
            </span>
            <button
              type="button"
              className={cn(ICON_BUTTON, 'rounded-[8px] text-muted hover:text-[color:var(--clay)]')}
              aria-label={t('review.careers.removeAria', { name: career.name })}
              onClick={() => onRemove(index)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

/**
 * Matched directions in the order the student will see them. Drag a row
 * (or use the arrows) to change priority; drop a direction that does not fit.
 * Scores are the system's and stay read-only.
 */
export function ReviewCareersEditor({ careers, onChange, disabled }: ReviewCareersEditorProps) {
  const { t } = useTranslation('psychologist');
  const [dragging, setDragging] = useState(false);
  const [removed, setRemoved] = useState<{ career: PsychologistReviewCareer; index: number }[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: UniqueIdentifier) => careers.find((c) => c.slug === id)?.name ?? String(id);
  const positionOf = (id: UniqueIdentifier) => careers.findIndex((c) => c.slug === id) + 1;

  const screenReaderInstructions: ScreenReaderInstructions = {
    draggable: t('review.careers.dndInstructions'),
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => t('review.careers.dndPicked', { name: nameOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t('review.careers.dndOver', { name: nameOf(active.id), position: positionOf(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t('review.careers.dndDropped', { name: nameOf(active.id), position: positionOf(over.id) })
        : t('review.careers.dndCancelled', { name: nameOf(active.id) }),
    onDragCancel: ({ active }) => t('review.careers.dndCancelled', { name: nameOf(active.id) }),
  };

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = careers.findIndex((c) => c.slug === active.id);
    const to = careers.findIndex((c) => c.slug === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(careers, from, to));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= careers.length) return;
    onChange(arrayMove(careers, from, to));
  }

  function remove(index: number) {
    const career = careers[index];
    if (!career) return;
    setRemoved((previous) => [...previous, { career, index }]);
    onChange(careers.filter((_, i) => i !== index));
  }

  function undoRemove() {
    const last = removed[removed.length - 1];
    if (!last || disabled) return;
    setRemoved((previous) => previous.slice(0, -1));
    if (careers.some((career) => career.slug === last.career.slug)) return;
    const restored = [...careers];
    restored.splice(Math.min(last.index, restored.length), 0, last.career);
    onChange(restored);
  }

  return (
    <div className="flex flex-col gap-2">
      {careers.length === 0 ? (
        <Text variant="body-sm" className="text-muted m-0">{t('review.careers.empty')}</Text>
      ) : (
        <div className="border border-default rounded-[8px] overflow-hidden">
          <div className={cn(ROW_GRID, 'hidden sm:grid px-4 py-2.5 border-b border-default')} aria-hidden="true">
            <Text as="span" variant="caption" className="text-muted">
              {t('review.careers.colNumber')}
            </Text>
            <Text as="span" variant="caption" className="text-muted">
              {t('review.careers.colName')}
            </Text>
            <Text as="span" variant="caption" className="text-muted">
              {t('review.careers.colCode')}
            </Text>
            <Text as="span" variant="caption" className="text-muted text-right">
              {t('review.careers.colScore')}
            </Text>
            <span />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            accessibility={{ announcements, screenReaderInstructions }}
            onDragStart={() => setDragging(true)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragging(false)}
          >
            <SortableContext items={careers.map((c) => c.slug)} strategy={verticalListSortingStrategy}>
              <ol className={cn('m-0 p-0 list-none', dragging && 'select-none')}>
                {careers.map((career, index) => (
                  <SortableCareerRow
                    key={career.slug}
                    career={career}
                    index={index}
                    total={careers.length}
                    disabled={disabled}
                    onMove={move}
                    onRemove={remove}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </div>
      )}
      {!disabled && removed.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2" role="status">
          <Text as="span" variant="caption" className="text-muted">
            {t('review.careers.removed', { name: removed[removed.length - 1]?.career.name })}
          </Text>
          <button type="button" onClick={undoRemove} className="min-h-11 px-2 font-sans text-body-sm font-semibold text-brand underline underline-offset-4">
            {t('review.careers.undo')}
          </button>
        </div>
      )}
    </div>
  );
}
