import { useTranslation } from 'react-i18next';
import { Languages, LogOut, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { LOCALE_SWITCH_ENABLED } from '@/shared/store/locale';
import { Button } from '@/shared/ui/Button';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
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
  const { t } = useTranslation('profile');
  return (
    <LedgerSection id="settings" number="05" title={t('settings.title')}>
      <div className="flex flex-col gap-2.5">
        {/* Rendered only once more than one locale is offered (KZ-603). */}
        {LOCALE_SWITCH_ENABLED && (
          <div className="field-tile flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <Languages size={18} className="text-brand flex-none" />
              <div>
                <p className="font-semibold text-primary text-body-sm">{t('settings.languageLabel')}</p>
                <p className="text-caption text-secondary">{t('settings.languageHint')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        )}

        <div className="field-tile flex items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {soundEnabled ? (
              <Volume2 size={18} className="text-brand flex-none" />
            ) : (
              <VolumeX size={18} className="text-muted flex-none" />
            )}
            <div>
              <p className="font-semibold text-primary text-body-sm">{t('settings.soundLabel')}</p>
              <p className="text-caption text-secondary">
                {prefersReducedMotion && !soundEnabled
                  ? t('settings.soundReducedMotion')
                  : t('settings.soundHint')}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            aria-label={t('settings.soundLabel')}
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
          <div className="field-tile px-4 py-3.5">
            <p className="text-body-sm font-semibold text-primary mb-1">{t('settings.restartConfirmTitle')}</p>
            <p className="text-caption text-secondary mb-3">
              {t('settings.restartConfirmBody')}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex-1" onClick={onRestartCancel}>
                {t('common:cancel')}
              </Button>
              <Button size="sm" className="flex-1 bg-danger! hover:bg-danger/80!" onClick={onRestartConfirm}>
                {t('settings.restartConfirmYes')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="field-tile flex items-center justify-between gap-4 px-4 py-3.5">
            <div>
              <p className="font-semibold text-primary text-body-sm">{t('settings.restartLabel')}</p>
              <p className="text-caption text-secondary">{t('settings.restartHint')}</p>
            </div>
            <button
              type="button"
              onClick={onRestartRequest}
              className="text-body-sm font-semibold text-danger border border-danger rounded-[14px] px-3.5 py-1.5 hover:bg-danger-subtle transition-colors flex-none"
            >
              {t('settings.restartAction')}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="field-tile flex items-center gap-2 px-4 py-3.5 text-body-sm font-semibold text-secondary hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          {t('settings.logout')}
        </button>
      </div>
    </LedgerSection>
  );
}
