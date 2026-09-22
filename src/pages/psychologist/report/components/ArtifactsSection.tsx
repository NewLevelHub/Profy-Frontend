import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import type { ArtifactItem, ArtifactType } from '@/shared/types';

// Same i18n keys AdminUserDetailPage's own ARTIFACT_LABELS already uses
// (`admin:artifact.*`) — one label set for "what a student marked during
// onboarding" across both the admin and psychologist cabinets.
const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  hobby: 'admin:artifact.hobby',
  club: 'admin:artifact.club',
  sport: 'admin:artifact.sport',
  achievement: 'admin:artifact.achievement',
  goal: 'admin:artifact.goal',
  book: 'admin:artifact.book',
  game: 'admin:artifact.game',
  topic: 'admin:artifact.topic',
  profession: 'admin:artifact.profession',
  university: 'admin:artifact.university',
  dream: 'admin:artifact.dream',
};

/**
 * What the student marked about themselves during onboarding (hobbies,
 * clubs, achievements, dreams, ...) — context for the psychologist reading
 * the test results below, distinct from anything the tests themselves
 * measure. Was already flowing into `PsychologistStudentDetailResponse.
 * artifacts` but never rendered anywhere in the psychologist UI.
 */
export function ArtifactsSection({ artifacts }: { artifacts: ArtifactItem[] }) {
  const { t } = useTranslation('admin');

  if (artifacts.length === 0) {
    return (
      <AdminCard title="Артефакты онбординга">
        <AdminEmpty title="Ученик пока ничего не отметил" hint="Хобби, кружки, достижения и другое, что ученик указывает при онбординге, появятся здесь." />
      </AdminCard>
    );
  }

  const byType = artifacts.reduce<Record<string, string[]>>((acc, item) => {
    acc[item.type] = [...(acc[item.type] ?? []), item.value];
    return acc;
  }, {});

  return (
    <AdminCard title="Артефакты онбординга" description="Что ученик отметил о себе при онбординге">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(byType).map(([type, values]) => (
          <div key={type} className="flex flex-col gap-1 min-w-0">
            <span className={cn(MONO_LABEL, 'text-muted')}>
              {ARTIFACT_LABELS[type as ArtifactType] ? t(ARTIFACT_LABELS[type as ArtifactType]) : type}
            </span>
            <div className="flex flex-wrap gap-1 min-w-0">
              {values.map((value, i) => (
                <span
                  key={`${value}-${i}`}
                  className={cn(ADMIN_TEXT, 'max-w-full px-1.5 py-0.5 rounded-[2px] bg-brand-subtle text-brand break-words')}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
