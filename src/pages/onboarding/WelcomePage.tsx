import { useNavigate } from 'react-router';
import { Clock, PauseCircle, Smile } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';

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
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-10 sm:px-4 lg:px-6 lg:py-14">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">

        <div
          className="onboarding-welcome-in flex flex-col gap-7 px-6 py-8 sm:px-10 sm:py-10"
          style={{ background: 'var(--fog)', borderRadius: 'var(--radius)' }}
        >
          <span className={`${typeClass.monoLabel} text-muted`}>
            Перед тестом · Как это будет
          </span>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-col gap-3">
              <Heading level="display-lg" className="text-[color:var(--midnight)]">
                Привет! Разберёмся, что тебе близко
              </Heading>
              <Text variant="body-md" className="text-primary">
                Я буду задавать вопросы и смотреть, что тебе интересно. Правильных и
                неправильных ответов здесь нет, и никто тебя не оценивает — ни я, ни школа,
                ни родители.
              </Text>
            </div>
            <Mascot state="welcome" size={124} interactive className="shrink-0" />
          </div>

          {/* Feature bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4 pt-2">
            {FEATURES.map(({ Icon, title, sub }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon size={26} strokeWidth={1.75} style={{ color: 'var(--pine)' }} aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-md font-semibold text-[color:var(--midnight)]">{title}</span>
                  <span className="text-body-sm font-book text-muted">{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:self-end">
            {/* Assessment record already exists at this point (goal picked,
                0 answered) — leaving here is the same "continue later" state
                as exiting mid-quiz, just before the first question. */}
            <Button
              variant="text"
              onClick={() => navigate('/results')}
            >
              Не сейчас
            </Button>
            <Button
              variant="primary"
              className={cn('w-full sm:w-auto')}
              style={{ minHeight: 48 }}
              onClick={() => navigate('/assessment')}
            >
              Хорошо, начнём
            </Button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
