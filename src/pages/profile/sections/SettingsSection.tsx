import { LogOut, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { LedgerSection } from '../components/LedgerSection';

export interface SettingsSectionProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  prefersReducedMotion: boolean;
  confirmRestart: boolean;
  onRestartRequest: () => void;
  onRestartConfirm: () => void;
  onRestartCancel: () => void;
  onLogout: () => void;
}

// Consolidates the account-level rows the reference groups under one
// "05 · НАСТРОЙКИ" label (sound, restart, logout) — previously three
// separately-carded pieces in ProfilePage, now one ledger row of
// divider-separated rows.
export function SettingsSection({
  soundEnabled,
  toggleSound,
  prefersReducedMotion,
  confirmRestart,
  onRestartRequest,
  onRestartConfirm,
  onRestartCancel,
  onLogout,
}: SettingsSectionProps) {
  return (
    <LedgerSection id="settings" number="05" title="НАСТРОЙКИ">
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[color:var(--border-faint)]">
          <div className="flex items-center gap-3 min-w-0">
            {soundEnabled ? (
              <Volume2 size={18} className="text-brand flex-none" />
            ) : (
              <VolumeX size={18} className="text-muted flex-none" />
            )}
            <div>
              <p className="font-bold text-primary text-body-sm">Звуковые эффекты</p>
              <p className="text-caption text-secondary">
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
              'relative w-11 h-6 rounded-pill transition-colors flex-none',
              soundEnabled ? 'bg-brand' : 'bg-[color:var(--border-strong)]',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[color:var(--paper)] transition-transform',
                soundEnabled && 'translate-x-5',
              )}
            />
          </button>
        </div>

        {confirmRestart ? (
          <div className="py-4 border-b border-[color:var(--border-faint)]">
            <p className="text-body-sm font-bold text-primary mb-1">Начать заново?</p>
            <p className="text-caption text-secondary mb-3">
              Весь текущий прогресс будет сброшен. Ты начнёшь диагностику с самого начала.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex-1" onClick={onRestartCancel}>
                Отмена
              </Button>
              <Button size="sm" className="flex-1 bg-danger! hover:bg-danger/80!" onClick={onRestartConfirm}>
                Начать заново
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 py-4 border-b border-[color:var(--border-faint)]">
            <div>
              <p className="font-bold text-primary text-body-sm">Начать тестирование заново</p>
              <p className="text-caption text-secondary">Результаты и рекомендации будут сброшены</p>
            </div>
            <button
              type="button"
              onClick={onRestartRequest}
              className="text-body-sm font-bold text-danger border border-danger rounded-[var(--radius)] px-3.5 py-1.5 hover:bg-danger-subtle transition-colors flex-none"
            >
              Сбросить
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 pt-4 text-body-sm font-bold text-secondary hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          Выйти из аккаунта
        </button>
      </div>
    </LedgerSection>
  );
}
