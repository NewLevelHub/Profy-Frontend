import { memo } from 'react';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
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
      <div className="flex items-center justify-between gap-2">
        <span className="text-[26px]" aria-hidden="true">{getIconForCareer(career.name)}</span>
        <CareerMatchLadder tier={career.tier} size="sm" />
      </div>
      <div>
        <p className="font-extrabold text-primary text-body-md mb-[3px]">{career.name}</p>
        <p className="text-muted font-medium leading-snug text-caption">{career.why}</p>
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
        className="font-extrabold text-center text-caption hover:opacity-75 transition-opacity"
        style={{ color: 'var(--brand)', padding: 4 }}
      >
        Подробнее о направлении →
      </button>
    </Card>
  );
});
