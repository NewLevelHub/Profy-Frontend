import type { ProfileResponse } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { ChipList } from '../components/ChipList';

export interface SubjectsSectionProps {
  profile: ProfileResponse;
}

export function SubjectsSection({ profile }: SubjectsSectionProps) {
  return (
    <Card>
      <h2 className="font-mono text-tiny font-bold uppercase tracking-label text-muted mb-4">Предметы</h2>
      <ChipList label="Даются легко" items={profile.subjects_easy} accent="green" />
      <ChipList label="Даются сложно" items={profile.subjects_hard} accent="orange" />
      <ChipList label="Нравятся" items={profile.subjects_liked} />
      <ChipList label="Не нравятся" items={profile.subjects_disliked} />
    </Card>
  );
}
