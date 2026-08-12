import { GraduationCap } from 'lucide-react';
import { CAREER_TIER_LABELS } from '@/shared/config/constants';
import type { StudentCareer } from '@/shared/types';

interface TopCareerHeroProps {
  career: StudentCareer;
  showUniversityBtn: boolean;
  onDetail: (career: StudentCareer) => void;
  onUniversity: (career: StudentCareer) => void;
}

export function TopCareerHero({ career, showUniversityBtn, onDetail, onUniversity }: TopCareerHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-[30px_32px] text-on-brand"
      style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 14px 32px rgba(124,58,237,.26)' }}
    >
      <div className="absolute bottom-[-60px] right-[-30px] w-[220px] h-[220px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="relative">
        <div className="font-extrabold tracking-[.06em] uppercase mb-2 opacity-85" style={{ fontSize: 13 }}>
          🎯 {CAREER_TIER_LABELS[career.tier]}
        </div>
        <h2 className="font-black mb-2 tracking-[-0.01em] text-[32px] leading-tight">{career.name}</h2>
        <p className="font-semibold opacity-90 mb-5 leading-relaxed text-base max-w-2xl">{career.why}</p>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onDetail(career)}
            className="h-[50px] px-7 rounded-pill font-extrabold transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: '#fff', color: '#5B21B6', fontSize: 15, border: 'none' }}
          >
            Подробнее →
          </button>
          {showUniversityBtn && (
            <button
              type="button"
              onClick={() => onUniversity(career)}
              className="h-[50px] px-[26px] rounded-pill font-extrabold transition-colors"
              style={{ border: '1.5px solid rgba(255,255,255,.55)', background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 15 }}
            >
              <GraduationCap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Посмотреть университеты
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
