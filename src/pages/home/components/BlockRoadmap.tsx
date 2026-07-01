import { memo } from 'react';
import { cn } from '@/shared/lib/cn';
import { BLOCK_NAMES } from '@/shared/config/constants';
import type { AssessmentBlock } from '@/shared/types';

interface BlockRoadmapProps {
  blocks: AssessmentBlock[];
  /** 0-indexed. currentBlock === blocks.length means all completed. */
  currentBlock: number;
  onContinue: () => void;
  onRetake: (blockIndex: number) => void;
}

type NodeState = 'completed' | 'current' | 'locked';

function getNodeState(index: number, currentBlock: number): NodeState {
  if (index < currentBlock) return 'completed';
  if (index === currentBlock) return 'current';
  return 'locked';
}

export const BlockRoadmap = memo(function BlockRoadmap({
  blocks,
  currentBlock,
  onContinue,
  onRetake,
}: BlockRoadmapProps) {
  // Fill the absolute progress bar: how far along the bar the progress reaches.
  // Bar spans left:7%→right:7% of the container. We map currentBlock / total nodes
  // so the fill visually aligns with the current node's position.
  const fillPct = blocks.length > 1
    ? Math.min((currentBlock / blocks.length) * 100, 100)
    : currentBlock > 0 ? 100 : 0;

  return (
    <div
      className="overflow-x-auto -mx-4 sm:mx-0"
      role="list"
      aria-label="Блоки диагностики"
    >
      {/* Scroll wrapper keeps a minimum width so nodes never squeeze on narrow screens */}
      <div
        className="relative flex items-start justify-between px-4 sm:px-0 pb-2"
        style={{ minWidth: blocks.length * 72 }}
      >
        {/* ── Background track ──────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute rounded-pill overflow-hidden"
          style={{ top: 24, left: '7%', right: '7%', height: 4, background: '#EDE9FE', zIndex: 1 }}
        >
          <div
            className="h-full rounded-pill transition-[width] duration-500 ease-out"
            style={{ width: `${fillPct}%`, background: 'linear-gradient(90deg,#22C55E,#7C3AED)' }}
          />
        </div>

        {/* ── Nodes ─────────────────────────────────────────────── */}
        {blocks.map((block, i) => {
          const state = getNodeState(i, currentBlock);
          const clickable = state !== 'locked';

          const handlePress =
            state === 'current' ? onContinue :
            state === 'completed' ? () => onRetake(i) :
            undefined;

          return (
            <div
              key={block}
              className="relative z-[2] flex flex-col items-center text-center"
              role="listitem"
              style={{ flex: '1 1 0', minWidth: 0 }}
            >
              <button
                type="button"
                onClick={handlePress}
                disabled={!clickable}
                aria-label={
                  state === 'completed' ? `${BLOCK_NAMES[block]} — перепройти` :
                  state === 'current'   ? `${BLOCK_NAMES[block]} — начать` :
                                          `${BLOCK_NAMES[block]} — заблокировано`
                }
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-black text-[17px] transition-all',
                  state === 'completed' && 'cursor-pointer hover:opacity-80 active:scale-95',
                  state === 'current'   && 'cursor-pointer active:scale-95',
                  state === 'locked'    && 'cursor-default',
                )}
                style={
                  state === 'completed' ? { background: '#22C55E', color: '#fff', boxShadow: '0 4px 10px rgba(34,197,94,.3)' } :
                  state === 'current'   ? { background: '#7C3AED', color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,.4)' } :
                                          { background: '#EDE9FE', color: '#A78BFA' }
                }
              >
                {state === 'completed' ? '✓' : String(i + 1)}
              </button>

              <span
                className={cn(
                  'mt-2.5 leading-snug break-words hyphens-auto px-0.5',
                  state === 'completed' && 'text-[#16A34A] font-extrabold',
                  state === 'current'   && 'text-brand font-black',
                  state === 'locked'    && 'text-muted font-semibold',
                )}
                style={{ fontSize: 11, lineHeight: 1.25, maxWidth: 68 }}
              >
                {BLOCK_NAMES[block]}
              </span>

              {state === 'current' && (
                <span className="mt-0.5 font-extrabold text-[#C4B5FD]" style={{ fontSize: 10 }}>
                  сейчас
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
