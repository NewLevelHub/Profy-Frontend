import type { ProfileResponse } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { ChipList } from '../components/ChipList';
import { PROFILE_CARD_CLASS } from '../utils/profileStyles';

export interface SubjectsSectionProps {
  profile: ProfileResponse;
}

export function SubjectsSection({ profile }: SubjectsSectionProps) {
  return (
    <Card className={PROFILE_CARD_CLASS}>
      <h2 className="font-black text-primary text-[18px] lg:text-subtitle mb-5">Предметы</h2>
      <ChipList label="Даются легко" items={profile.subjects_easy} accent="green" />
      <ChipList label="Даются сложно" items={profile.subjects_hard} accent="orange" />
      <div className="hidden lg:block">
        <ChipList label="Нравятся" items={profile.subjects_like} />
        <ChipList label="Не нравятся" items={profile.subjects_dislike} />
      </div>
    </Card>
  );
}
