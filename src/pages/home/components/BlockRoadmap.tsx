import React, { memo } from 'react';
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
  return (
    <div
      className="overflow-x-auto -mx-4 sm:mx-0 pb-1"
      role="list"
      aria-label="Блоки диагностики"
    >
      <div className="flex items-start px-4 sm:px-0 min-w-max md:min-w-0 md:flex-wrap md:gap-y-2">
        {blocks.map((block, i) => {
          const state = getNodeState(i, currentBlock);
          const isLast = i === blocks.length - 1;
          const clickable = state !== 'locked';

          const handlePress =
            state === 'current'
              ? onContinue
              : state === 'completed'
              ? () => onRetake(i)
              : undefined;

          return (
            <React.Fragment key={block}>
              {/* Node */}
              <div className="flex flex-col items-center" style={{ width: 68 }} role="listitem">
                <button
                  type="button"
                  onClick={handlePress}
                  disabled={!clickable}
                  aria-label={
                    state === 'completed'
                      ? `${BLOCK_NAMES[block]} — перепройти`
                      : state === 'current'
                      ? `${BLOCK_NAMES[block]} — начать`
                      : `${BLOCK_NAMES[block]} — заблокировано`
                  }
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm transition-all',
                    state === 'completed' &&
                      'bg-success text-white cursor-pointer hover:opacity-80 active:scale-95',
                    state === 'current' &&
                      'bg-brand text-on-brand cursor-pointer shadow-button animate-pulse active:scale-95',
                    state === 'locked' && 'bg-raised text-muted cursor-default',
                  )}
                >
                  {state === 'completed' ? '✓' : String(i + 1)}
                </button>
                <span
                  className={cn(
                    'mt-1.5 text-center leading-tight',
                    'text-tiny',
                    state === 'completed' && 'text-success',
                    state === 'current' && 'text-brand font-semibold',
                    state === 'locked' && 'text-muted',
                  )}
                  style={{ width: 64 }}
                >
                  {BLOCK_NAMES[block]}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'h-0.5 flex-shrink-0 self-start mt-[22px]',
                    i < currentBlock ? 'bg-success' : 'bg-border',
                  )}
                  style={{ width: 16 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});
