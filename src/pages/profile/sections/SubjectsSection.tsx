import { Pencil } from 'lucide-react';
import type { ProfileResponse } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { ChipList } from '../components/ChipList';

export interface SubjectsSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function SubjectsSection({ profile, onEdit }: SubjectsSectionProps) {
  return (
    <Card className="bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-tiny font-bold uppercase tracking-label text-muted">Предметы</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-[6px] text-brand font-extrabold hover:opacity-75 transition-opacity text-sm"
          aria-label="Редактировать предметы"
        >
          <Pencil size={13} />
          Изменить
        </button>
      </div>
      <ChipList label="Даются легко" items={profile.subjects_easy} accent="green" />
      <ChipList label="Даются сложно" items={profile.subjects_hard} accent="orange" />
      <ChipList label="Нравятся" items={profile.subjects_liked} />
      <ChipList label="Не нравятся" items={profile.subjects_disliked} />
    </Card>
  );
}
