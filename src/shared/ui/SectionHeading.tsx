import { cn } from '@/shared/lib/cn';

interface SectionHeadingProps {
  title: string;
  emoji?: string;
  className?: string;
  as?: 'h2' | 'h3';
}

export function SectionHeading({
  title,
  emoji,
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        'font-black text-primary tracking-[-0.01em] text-[24px] leading-tight flex items-center gap-2 mb-4',
        className,
      )}
    >
      {emoji && (
        <span className="text-xl select-none leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      {title}
    </Tag>
  );
}
