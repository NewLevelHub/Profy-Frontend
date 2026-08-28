import type { ProfileResponse } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';
import { ChipList } from '../components/ChipList';

export interface SubjectsSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function SubjectsSection({ profile, onEdit }: SubjectsSectionProps) {
  return (
    <LedgerSection
      id="subjects"
      number="02"
      title="ПРЕДМЕТЫ"
      editLabel="Изменить"
      editAriaLabel="Редактировать предметы"
      onEdit={onEdit}
    >
      <div className="flex flex-col gap-4">
        <ChipList label="Люблю" items={profile.subjects_liked} variant="solid" />
        <ChipList label="Даются легко" items={profile.subjects_easy} variant="outline" />
        <ChipList label="Не люблю" items={profile.subjects_disliked} variant="muted" />
        <ChipList label="Даются трудно" items={profile.subjects_hard} variant="muted" />
      </div>
    </LedgerSection>
  );
}
