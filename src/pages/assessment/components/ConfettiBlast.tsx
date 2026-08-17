import { useMemo } from 'react';

const COLORS = ['var(--brand)', '#A78BFA', '#EC4899', 'var(--accent)', '#10B981', '#3B82F6', '#EF4444', '#F97316'];
const COUNT = 40;

export function ConfettiBlast() {
  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${(Math.random() * 100).toFixed(1)}%`,
        color: COLORS[i % COLORS.length],
        delay: `${(Math.random() * 0.8).toFixed(2)}s`,
        duration: `${(1.8 + Math.random() * 1.4).toFixed(2)}s`,
        size: Math.random() > 0.5 ? 8 : 6,
        isCircle: Math.random() > 0.4,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
    >
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `pf-confetti ${p.duration} ${p.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
