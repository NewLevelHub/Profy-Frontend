import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/cn';
import { PROFILE_CARD_CLASS } from '../utils/profileStyles';

export interface ProfileHeroProps {
  displayName: string;
  initial: string;
  email?: string;
  ageGroupLabel?: string;
}

export function ProfileHero({ displayName, initial, email, ageGroupLabel }: ProfileHeroProps) {
  return (
    <Card className={cn(PROFILE_CARD_CLASS, 'flex flex-col items-center gap-3 py-7 text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left')}>
      <div
        className={cn(
          'w-[88px] h-[88px] rounded-full flex items-center justify-center flex-shrink-0 font-black leading-none',
          'bg-brand-subtle text-brand text-[34px]',
          'lg:w-24 lg:h-24 lg:text-[42px] lg:text-on-brand lg:bg-brand lg:shadow-[0_10px_24px_rgba(124,58,237,.32)]',
        )}
        aria-hidden="true"
      >
        {initial}
      </div>

      <div className="w-full lg:flex-1">
        <p className="font-black text-primary text-[26px] leading-tight lg:text-h1">{displayName}</p>
        {email && (
          <p className="text-muted font-semibold mt-1 text-[15px] lg:text-label">{email}</p>
        )}
        {ageGroupLabel && (
          <span className="inline-block bg-brand-subtle text-brand-text font-extrabold rounded-pill px-4 py-1.5 text-caption mt-3 lg:mt-2 lg:ml-0">
            {ageGroupLabel}
          </span>
        )}
      </div>
    </Card>
  );
}
