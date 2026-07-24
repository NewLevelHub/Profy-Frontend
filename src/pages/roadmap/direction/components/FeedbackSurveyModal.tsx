import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { FeedbackRating } from '@/shared/types';

export interface FeedbackSurveyAnswers {
  overallRating: FeedbackRating;
  questionsRating: FeedbackRating;
  resultMatchRating: FeedbackRating;
  planUsefulnessRating: FeedbackRating;
  designRating: FeedbackRating;
  message: string | null;
}

interface FeedbackSurveyModalProps {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (answers: FeedbackSurveyAnswers) => void;
}

type AxisKey = 'overallRating' | 'questionsRating' | 'resultMatchRating' | 'planUsefulnessRating' | 'designRating';

interface AxisOption {
  value: FeedbackRating;
  emoji: string;
  label: string;
}

const AXES: { key: AxisKey; question: string; options: AxisOption[] }[] = [
  {
    key: 'overallRating',
    question: 'Как тебе Profy в целом?',
    options: [
      { value: 'good', emoji: '🙂', label: 'Хорошо' },
      { value: 'neutral', emoji: '😐', label: 'Средне' },
      { value: 'bad', emoji: '🙁', label: 'Плохо' },
    ],
  },
  {
    key: 'questionsRating',
    question: 'Вопросы теста — понятно и интересно было отвечать?',
    options: [
      { value: 'good', emoji: '🙂', label: 'Понятно' },
      { value: 'neutral', emoji: '😐', label: 'Нормально' },
      { value: 'bad', emoji: '🙁', label: 'Непонятно' },
    ],
  },
  {
    key: 'resultMatchRating',
    question: 'Результат совпал с твоими интересами и ожиданиями?',
    options: [
      { value: 'good', emoji: '🙂', label: 'Совпал' },
      { value: 'neutral', emoji: '😐', label: 'Частично' },
      { value: 'bad', emoji: '🙁', label: 'Не совпал' },
    ],
  },
  {
    key: 'planUsefulnessRating',
    question: 'План развития — насколько он полезен?',
    options: [
      { value: 'good', emoji: '🙂', label: 'Полезен' },
      { value: 'neutral', emoji: '😐', label: 'Так себе' },
      { value: 'bad', emoji: '🙁', label: 'Бесполезен' },
    ],
  },
  {
    key: 'designRating',
    question: 'Дизайн и удобство сайта?',
    options: [
      { value: 'good', emoji: '🙂', label: 'Нравится' },
      { value: 'neutral', emoji: '😐', label: 'Нормально' },
      { value: 'bad', emoji: '🙁', label: 'Не нравится' },
    ],
  },
];

interface FeedbackRatingRowProps {
  question: string;
  options: AxisOption[];
  value: FeedbackRating | null;
  onChange: (value: FeedbackRating) => void;
}

function FeedbackRatingRow({ question, options, value, onChange }: FeedbackRatingRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-semibold text-primary">{question}</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl border font-semibold transition-colors',
              value === option.value
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-default text-secondary hover:bg-raised',
            )}
          >
            <span className="text-xl" aria-hidden="true">{option.emoji}</span>
            <span className="text-caption">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeedbackSurveyModal({ isOpen, isPending, onClose, onSubmit }: FeedbackSurveyModalProps) {
  const [ratings, setRatings] = useState<Partial<Record<AxisKey, FeedbackRating>>>({});
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const isComplete = AXES.every((axis) => ratings[axis.key]);

  function handleSubmit() {
    if (!isComplete) return;
    onSubmit({
      overallRating: ratings.overallRating!,
      questionsRating: ratings.questionsRating!,
      resultMatchRating: ratings.resultMatchRating!,
      planUsefulnessRating: ratings.planUsefulnessRating!,
      designRating: ratings.designRating!,
      message: message.trim() || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-survey-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="feedback-survey-title" className="text-title font-black text-primary">
              Как всё прошло?
            </h2>
            <p className="text-body text-secondary mt-1">
              Пара вопросов — 30 секунд, поможет сделать Profy лучше.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-secondary hover:text-primary transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {AXES.map((axis) => (
            <FeedbackRatingRow
              key={axis.key}
              question={axis.question}
              options={axis.options}
              value={ratings[axis.key] ?? null}
              onChange={(value) => setRatings((prev) => ({ ...prev, [axis.key]: value }))}
            />
          ))}
        </div>

        <textarea
          className="w-full min-h-[70px] border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-primary"
          placeholder="Что понравилось или не понравилось — необязательно"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} muteSound>
            Пропустить
          </Button>
          <Button size="sm" isLoading={isPending} disabled={!isComplete} onClick={handleSubmit}>
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}
