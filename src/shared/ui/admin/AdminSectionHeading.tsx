import { cn } from '@/shared/lib/cn';

interface AdminSectionHeadingProps {
  title: string;
  className?: string;
}

/**
 * Card-level heading for admin screens. Deliberately NOT `SectionHeading` —
 * that component hardcodes `font-display` (Bricolage Grotesque), and the
 * admin density rule reserves Bricolage for exactly ONE heading per screen
 * (the page `<h1>` title). Every other heading, including every card title
 * here, stays on the product's sans body font (`font-sans` → Inter, which is
 * what's actually wired under the "Instrument Sans" name used in the design
 * spec — see `src/styles/tailwind.css`/`index.html`, no separate Instrument
 * Sans font file exists in this codebase).
 */
export function AdminSectionHeading({ title, className }: AdminSectionHeadingProps) {
  return (
    <h2 className={cn('font-sans font-bold text-[14px] leading-[1.35] text-primary', className)}>
      {title}
    </h2>
  );
}
