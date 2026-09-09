import { cn } from '@/shared/lib/cn';
import { Text } from './typography/Text';

interface SectionHeadingProps {
  title: string;
  emoji?: string;
  className?: string;
  as?: 'h2' | 'h3';
}

/**
 * Repeating section title — body role, not display. The display face is
 * reserved for the page <h1> (see Heading). Card/section titles stay Onest.
 */
export function SectionHeading({
  title,
  emoji,
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <Text
      variant="body-lg"
      as={Tag}
      className={cn(
        'font-semibold flex items-center gap-2 mb-4 text-[color:var(--text-heading)]',
        className,
      )}
    >
      {emoji && (
        <span className="text-xl select-none leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      {title}
    </Text>
  );
}
