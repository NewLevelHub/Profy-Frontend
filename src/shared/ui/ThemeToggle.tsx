import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ResolvedTheme } from '@/shared/lib/theme';

const THEME_ICONS: { value: ResolvedTheme; key: 'light' | 'dark'; Icon: typeof Sun }[] = [
  { value: 'light', key: 'light', Icon: Sun },
  { value: 'dark', key: 'dark', Icon: Moon },
];

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Переключатель темы: две кнопки — светлая и тёмная.
 *
 * Состояний в модуле три (`shared/lib/theme.ts`), но «как в системе» здесь
 * не показано кнопкой: пока пользователь не трогал переключатель, продукт
 * молча следует настройке устройства, а подсвечена та кнопка, которая сейчас
 * в силе. Первый же клик фиксирует выбор и отвязывает продукт от системы.
 *
 * Это осознанный размен: третья кнопка с иконкой монитора — конвенция
 * системных настроек, и аудитории 6–18 она ничего не говорит. Цена размена —
 * вернуться к «как в системе» из интерфейса больше нельзя.
 *
 * Группа радиокнопок, а не набор кнопок: выбирается одно из двух, и
 * скринридер должен объявлять выбор, а не два независимых действия.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const { theme, setChoice } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.groupLabel')}
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 rounded-pill border border-default bg-surface',
        className,
      )}
    >
      {THEME_ICONS.map(({ value, key, Icon }) => {
        const active = theme === value;
        const label = t(`theme.${key}`);
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setChoice(value)}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-pill transition-colors press-scale',
              active ? 'bg-brand text-on-brand' : 'text-muted hover:text-primary hover:bg-hover',
            )}
          >
            <Icon size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
