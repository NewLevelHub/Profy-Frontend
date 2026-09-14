import { memo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
import { getIconForCareer } from '../utils/careerIcon';
import type { StudentCareer } from '@/shared/types';

interface CareerCardProps {
  career: StudentCareer;
  showUniversityBtn: boolean;
}

/**
 * Переходы отсюда — настоящие ссылки, а не onClick на карточке: направление
 * можно открыть в новой вкладке и переслать, до него доходит табуляция.
 *
 * «Подробнее о направлении» растянута на всю карточку через `after:inset-0`,
 * поэтому кликается и она сама, и любое место карточки, но в разметке это
 * по-прежнему одна ссылка с адресом. «Найти университеты» лежит выше по
 * z-оси, иначе растянутая ссылка перехватывала бы клики по ней.
 */
export const CareerCard = memo(function CareerCard({ career, showUniversityBtn }: CareerCardProps) {
  const { t } = useTranslation('results');
  const slug = encodeURIComponent(career.slug);

  return (
    <Card className="relative !p-[22px] flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[26px]" aria-hidden="true">{getIconForCareer(career.name)}</span>
        <CareerMatchLadder tier={career.tier} size="sm" />
      </div>
      <div>
        <p className="font-extrabold text-primary text-body-md mb-[3px]">{career.name}</p>
        <p className="text-muted font-medium leading-snug text-caption">{career.why}</p>
      </div>
      {showUniversityBtn && (
        <Link
          to={`/results/directions/${slug}/universities`}
          className="relative z-10 self-start flex items-center gap-1.5 text-brand font-semibold text-caption hover:opacity-75 transition-opacity"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          {t('career.findUniversities')}
        </Link>
      )}
      <Link
        to={`/results/directions/${slug}`}
        className="font-extrabold text-center text-caption hover:opacity-75 transition-opacity after:absolute after:inset-0 after:rounded-[var(--radius)]"
        style={{ color: 'var(--brand)', padding: 4 }}
      >
        {t('career.moreAboutDirection')}
      </Link>
    </Card>
  );
});
