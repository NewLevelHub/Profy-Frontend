import { useNavigate } from 'react-router';
import { Clock, PauseCircle, Smile } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button, Mascot } from '@/shared/ui';

// ── Pre-test intro ────────────────────────────────────────────────────────
// Shown exactly once per account, right before a user's first-ever
// assessment attempt — not right after registration (see useGoalSelection's
// "wasFirstEver" check, which routes here instead of straight to
// /assessment only the first time). By this point profile setup and
// artifacts are already done, so this is purely "here's how the test
// itself works," not a map of the rest of onboarding.

const FEATURES = [
  { Icon: Clock, title: 'Около 15 минут', sub: 'Спокойный темп, без секундомера' },
  { Icon: PauseCircle, title: 'Можно прерваться', sub: 'Всё сохранится, продолжишь позже' },
  { Icon: Smile, title: 'Никто не проверяет', sub: 'Нет правильных и неправильных ответов' },
] as const;

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page flex flex-col items-center px-4 py-10 lg:py-14">
      <div className="w-full max-w-2xl flex flex-col gap-8">

        <div
          className="onboarding-welcome-in flex flex-col gap-7 px-6 py-8 sm:px-10 sm:py-10"
          style={{ background: 'var(--fog)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius)' }}
        >
          <span className="font-mono text-[11px] tracking-[.1em] uppercase text-muted">
            Перед тестом · Как это будет
          </span>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <Mascot state="welcome" size={124} className="shrink-0" />
            <div className="flex flex-col gap-3">
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 38,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  color: 'var(--midnight)',
                }}
              >
                Привет, я Профи. Разберёмся, что тебе близко
              </h1>
              <p className="text-[17px] leading-relaxed" style={{ color: 'var(--ink)' }}>
                Я буду задавать вопросы и смотреть, что тебе интересно. Правильных и
                неправильных ответов здесь нет, и никто тебя не оценивает — ни я, ни школа,
                ни родители.
              </p>
            </div>
          </div>

          {/* Feature bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4 pt-2">
            {FEATURES.map(({ Icon, title, sub }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon size={26} strokeWidth={1.75} style={{ color: 'var(--pine)' }} aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[16px] font-semibold" style={{ color: 'var(--midnight)' }}>{title}</span>
                  <span className="text-[15px]" style={{ color: 'var(--mute)' }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            className={cn('w-full sm:w-auto sm:self-start')}
            style={{ minHeight: 48 }}
            onClick={() => navigate('/assessment')}
          >
            Хорошо, начнём
          </Button>
        </div>

      </div>
    </div>
  );
}
