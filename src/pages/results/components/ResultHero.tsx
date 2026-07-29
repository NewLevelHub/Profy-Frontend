import { Mascot } from '@/shared/ui/Mascot';
import { getDirectionMascot } from '@/shared/config/directionMascot';

interface ResultHeroProps {
  directionSlug: string;
  directionName: string;
  directionDescription: string;
  matchPercent: number | null;
}

// This is the confirmed final pick (the child already liked it), so the copy
// stays flat and calm on purpose — no "может быть", no reveal-style hedging.
// That hedged framing belongs to the in-test reveal screen (RevealCard),
// which is still mid-decision and reads reveal.message for it; this card
// never touches that field. Ported from
// ProfyDesign templates/{profy-app,profy-mobile}/ResultsScreen.dc.html.
export function ResultHero({ directionSlug, directionName, directionDescription, matchPercent }: ResultHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-5 sm:p-[30px] text-on-brand"
      style={{ background: '#7C3AED' }}
    >
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
        <div
          className="w-[140px] h-[164px] sm:w-[170px] sm:h-[200px] flex-none rounded-[20px] bg-white/16 flex items-end justify-center overflow-hidden"
          aria-hidden="true"
        >
          <Mascot kind={getDirectionMascot(directionSlug)} className="w-[122px] h-[144px] sm:w-[150px] sm:h-[176px]" />
        </div>

        <div className="flex flex-col items-center sm:items-start gap-2 min-w-0">
          <span className="font-extrabold tracking-[.06em] uppercase opacity-85" style={{ fontSize: 13 }}>
            🎯 Похоже, тебе подходит направление
          </span>
          <h2 className="font-black tracking-[-0.01em] text-[26px] sm:text-[34px] leading-tight text-pretty">
            {directionName}
          </h2>
          {directionDescription && (
            <p className="opacity-90 leading-relaxed text-base max-w-2xl text-pretty">{directionDescription}</p>
          )}
          {matchPercent != null && (
            <span
              className="font-extrabold rounded-pill px-4 py-2 mt-2"
              style={{ fontSize: 15, background: 'rgba(255,255,255,0.18)' }}
            >
              Совпадение с твоими ответами — {matchPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
