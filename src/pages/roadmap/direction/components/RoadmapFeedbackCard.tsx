import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { FeedbackRating } from '@/shared/types';

interface RoadmapFeedbackCardProps {
  isPending: boolean;
  onSubmit: (rating: FeedbackRating, message: string | null) => void;
}

const RATING_OPTIONS: { value: FeedbackRating; label: string; emoji: string }[] = [
  { value: 'good', label: 'Хорошо', emoji: '🙂' },
  { value: 'neutral', label: 'Средне', emoji: '😐' },
  { value: 'bad', label: 'Плохо', emoji: '🙁' },
];

export function RoadmapFeedbackCard({ isPending, onSubmit }: RoadmapFeedbackCardProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [message, setMessage] = useState('');

  return (
    <Card className="flex flex-col gap-4">
      <p className="font-bold text-primary text-center">Как тебе Profy?</p>

      <div className="flex justify-center gap-3">
        {RATING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRating(option.value)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-xl border font-semibold transition-colors',
              rating === option.value
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-default text-secondary hover:bg-raised',
            )}
          >
            <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
            <span className="text-caption">{option.label}</span>
          </button>
        ))}
      </div>

      {rating && (
        <div className="flex flex-col gap-3">
          <textarea
            className="w-full min-h-[80px] border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-primary"
            placeholder="Что понравилось или не понравилось — тест, результат, план — необязательно"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm" isLoading={isPending} onClick={() => onSubmit(rating, message.trim() || null)}>
              Отправить
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
