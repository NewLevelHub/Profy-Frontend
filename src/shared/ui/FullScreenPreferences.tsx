import { cn } from '@/shared/lib/cn';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

export interface FullScreenPreferencesProps {
  className?: string;
}

/**
 * Theme + language on chrome-free routes (onboarding, assessment intro,
 * certificates edit, 404). Same pair as AuthLayout / TopRail — without it
 * users who land here first cannot switch theme until they reach a tab.
 */
export function FullScreenPreferences({ className }: FullScreenPreferencesProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
