import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

interface RevealFeedbackFooterProps {
  // 'continue': single/cluster reveal — the pill immediately rejects
  // everything shown and keeps testing (onContinue), no comment step.
  // 'final': the inconclusive dead-end — the only place a comment-then-finish
  // step still makes sense, since there's nowhere left to send the user.
  variant: 'continue' | 'final';
  onContinue: () => void;
  mode: 'disliked' | null;
  onPickDisliked: () => void;
  onCancel: () => void;
  onSubmit: (note: string | null) => void;
}

// A *liked* leaf never lands here directly — it goes through the RJP
// simulation first (see SimulationCard / useAkinatorAssessment.handleLikeLeaf),
// which has its own accept-with-note step.
export function RevealFeedbackFooter({
  variant,
  onContinue,
  mode,
  onPickDisliked,
  onCancel,
  onSubmit,
}: RevealFeedbackFooterProps) {
  const [note, setNote] = useState('');

  if (variant === 'continue') {
    return (
      <div className="flex justify-center border-t border-default pt-4 mt-2">
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-default text-secondary font-bold hover:bg-raised transition-colors"
        >
          🤷 Ничего из этого не подходит
        </button>
      </div>
    );
  }

  if (mode === null) {
    return (
      <div className="flex justify-center border-t border-default pt-4 mt-2">
        <button
          type="button"
          onClick={onPickDisliked}
          className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-default text-secondary font-bold hover:bg-raised transition-colors"
        >
          Завершить тест
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-t border-default pt-5 mt-2">
      <p className="font-bold text-primary text-center">
        Жаль, что не подошло. Напиши, что именно не откликнулось (необязательно):
      </p>
      <textarea
        className="w-full min-h-[100px] border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-primary"
        placeholder="Твой комментарий..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={() => onSubmit(note.trim() || null)}>
          {note.trim() ? 'Сохранить и завершить' : 'Пропустить и завершить'}
        </Button>
      </div>
    </div>
  );
}
