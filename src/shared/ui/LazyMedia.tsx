import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyMediaProps {
  src: string;
  alt: string;
  /** Wrapper classes — must give the box its size (the <img> fills it). */
  className?: string;
  imgClassName?: string;
  /** Shown before the image is mounted and after it's released. */
  fallback: ReactNode;
  /** Swapped in if `src` fails to load (e.g. a resized variant that 404s). */
  fallbackSrc?: string;
  /** Mount the real <img> once the box is within this many px of the viewport. */
  activateMargin?: number;
  /** Release it again (free the decoded bitmap) once it's this far away. */
  releaseMargin?: number;
}

/**
 * `<img>` whose decoded bitmap is only ever alive while the element is near
 * the viewport. `loading="lazy"` alone keeps every image that ever scrolled
 * into view decoded in memory — in a 50-card grid of ~1-2 MP university
 * photos that's hundreds of MB of bitmaps, and the memory + per-frame
 * compositing pressure is what makes the list stutter even with
 * `content-visibility:auto` on the cards.
 *
 * Two observers with different rootMargins give hysteresis: mount when the
 * box enters the inner band, unmount only once it leaves the much wider
 * outer band, so a small scroll-back never thrashes the image on and off.
 * The number of live <img> elements stays bounded no matter how long the
 * list is — effectively per-image virtualization without restructuring the
 * grid into a windowing library.
 */
export function LazyMedia({
  src,
  alt,
  className,
  imgClassName,
  fallback,
  fallbackSrc,
  activateMargin = 800,
  releaseMargin = 2400,
}: LazyMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: `${activateMargin}px` },
    );
    const far = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setMounted(false);
      },
      { rootMargin: `${releaseMargin}px` },
    );

    near.observe(el);
    far.observe(el);
    return () => {
      near.disconnect();
      far.disconnect();
    };
  }, [activateMargin, releaseMargin]);

  const effectiveSrc = erroredSrc === src && fallbackSrc ? fallbackSrc : src;

  return (
    <div ref={ref} className={className}>
      {mounted ? (
        <img
          key={effectiveSrc}
          src={effectiveSrc}
          alt={alt}
          className={imgClassName}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={() => {
            if (effectiveSrc === src && fallbackSrc) setErroredSrc(src);
          }}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
