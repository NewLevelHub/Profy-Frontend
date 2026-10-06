import { GraduationCap } from 'lucide-react';
import { LazyMedia } from '../LazyMedia';
import { cardImageUrl } from '@/shared/lib/universityDisplay';

/** An intentional cover when a university has no photo or its photo fails. */
export function UniversityMedia({ name, shortName, src, fullSize = false }: {
  name: string; shortName?: string | null; src: string | null; fullSize?: boolean;
}) {
  const initials = shortName?.trim().slice(0, 6) || name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const tone = Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3;
  const placeholder = <div className="rd-university-placeholder" data-tone={tone} aria-hidden="true">
    <span className="rd-university-monogram">{initials}</span><GraduationCap size={25} />
  </div>;
  return src ? <LazyMedia src={fullSize ? src : cardImageUrl(src)} fallbackSrc={src} alt={name}
    className="rd-university-photo" imgClassName="rd-university-photo-image" fallback={placeholder} /> : placeholder;
}
