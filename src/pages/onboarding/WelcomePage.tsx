import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { useWelcome } from './hooks/useWelcome';

const STEPS = [
  { num: '1', emoji: '📝', label: 'Расскажи о себе', desc: 'Профиль, интересы и цели' },
  { num: '2', emoji: '🧩', label: 'Пройди тест', desc: '7 коротких блоков вопросов' },
  { num: '3', emoji: '🎯', label: 'Получи план', desc: 'Персональная дорожная карта' },
] as const;

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isLoading, firstName } = useWelcome();

  const greeting = firstName ? `Привет, ${firstName}!` : 'Привет!';

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-5 py-12 lg:px-8">
      <div className="w-full max-w-sm lg:max-w-3xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-6xl leading-none select-none" role="img" aria-label="приветствие">👋</span>
          <h1 className="text-display font-black text-primary tracking-tight">
            {greeting}
          </h1>
          <p className="text-body text-secondary leading-relaxed">
            Рады, что ты с нами. Давай вместе<br />разберёмся, что тебе подходит.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          <p className="text-tiny font-extrabold text-muted uppercase tracking-widest">
            Что тебя ждёт:
          </p>
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={cn(
                'flex items-center gap-4 px-4 py-4 rounded-[var(--radius)]',
                'bg-surface border border-default shadow-card',
              )}
            >
              <div className="w-9 h-9 rounded-full bg-brand-subtle flex items-center justify-center shrink-0">
                <span className="text-label font-black text-brand">{step.num}</span>
              </div>
              <span className="text-2xl leading-none select-none" role="img">{step.emoji}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-label font-extrabold text-primary">{step.label}</span>
                <span className="text-small text-secondary">{step.desc}</span>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full lg:max-w-sm lg:mx-auto h-14 rounded-pill text-base font-extrabold shadow-button"
          onClick={() => navigate('/onboarding/profile')}
        >
          Поехали! 🚀
        </Button>

      </div>
    </div>
  );
}
