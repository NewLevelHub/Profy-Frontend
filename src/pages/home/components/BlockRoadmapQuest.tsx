import { memo } from 'react';
import { BLOCK_NAMES } from '@/shared/config/constants';
import { playClick } from '@/shared/lib/sounds';
import type { AssessmentBlock } from '@/shared/types';

interface BlockRoadmapQuestProps {
  blocks: AssessmentBlock[];
  currentBlock: number;
  onContinue: () => void;
  onRetake: (blockIndex: number) => void;
}

type NodeState = 'done' | 'current' | 'locked';

function getState(index: number, currentBlock: number): NodeState {
  if (index < currentBlock) return 'done';
  if (index === currentBlock) return 'current';
  return 'locked';
}

export const BlockRoadmapQuest = memo(function BlockRoadmapQuest({
  blocks,
  currentBlock,
  onContinue,
  onRetake,
}: BlockRoadmapQuestProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-[34px_40px]"
      style={{ background: 'linear-gradient(160deg,#F0ECFF,#EDE9FE)', border: '1px solid #DDD6FE', boxShadow: '0 6px 18px rgba(30,27,75,.06)' }}
    >
      <span className="absolute top-5 right-7 text-[30px] opacity-50 select-none" aria-hidden="true">🗺️</span>

      <div className="relative flex flex-col gap-[6px]" role="list" aria-label="Блоки диагностики (квест)">
        {blocks.map((block, i) => {
          const state = getState(i, currentBlock);
          const left = i % 2 === 0;
          const isLast = i === blocks.length - 1;

          const mark = state === 'done' ? '✓' : state === 'current' ? String(i + 1) : isLast ? '🏆' : '🔒';
          // Возможное внедрение в будущем: показывать '+120 XP' для пройденных блоков
          const meta = state === 'current' ? 'Продолжить →' : state === 'done' ? 'Пройдено ✓' : 'Закрыто';

          const nodeStyle: React.CSSProperties = state === 'done'
            ? { background: '#22C55E', color: '#fff', boxShadow: '0 6px 14px rgba(34,197,94,.35)' }
            : state === 'current'
            ? { background: '#7C3AED', color: '#fff', boxShadow: '0 6px 16px rgba(124,58,237,.45)' }
            : { background: '#DDD6FE', color: '#fff' };

          const cardStyle: React.CSSProperties = state === 'done'
            ? { background: '#fff', border: '1.5px solid #BBF7D0' }
            : state === 'current'
            ? { background: '#fff', border: '2px solid #7C3AED' }
            : { background: 'rgba(255,255,255,.55)', border: '1.5px dashed #DDD6FE' };

          const metaColor = state === 'done' ? '#16A34A' : state === 'current' ? '#7C3AED' : '#A78BFA';

          const clickable = state !== 'locked';
          const handlePress = state === 'current'
            ? () => {
                playClick();
                onContinue();
              }
            : state === 'done'
              ? () => {
                  playClick();
                  onRetake(i);
                }
              : undefined;

          return (
            <div
              key={block}
              role="listitem"
              className="relative"
              style={{ maxWidth: 560, ...(left ? { marginRight: 'auto' } : { marginLeft: 'auto', flexDirection: 'row-reverse' }) }}
            >
              {/* Connector line from prev node */}
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="absolute top-[-26px] w-[3px] h-[26px]"
                  style={{ background: '#DDD6FE', ...(left ? { left: 24 } : { right: 24 }) }}
                />
              )}

              <button
                type="button"
                onClick={handlePress}
                disabled={!clickable}
                aria-label={
                  state === 'done' ? `${BLOCK_NAMES[block]} — перепройти` :
                  state === 'current' ? `${BLOCK_NAMES[block]} — продолжить` :
                  `${BLOCK_NAMES[block]} — заблокировано`
                }
                className="w-full text-left"
                style={{ display: 'flex', alignItems: 'center', gap: 18, flexDirection: left ? 'row' : 'row-reverse', cursor: clickable ? 'pointer' : 'default' }}
              >
                {/* Node circle */}
                <div
                  className="flex-none w-[52px] h-[52px] rounded-full flex items-center justify-center font-black"
                  style={{ fontSize: 19, ...nodeStyle }}
                >
                  {mark}
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-[16px] p-[12px_18px]"
                  style={{ boxShadow: '0 4px 12px rgba(30,27,75,.05)', ...cardStyle }}
                >
                  <p className="font-extrabold text-primary" style={{ fontSize: 16 }}>{BLOCK_NAMES[block]}</p>
                  <p className="font-extrabold mt-0.5" style={{ fontSize: 13, color: metaColor }}>{meta}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
