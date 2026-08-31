import type { ProfileResponse } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';
import { RuledGrid, RuledCell } from '../components/RuledGrid';

export interface PersonalInfoSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  return (
    <LedgerSection
      id="personal"
      number="01"
      title="ЛИЧНЫЕ"
      editLabel="Изменить"
      editAriaLabel="Редактировать личные данные"
      onEdit={onEdit}
    >
      <RuledGrid className="grid grid-cols-2 sm:grid-cols-4">
        <RuledCell label="Возраст" value={`${profile.age} лет`} />
        <RuledCell label="Класс" value={`${profile.grade} класс`} />
        <RuledCell label="Город" value={profile.city} />
        <RuledCell label="Страна" value={profile.country} />
      </RuledGrid>
    </LedgerSection>
  );
}
