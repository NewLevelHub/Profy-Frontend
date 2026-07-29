import { Mascot } from '@/shared/ui/Mascot';
import { Button } from '@/shared/ui/Button';

interface ResultEmptyStateProps {
  onStart: () => void;
  onHome: () => void;
}

// Shown when there's no completed assessment yet (or the result isn't
// ready) — a CTA back into the test, not a 404/blank screen. Ported from
// ProfyDesign templates/{profy-app,profy-mobile}/LockedScreen.dc.html.
export function ResultEmptyState({ onStart, onHome }: ResultEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 gap-4 text-center">
      <div
        className="w-[124px] h-[154px] sm:w-[150px] sm:h-[186px] rounded-[22px] bg-brand-subtle flex items-end justify-center overflow-hidden"
        aria-hidden="true"
      >
        <Mascot kind="psy" className="w-[108px] h-[134px] sm:w-[130px] sm:h-[162px]" />
      </div>
      <h2 className="font-black text-primary tracking-[-0.02em] text-[26px] sm:text-[30px] text-pretty">
        Сначала пройди тест
      </h2>
      <p className="text-secondary font-semibold text-[15px] sm:text-base max-w-[52ch] text-pretty">
        Результат и план развития появятся, когда ты закончишь тестирование — оно занимает около 10 минут
        и проходится один раз.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <Button size="lg" onClick={onStart}>
          Пройти тест
        </Button>
        <Button size="lg" variant="ghost" onClick={onHome}>
          На главную
        </Button>
      </div>
    </div>
  );
}
