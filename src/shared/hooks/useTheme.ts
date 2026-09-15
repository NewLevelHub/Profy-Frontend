import { useSyncExternalStore } from 'react';
import {
  getThemeChoice,
  resolveTheme,
  setThemeChoice,
  subscribeTheme,
  type ResolvedTheme,
  type ThemeChoice,
} from '@/shared/lib/theme';

// Снимок держит и выбор, и то, во что он развернулся: при выборе «как в
// системе» сам выбор не меняется, а тема — меняется, и по одному choice
// компонент не перерисовался бы на смену системной темы.
function snapshot(): string {
  const choice = getThemeChoice();
  return `${choice}|${resolveTheme(choice)}`;
}

/**
 * Текущий выбор темы и то, во что он разворачивается сейчас.
 * `theme` меняется и без действий пользователя — когда при выборе «как в
 * системе» система переключилась сама.
 */
export function useTheme(): {
  choice: ThemeChoice;
  theme: ResolvedTheme;
  setChoice: (next: ThemeChoice) => void;
} {
  const value = useSyncExternalStore(subscribeTheme, snapshot, () => 'system|light');
  const [choice, theme] = value.split('|') as [ThemeChoice, ResolvedTheme];
  return { choice, theme, setChoice: setThemeChoice };
}
