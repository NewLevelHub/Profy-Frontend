interface ResultHeroProps {
  directionName: string;
  directionDescription: string;
}

// This is the confirmed final pick (the child already liked it), so the copy
// stays flat and calm on purpose — no "может быть", no reveal-style hedging.
// That hedged framing belongs to the in-test reveal screen (RevealCard),
// which is still mid-decision and reads reveal.message for it; this card
// never touches that field.
export function ResultHero({ directionName, directionDescription }: ResultHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-[30px_32px] text-on-brand"
      style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 14px 32px rgba(124,58,237,.26)' }}
    >
      <div
        className="absolute bottom-[-60px] right-[-30px] w-[220px] h-[220px] rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      />
      <div className="relative flex flex-col gap-3">
        <span className="font-extrabold tracking-[.06em] uppercase opacity-85" style={{ fontSize: 13 }}>
          🎯 Похоже, тебе подходит направление:
        </span>
        <h2 className="font-black tracking-[-0.01em] text-[32px] leading-tight">{directionName}</h2>
        {directionDescription && (
          <p className="opacity-90 leading-relaxed text-base max-w-2xl">{directionDescription}</p>
        )}
      </div>
    </div>
  );
}
