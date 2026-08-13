import { memo } from 'react';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { CAREER_TIER_LABELS } from '@/shared/config/constants';
import { getIconForCareer } from '../utils/careerIcon';
import type { StudentCareer } from '@/shared/types';

interface CareerCardProps {
  career: StudentCareer;
  showUniversityBtn: boolean;
  onDetail: (c: StudentCareer) => void;
  onUniversity: (c: StudentCareer) => void;
}

export const CareerCard = memo(function CareerCard({
  career,
  showUniversityBtn,
  onDetail,
  onUniversity,
}: CareerCardProps) {
  return (
    <Card
      onClick={() => onDetail(career)}
      className="!p-[22px] flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="flex items-center justify-between">
        <span className="text-[26px]" aria-hidden="true">{getIconForCareer(career.name)}</span>
        <span
          className="font-extrabold text-brand bg-brand-subtle rounded-pill"
          style={{ fontSize: 11.5, padding: '5px 12px' }}
        >
          {CAREER_TIER_LABELS[career.tier]}
        </span>
      </div>
      <div>
        <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 16 }}>{career.name}</p>
        <p className="text-muted font-medium leading-snug" style={{ fontSize: 13 }}>{career.why}</p>
      </div>
      {showUniversityBtn && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUniversity(career); }}
          className="flex items-center gap-1.5 text-brand font-semibold text-caption hover:opacity-75 transition-opacity"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Найти университеты
        </button>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDetail(career); }}
        className="font-extrabold text-center hover:opacity-75 transition-opacity"
        style={{ fontSize: 12.5, color: 'var(--brand)', padding: 4 }}
      >
        Подробнее о направлении →
      </button>
    </Card>
  );
});
