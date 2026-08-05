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
import type {
  AdminAssessmentDetail,
  AdminMotivationResponseItem,
  AdminResponseItem,
  AdminUserDetail,
} from '@/shared/types';

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

const RIASEC_TYPE_LABELS: Record<string, string> = {
  R: 'Реалистичный',
  I: 'Исследовательский',
  A: 'Артистичный',
  S: 'Социальный',
  E: 'Предприимчивый',
  C: 'Конвенциональный',
};

const BIGFIVE_DOMAIN_LABELS: Record<string, string> = {
  N: 'Эмоциональная чувствительность',
  E: 'Экстраверсия',
  O: 'Открытость опыту',
  A: 'Доброжелательность',
  C: 'Добросовестность',
};

const MOTIVATION_LABELS: Record<string, string> = {
  interest: 'Интерес к делу',
  challenge: 'Вызов и рост',
  helping: 'Польза другим',
  freedom: 'Свобода решений',
  money: 'Материальный результат',
  recognition: 'Признание',
  stability: 'Стабильность',
  creation: 'Создавать своё',
  teamwork: 'Команда',
};

function groupLabel(instrument: string, category: string): string {
  if (instrument === 'big_five') return `Big Five: ${BIGFIVE_DOMAIN_LABELS[category] ?? category}`;
  if (instrument === 'riasec') return `RIASEC: ${RIASEC_TYPE_LABELS[category] ?? category}`;
  return 'Прочее';
}

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

function groupResponsesByType(responses: AdminResponseItem[]) {
  const groups = new Map<string, AdminResponseItem[]>();
  for (const response of responses) {
    const key = `${response.instrument}:${response.category}`;
    const items = groups.get(key) ?? [];
    items.push(response);
    groups.set(key, items);
  }
  return groups;
}

function ResponsesSection({ responses }: { responses: AdminResponseItem[] }) {
  if (!responses.length) {
    return (
      <p className="text-secondary font-semibold">Пользователь ещё не ответил на вопросы</p>
    );
  }

  const groups = groupResponsesByType(responses);

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([key, items]) => (
        <div key={key} className="space-y-2">
          <h4 className="font-extrabold text-primary" style={{ fontSize: 15 }}>
            {groupLabel(items[0].instrument, items[0].category)}
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

function MotivationResponsesSection({ responses }: { responses: AdminMotivationResponseItem[] }) {
  if (!responses.length) {
    return <p className="text-secondary font-semibold">Блок мотивации ещё не пройден</p>;
  }
  return (
    <div className="space-y-2">
      {responses.map((item) => (
        <div
          key={item.triplet_index}
          className="p-3 rounded-[var(--radius)] bg-raised border border-default space-y-1"
        >
          <p className="text-sm">
            <span className="font-extrabold text-brand">Важнее всего: </span>
            {item.most_text}{' '}
            <span className="text-muted">({MOTIVATION_LABELS[item.most_category] ?? item.most_category})</span>
          </p>
          <p className="text-sm">
            <span className="font-extrabold text-secondary">Нейтрально: </span>
            {item.neutral_text}{' '}
            <span className="text-muted">({MOTIVATION_LABELS[item.neutral_category] ?? item.neutral_category})</span>
          </p>
          <p className="text-sm">
            <span className="font-extrabold text-danger">Менее всего: </span>
            {item.least_text}{' '}
            <span className="text-muted">({MOTIVATION_LABELS[item.least_category] ?? item.least_category})</span>
          </p>
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
          <InfoRow label="Ответов" value={`${assessment.answered_count} / ${assessment.total_questions}`} />
        </>
      )}

      <div className="space-y-3">
        <h4 className="font-extrabold text-primary">Вопросы и ответы</h4>
        <ResponsesSection responses={assessment.responses} />
      </div>

      <div className="space-y-3">
        <h4 className="font-extrabold text-primary">Мотивация (MOST/LEAST)</h4>
        <MotivationResponsesSection responses={assessment.motivation_responses} />
      </div>

      {assessment.analysis_result && (
        <div className="space-y-3 pt-2">
          <h4 className="font-extrabold text-primary">Результат анализа</h4>
          <p className="text-primary font-medium leading-relaxed">{assessment.analysis_result.summary}</p>
          {assessment.analysis_result.strengths.length > 0 && (
            <ChipList label="Сильные стороны" items={assessment.analysis_result.strengths} />
          )}
          {assessment.analysis_result.careers.length > 0 && (
            <div>
              <p className="font-extrabold text-primary mb-2" style={{ fontSize: 14 }}>Направления</p>
              <div className="space-y-2">
                {assessment.analysis_result.careers.map((career) => (
                  <div key={career.slug} className="p-3 rounded-[var(--radius)] bg-raised border border-default">
                    <p className="font-bold">{career.name}</p>
                    <p className="text-sm text-secondary mt-1">
                      Код {career.holland_code} · совпадение {career.match_score}/6
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {assessment.roadmap && (
        <div className="space-y-3 pt-2">
          <h4 className="font-extrabold text-primary">Roadmap</h4>
          {assessment.roadmap.milestones.map((milestone) => (
            <div key={milestone.horizon} className="p-3 rounded-[var(--radius)] bg-raised border border-default">
              <p className="font-bold">{milestone.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-secondary">
                {milestone.tasks.map((task) => (
                  <li key={`${milestone.horizon}-${task.text}`}>• {task.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
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
