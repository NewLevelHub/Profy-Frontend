import { Pencil } from 'lucide-react';
import type { ProfileResponse } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { InfoRow } from '../components/InfoRow';

export interface PersonalInfoSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  return (
    <Card className="bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-tiny font-bold uppercase tracking-label text-muted">Личные данные</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-[6px] text-brand font-extrabold hover:opacity-75 transition-opacity text-sm"
          aria-label="Редактировать профиль"
        >
          <Pencil size={13} />
          Изменить
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InfoRow label="Возраст" value={profile.age ? `${profile.age} лет` : null} />
        <InfoRow label="Класс" value={profile.grade ? `${profile.grade} класс` : null} />
        <InfoRow label="Город" value={profile.city} />
        <InfoRow label="Страна" value={profile.country} />
        <InfoRow label="Язык обучения" value={profile.language} className="col-span-2" />
      </div>
    </Card>
  );
}
