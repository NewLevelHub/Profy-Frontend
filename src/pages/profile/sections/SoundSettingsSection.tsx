import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';

export interface SoundSettingsSectionProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  prefersReducedMotion: boolean;
}

export function SoundSettingsSection({ soundEnabled, toggleSound, prefersReducedMotion }: SoundSettingsSectionProps) {
  return (
    <Card className="bg-transparent">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {soundEnabled ? <Volume2 size={20} className="text-brand flex-shrink-0" /> : <VolumeX size={20} className="text-muted flex-shrink-0" />}
          <div>
            <p className="font-extrabold text-primary text-label">Звуковые эффекты</p>
            <p className="text-secondary font-semibold text-caption">
              {prefersReducedMotion && !soundEnabled
                ? 'Отключены из‑за настройки «уменьшить движение»'
                : 'Короткие звуки при нажатии кнопок'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          aria-label="Звуковые эффекты"
          onClick={toggleSound}
          className={cn(
            'relative w-12 h-7 rounded-pill transition-colors flex-shrink-0',
            soundEnabled ? 'bg-brand' : 'bg-[#D1D5DB]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
              soundEnabled && 'translate-x-5',
            )}
          />
        </button>
      </div>
    </Card>
  );
}
