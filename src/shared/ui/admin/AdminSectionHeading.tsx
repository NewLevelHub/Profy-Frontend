import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/typography/Text';

interface AdminSectionHeadingProps {
  title: string;
  className?: string;
}

/**
 * Card-level heading for admin screens. Not `SectionHeading` and not
 * `Heading` (display) — admin density reserves Bricolage for the page <h1>.
 */
export function AdminSectionHeading({ title, className }: AdminSectionHeadingProps) {
  return (
    <Text variant="caption" as="h2" className={cn('font-bold text-primary', className)}>
      {title}
    </Text>
  );
}
