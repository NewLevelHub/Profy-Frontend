import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { adminApi } from '@/shared/api/admin';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { AdminAssessmentDetail, AdminResponseItem, AdminUserDetail } from '@/shared/types';

const GOAL_LABELS: Record<string, string> = {
  explore: 'Исследовать',
  profession: 'Выбрать профессию',
  university: 'Поступить в вуз',
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'В процессе',
  completed: 'Завершён',
};

const ARTIFACT_LABELS: Record<string, string> = {
  hobby: 'Хобби',
  club: 'Кружки',
  sport: 'Спорт',
  achievement: 'Достижения',
  goal: 'Мечты',
  book: 'Книги',
  game: 'Игры',
  topic: 'Темы',
  profession: 'Профессии',
  university: 'Вузы',
  dream: 'Мечты',
};

const BLOCK_LABELS: Record<string, string> = {
  interests: 'Интересы',
  thinking: 'Мышление',
  personality: 'Личность',
  motivation: 'Мотивация',
  academic: 'Учёба',
  directions: 'Направления',
  goal_clarification: 'Уточнение цели',
  university: 'Вуз',
  wellbeing: 'Благополучие',
  unknown: 'Прочее',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function profileSubjects(
  profile: AdminUserDetail['profile'],
  kind: 'liked' | 'disliked' | 'easy' | 'hard',
): string[] {
  if (!profile) return [];
  const record = profile as unknown as Record<string, string[] | undefined>;
  const backendKey = `subjects_${kind}`;
  const frontendKey = kind === 'liked' ? 'subjects_like' : kind === 'disliked' ? 'subjects_dislike' : `subjects_${kind}`;
  return record[backendKey] ?? record[frontendKey] ?? [];
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-default last:border-b-0">
      <span className="text-secondary font-semibold">{label}</span>
      <span className="text-primary font-bold text-right ml-4">{value}</span>
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-extrabold text-primary mb-2" style={{ fontSize: 14 }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-pill font-extrabold text-sm"
            style={{ background: 'var(--brand-subtle)', color: '#5B21B6' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function groupResponsesByBlock(responses: AdminResponseItem[]) {
  const groups = new Map<string, AdminResponseItem[]>();
  for (const response of responses) {
    const block = response.block || 'unknown';
    const items = groups.get(block) ?? [];
    items.push(response);
    groups.set(block, items);
  }
  return groups;
}

function ResponsesSection({ responses }: { responses: AdminResponseItem[] }) {
  if (!responses.length) {
    return (
      <p className="text-secondary font-semibold">Пользователь ещё не ответил на вопросы</p>
    );
  }

  const groups = groupResponsesByBlock(responses);

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([block, items]) => (
        <div key={block} className="space-y-2">
          <h4 className="font-extrabold text-primary" style={{ fontSize: 15 }}>
            {BLOCK_LABELS[block] ?? block}
          </h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.question_id}-${index}`}
                className="p-3 rounded-[var(--radius)] bg-raised border border-default"
              >
                <p className="font-bold text-primary">{item.question_text}</p>
                <p className="text-sm text-secondary mt-2">
                  <span className="font-semibold text-brand">Ответ: </span>
                  {item.selected_answer_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AssessmentDetailPanel({ assessment, compact }: { assessment: AdminAssessmentDetail; compact?: boolean }) {
  return (
    <div className={cn('space-y-4', compact ? 'pt-4 border-t border-default' : '')}>
      {!compact && (
        <div>
          <h3 className="font-black text-primary" style={{ fontSize: 20 }}>
            Тест: {GOAL_LABELS[assessment.goal] ?? assessment.goal}
          </h3>
          <p className="text-secondary font-semibold text-sm mt-1">
            {STATUS_LABELS[assessment.status] ?? assessment.status} · {formatDate(assessment.created_at)}
          </p>
        </div>
      )}

      {!compact && (
        <>
          <InfoRow label="Ответов" value={assessment.responses.length} />
          <InfoRow label="Текущий блок" value={assessment.current_block} />
        </>
      )}

      <div className="space-y-3">
        <h4 className="font-extrabold text-primary">Вопросы и ответы</h4>
        <ResponsesSection responses={assessment.responses} />
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AdminAssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const id = userId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getUser(id);
        if (cancelled) return;
        setUser(data);
        if (data.assessments.length > 0) {
          void openAssessment(data.assessments[0].id, true);
        }
      } catch {
        if (!cancelled) setError('Не удалось загрузить пользователя');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function openAssessment(assessmentId: string, forceOpen = false) {
    if (!forceOpen && selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId(null);
      setSelectedAssessment(null);
      return;
    }

    setSelectedAssessmentId(assessmentId);
    setAssessmentLoading(true);
    setSelectedAssessment(null);
    try {
      const data = await adminApi.getAssessment(assessmentId);
      setSelectedAssessment(data);
    } catch {
      setSelectedAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>;
  }

  if (error || !user) {
    return <Card className="text-red-600 font-semibold">{error || 'Пользователь не найден'}</Card>;
  }

  const artifactsByType = user.artifacts.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.value);
    return acc;
  }, {});

  return (
    <PageContainer className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>
        <PageHeader
          title={user.email}
          subtitle={`Зарегистрирован ${formatDate(user.created_at)}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionHeading title="Аккаунт" className="mb-3" />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Верифицирован" value={user.is_verified ? 'Да' : 'Нет'} />
          <InfoRow label="Активен" value={user.is_active ? 'Да' : 'Нет'} />
          <InfoRow label="Админ" value={user.is_admin ? 'Да' : 'Нет'} />
        </Card>

        <Card>
          <SectionHeading title="Профиль" className="mb-3" />
          {user.profile ? (
            <>
              <InfoRow label="Имя" value={user.profile.name} />
              <InfoRow label="Возраст" value={user.profile.age} />
              <InfoRow label="Класс" value={user.profile.grade} />
              <InfoRow label="Город" value={user.profile.city} />
              <InfoRow label="Страна" value={user.profile.country} />
              <InfoRow label="Язык" value={user.profile.language} />
              <InfoRow label="Возрастная группа" value={user.profile.age_group} />
              <div className="pt-3">
                <ChipList label="Нравятся предметы" items={profileSubjects(user.profile, 'liked')} />
                <ChipList label="Не нравятся" items={profileSubjects(user.profile, 'disliked')} />
                <ChipList label="Легко даются" items={profileSubjects(user.profile, 'easy')} />
                <ChipList label="Сложные" items={profileSubjects(user.profile, 'hard')} />
              </div>
            </>
          ) : (
            <p className="text-secondary font-semibold">Профиль не заполнен</p>
          )}
        </Card>
      </div>

      {Object.keys(artifactsByType).length > 0 && (
        <Card>
          <SectionHeading title="Артефакты" className="mb-3" />
          {Object.entries(artifactsByType).map(([type, values]) => (
            <ChipList key={type} label={ARTIFACT_LABELS[type] ?? type} items={values} />
          ))}
        </Card>
      )}

      <Card>
        <SectionHeading title="Тестирования" className="mb-3" />
        {user.assessments.length === 0 ? (
          <p className="text-secondary font-semibold">Тесты не начинались</p>
        ) : (
          <div className="space-y-2">
            {user.assessments.map((assessment, index) => {
              const isOpen = selectedAssessmentId === assessment.id;
              return (
                <div
                  key={assessment.id}
                  className={cn(
                    'rounded-[var(--radius)] border transition-colors',
                    isOpen ? 'border-brand bg-surface' : 'border-default bg-raised',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openAssessment(assessment.id)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {GOAL_LABELS[assessment.goal] ?? assessment.goal}
                          <span className="text-secondary font-semibold ml-2" style={{ fontSize: 13 }}>
                            #{user.assessments.length - index}
                          </span>
                        </p>
                        <p className="text-sm text-secondary mt-0.5">
                          {STATUS_LABELS[assessment.status] ?? assessment.status} · {formatDate(assessment.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-extrabold text-secondary">
                          {assessment.has_result ? 'есть результат' : 'без результата'}
                        </span>
                        <ChevronDown
                          size={18}
                          className={cn('text-secondary transition-transform', isOpen && 'rotate-180')}
                        />
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-4">
                      {assessmentLoading ? (
                        <p className="text-secondary font-semibold py-2">Загрузка вопросов...</p>
                      ) : selectedAssessment ? (
                        <AssessmentDetailPanel assessment={selectedAssessment} compact />
                      ) : (
                        <p className="text-red-600 font-semibold py-2">Не удалось загрузить тест</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
