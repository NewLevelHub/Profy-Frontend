import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

type MascotVideoProps = {
  src: string;
  className?: string;
  /** RGB distance from pure white before a pixel becomes opaque. Higher = more aggressive. */
  threshold?: number;
  /** Soft falloff past the threshold for cleaner edges. */
  softness?: number;
};

/**
 * Plays a video and chroma-keys out near-white pixels so only the subject remains.
 * Avoids mix-blend-mode, which tints the subject with the page background.
 */
export function MascotVideo({
  src,
  className,
  threshold = 40,
  softness = 48,
}: MascotVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const render = () => {
      if (!running) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        const maxW = 720;
        const scale = Math.min(1, maxW / video.videoWidth);
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        ctx.drawImage(video, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        const data = frame.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Distance from white (255,255,255)
          const dist = Math.max(255 - r, 255 - g, 255 - b);

          if (dist <= threshold) {
            data[i + 3] = 0;
          } else if (dist < threshold + softness) {
            data[i + 3] = Math.round(((dist - threshold) / softness) * 255);
          }
        }

        ctx.putImageData(frame, 0, 0);
      }

      raf = requestAnimationFrame(render);
    };

    const start = () => {
      video.play().catch(() => {});
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      start();
    } else {
      video.addEventListener('loadeddata', start, { once: true });
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      video.removeEventListener('loadeddata', start);
    };
  }, [src, threshold, softness]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-px h-px opacity-0 overflow-hidden pointer-events-none"
        aria-hidden
        tabIndex={-1}
      />
      <canvas
        ref={canvasRef}
        className={cn('pointer-events-none', className)}
        aria-hidden
      />
    </>
  );
}
