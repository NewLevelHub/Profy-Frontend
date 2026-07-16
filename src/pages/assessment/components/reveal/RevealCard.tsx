import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import type { RevealLeaf, RevealResponse } from '@/shared/types';
import { RevealSingle } from './RevealSingle';
import { RevealCluster } from './RevealCluster';
import { RevealFeedbackFooter } from './RevealFeedbackFooter';

interface RevealCardProps {
  reveal: RevealResponse;
  onReject: (slug: string) => void;
  onLikeLeaf: (leaf: RevealLeaf) => void;
  onFeedback: (liked: boolean, note: string | null) => void;
  onResolve: () => void;
}

// Branches the reveal UI by `reveal.status`: a single confident pick (hero +
// spares) reads very differently from a cluster of 2-3 tied finalists — see
// RevealSingle / RevealCluster. Copy stays hedged (reveal.message, generated
// by akinator_report_service) — never a flat "твоя профессия — X" claim.
// "Нравится" on any leaf opens the RJP simulation for that leaf (onLikeLeaf)
// instead of finishing the session here — see SimulationCard.
export function RevealCard({ reveal, onReject, onLikeLeaf, onFeedback, onResolve }: RevealCardProps) {
  const [feedbackMode, setFeedbackMode] = useState<'disliked' | null>(null);

  const topLeaf = reveal.leaves[0];
  if (reveal.status === 'single' && !topLeaf) return null;

  return (
    <div
      className="w-full max-w-xl bg-surface rounded-[24px] p-6 lg:p-8 flex flex-col gap-6"
      style={{ boxShadow: '0 10px 30px rgba(30,27,75,.04)', border: '1px solid #EDE9FE' }}
    >
      <div className="text-center flex flex-col items-center gap-3">
        <span className="text-5xl select-none animate-bounce">✨</span>
        <h2 className="font-black text-primary tracking-[-0.02em]" style={{ fontSize: 32 }}>
          Результат готов!
        </h2>
        <p className="text-secondary leading-relaxed font-medium" style={{ fontSize: 16 }}>
          {reveal.message}
        </p>
      </div>

      {reveal.status === 'single' ? (
        <RevealSingle
          leaf={topLeaf}
          backups={reveal.backups}
          onLike={onLikeLeaf}
          onReject={onReject}
        />
      ) : (
        <RevealCluster
          leaves={reveal.leaves}
          onLike={onLikeLeaf}
          onReject={onReject}
        />
      )}

      {reveal.status === 'cluster' && (
        <div className="p-4 rounded-xl bg-brand-subtle flex flex-col gap-3 text-center items-center">
          <p className="text-secondary font-bold text-caption">
            Можешь ответить ещё на пару вопросов, чтобы сузить выбор.
          </p>
          <Button onClick={onResolve} className="rounded-pill px-6" style={{ background: '#7C3AED' }}>
            ⚖️ Уточнить выбор
          </Button>
        </div>
      )}

      <RevealFeedbackFooter
        mode={feedbackMode}
        onPickDisliked={() => setFeedbackMode('disliked')}
        onCancel={() => setFeedbackMode(null)}
        onSubmit={note => onFeedback(false, note)}
      />
    </div>
  );
}
