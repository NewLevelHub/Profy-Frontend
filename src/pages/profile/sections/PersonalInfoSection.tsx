import type { ProfileResponse } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/cn';
import { InfoRow } from '../components/InfoRow';
import { PROFILE_CARD_CLASS } from '../utils/profileStyles';

export interface PersonalInfoSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  return (
    <Card className={PROFILE_CARD_CLASS}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-black text-primary text-[18px] lg:text-subtitle">Личные данные</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-brand font-extrabold hover:opacity-75 transition-opacity text-[15px] whitespace-nowrap"
          aria-label="Редактировать профиль"
        >
          ✏️ Изменить
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <InfoRow label="Возраст" value={profile.age ? `${profile.age} лет` : null} />
        <InfoRow label="Класс" value={profile.grade ? `${profile.grade} класс` : null} />
        <InfoRow label="Город" value={profile.city} />
        <InfoRow label="Страна" value={profile.country} />
        <InfoRow label="Язык обучения" value={profile.language} />
      </div>
    </Card>
  );
}
