import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

interface SimulationDecisionProps {
  leafName: string;
  submitting: boolean;
  onAccept: (note: string | null) => void;
  onReject: () => void;
}

// Explicit accept/reject after the scenario — the only two exits from a
// simulation. Rejecting is what feeds back into the akinator turn (see
// useAkinatorAssessment.handleSimulationReject); it is never automatic.
export function SimulationDecision({ leafName, submitting, onAccept, onReject }: SimulationDecisionProps) {
  const [note, setNote] = useState('');

  return (
    <div className="flex flex-col gap-5 text-center">
      <div>
        <span className="text-4xl">🎬</span>
        <p className="font-black text-primary mt-3" style={{ fontSize: 22 }}>
          Как тебе такой день из жизни «{leafName}»?
        </p>
      </div>

      <textarea
        className="w-full min-h-[80px] border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-primary"
        placeholder="Что понравилось или смутило? (необязательно)"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full rounded-pill"
          isLoading={submitting}
          disabled={submitting}
          onClick={() => onAccept(note.trim() || null)}
        >
          👍 Да, это моё!
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full rounded-pill"
          disabled={submitting}
          onClick={onReject}
        >
          Не моё — покажи другое
        </Button>
      </div>
    </div>
  );
}
