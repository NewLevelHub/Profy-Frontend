import { Card } from '@/shared/ui/Card';

export interface ProfileHeroProps {
  displayName: string;
  initial: string;
  email?: string;
  ageGroupLabel?: string;
}

export function ProfileHero({ displayName, initial, email, ageGroupLabel }: ProfileHeroProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-6 lg:flex-row lg:items-center lg:gap-6 lg:py-7 lg:text-left" elevated>
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 10px 24px rgba(124,58,237,.32)', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}
        aria-hidden="true"
      >
        {initial}
      </div>
      <div className="text-center lg:text-left">
        <p className="font-black text-primary text-h1">{displayName}</p>
        {email && (
          <p className="text-muted font-semibold mt-0.5 text-label">{email}</p>
        )}
      </div>
      {ageGroupLabel && (
        <span className="inline-block bg-brand-subtle text-brand-text font-extrabold rounded-pill px-4 py-1.5 text-caption lg:ml-auto">
          {ageGroupLabel}
        </span>
      )}
    </Card>
  );
}
