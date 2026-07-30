import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import type { AdminUserParams } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { adminApi } from '@/shared/api/admin';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Badge } from '@/shared/ui/Badge';
import type {
  AdminAssessmentDetail,
  AdminSubjectScoreItem,
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

const AKINATOR_STATUS_LABELS: Record<string, string> = {
  in_progress: 'В процессе',
  converged_single: 'Сошёлся к одному',
  converged_cluster: 'Кластер',
  exhausted_ceiling: 'Потолок',
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#EDE9FE] last:border-b-0 text-[15px] font-semibold">
      <span className="text-secondary">{label}</span>
      <span className="text-primary font-extrabold text-right ml-4">{value}</span>
    </div>
  );
}

function ChipList({ label, items, variant = 'brand' }: { label: string; items: string[]; variant?: any }) {
  if (!items.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-extrabold text-primary mb-2 text-[14px]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-extrabold text-primary mb-3 text-[16px]">
      {children}
    </h4>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-secondary font-semibold">{text}</p>;
}

function AkinatorSessionSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const session = assessment.akinator_session;

  return (
    <div className="space-y-4">
      <SubsectionTitle>Акинатор — сессия</SubsectionTitle>
      {!session ? (
        <EmptyState text="Сессия акинатора не начата" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#F5F3FF] rounded-[14px] p-3.5">
              <div className="text-[13px] font-bold text-secondary">Статус сессии</div>
              <div className="text-[17px] font-extrabold text-primary mt-0.5">
                {AKINATOR_STATUS_LABELS[session.status] ?? session.status}
              </div>
            </div>
            <div className="bg-[#F5F3FF] rounded-[14px] p-3.5">
              <div className="text-[13px] font-bold text-secondary">Шагов</div>
              <div className="text-[17px] font-extrabold text-primary mt-0.5">{session.step}</div>
            </div>
            <div className="bg-[#F5F3FF] rounded-[14px] p-3.5">
              <div className="text-[13px] font-bold text-secondary">Отклонённые направления</div>
              <div className="text-[17px] font-extrabold text-primary mt-0.5">
                {(session.rejected_leaves ?? []).length === 0 ? (
                  <span className="text-[#9CA3AF]">нет</span>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(session.rejected_leaves ?? []).map((slug) => (
                      <Badge key={slug} variant="default">{slug}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[16px] font-extrabold text-primary mb-2.5">Топ-5 направлений</div>
            {(session.top_directions ?? []).length === 0 ? (
              <span className="text-secondary font-semibold">нет данных</span>
            ) : (
              <div className="flex flex-col gap-2">
                {(session.top_directions ?? []).slice(0, 5).map(({ slug, name, probability }) => (
                  <div key={slug} className="flex items-center justify-between gap-3 bg-[#F5F3FF] rounded-xl px-4 py-2.5">
                    <span className="text-[15px] font-bold text-primary">{name ?? slug}</span>
                    <span className="text-[15px] font-extrabold text-[#6D28D9]">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AkinatorAnswersSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const answers = [...(assessment.akinator_session?.answers ?? [])].sort((a, b) => a.step - b.step);

  return (
    <div className="space-y-3">
      <SubsectionTitle>История ответов</SubsectionTitle>
      {answers.length === 0 ? (
        <EmptyState text="Ответов нет" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {answers.map((answer) => (
            <div
              key={answer.step}
              className="bg-[#F5F3FF] rounded-[14px] p-[14px_18px]"
            >
              <div className="text-[13px] font-bold text-[#9CA3AF]">Шаг {answer.step}</div>
              <div className="text-[16px] font-extrabold text-primary mt-0.5 leading-snug">{answer.question_text}</div>
              <div className="text-[15px] font-semibold text-[#4B5563] mt-1">
                <span className="text-[#9CA3AF]">Ответ: </span>
                {answer.selected_answer === null ? (
                  <em className="text-secondary">Не знаю</em>
                ) : (
                  <span className="font-extrabold text-primary">{answer.selected_answer}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const session = assessment.akinator_session;
  const liked = session?.liked ?? null;

  return (
    <div className="border-2 border-[#EDE9FE] rounded-[16px] p-4 flex flex-col gap-2 bg-white">
      <div className="text-[15px] font-extrabold text-primary mb-1">Фидбэк по сессии</div>
      {liked === null ? (
        <EmptyState text="Фидбэк не оставлен" />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[15px] font-semibold">
            <span className="text-[#6B7280]">Оценка</span>
            <span className="font-extrabold text-primary">{liked ? '👍 Понравилось' : '👎 Не понравилось'}</span>
          </div>
          {session?.feedback_note && (
            <div className="flex justify-between items-start text-[15px] font-semibold gap-4">
              <span className="text-[#6B7280] shrink-0">Заметка</span>
              <span className="font-extrabold text-primary text-right break-words">{session.feedback_note}</span>
            </div>
          )}
          {session?.feedback_at && (
            <div className="flex justify-between items-center text-[15px] font-semibold">
              <span className="text-[#6B7280]">Дата</span>
              <span className="font-extrabold text-primary">{formatDate(session.feedback_at)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SimulationsSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const logs = assessment.profession_simulations ?? [];

  return (
    <div className="border-2 border-[#EDE9FE] rounded-[16px] p-4 flex flex-col gap-2 bg-white">
      <div className="text-[15px] font-extrabold text-primary mb-1">Симуляции профессий</div>
      {logs.length === 0 ? (
        <EmptyState text="Симуляций не было" />
      ) : (
        <div className="flex flex-col gap-1">
          {logs.map((log) => (
            <div
              key={log.leaf_slug}
              className="flex justify-between items-center text-[15px] font-semibold py-1 border-b border-default last:border-b-0 gap-4"
            >
              <span className="text-primary truncate">{log.leaf_name ?? log.leaf_slug}</span>
              <span className={cn('font-extrabold text-sm shrink-0', log.accepted ? 'text-[#15803D]' : 'text-[#C2410C]')}>
                {log.accepted ? '✓ Принял' : '✕ Отклонил'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectReadinessSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const readiness = assessment.subject_readiness;

  return (
    <div className="border-2 border-[#EDE9FE] rounded-[16px] p-4 flex flex-col gap-3 bg-white">
      <div className="text-[15px] font-extrabold text-primary">
        Тест готовности по предметам · {readiness?.direction_name ?? readiness?.direction_slug ?? '—'}
      </div>
      {!readiness ? (
        <EmptyState text="Тест готовности не проходился" />
      ) : (
        <>
          {readiness.subject_scores.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {readiness.subject_scores.map((item: AdminSubjectScoreItem) => (
                <div
                  key={item.subject}
                  className="bg-[#F5F3FF] rounded-xl p-3 flex flex-col justify-between"
                >
                  <p className="text-[15px] font-extrabold text-primary">{item.subject}</p>
                  <div className="text-[13px] font-semibold text-secondary mt-1">
                    Уровень {item.level ?? '—'} · интерес {item.interest ?? '—'}
                    {item.is_strength && (
                      <span className="block text-[#15803D] font-extrabold text-[11px] mt-0.5">Сильная сторона</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SelectedDirectionSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  return (
    <div className="space-y-2 border-2 border-[#EDE9FE] rounded-[16px] p-4 bg-white">
      <div className="text-[15px] font-extrabold text-primary">Выбранное направление</div>
      {!assessment.selected_direction_slug ? (
        <EmptyState text="Направление не выбрано" />
      ) : (
        <p className="font-extrabold text-[#6D28D9] text-[18px]">
          {assessment.selected_direction_name ?? assessment.selected_direction_slug}
        </p>
      )}
    </div>
  );
}

function RoadmapsSection({ assessment }: { assessment: AdminAssessmentDetail }) {
  const roadmaps = assessment.roadmaps ?? [];

  return (
    <div className="space-y-3 border-2 border-[#EDE9FE] rounded-[16px] p-4 bg-white">
      <div className="text-[15px] font-extrabold text-primary">Роадмапы</div>
      {roadmaps.length === 0 ? (
        <EmptyState text="Роадмапов нет" />
      ) : (
        <div className="space-y-3">
          {roadmaps.map((roadmap, idx) => (
            <div
              key={roadmap.direction_slug ?? idx}
              className="p-3.5 rounded-[var(--radius)] bg-[#F5F3FF] border border-default space-y-3"
            >
              <div>
                <p className="font-extrabold text-primary">{roadmap.direction_name ?? roadmap.direction_slug}</p>
                {roadmap.created_at && (
                  <p className="text-xs text-secondary font-semibold mt-0.5">
                    {formatDate(roadmap.created_at)}
                  </p>
                )}
              </div>
              {(roadmap.skills_to_build ?? []).length > 0 && (
                <div>
                  <p className="text-secondary font-semibold text-xs mb-1.5">Навыки для развития</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skills_to_build.map((skill) => (
                      <Badge key={skill} variant="brand">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(roadmap.subjects_now ?? []).length > 0 && (
                <div>
                  <p className="text-secondary font-semibold text-xs mb-1.5">Предметы сейчас</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.subjects_now.map((item) => (
                      <Badge key={item.subject} variant="brand">{item.subject}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(roadmap.starter_actions ?? []).length > 0 && (
                <div>
                  <p className="text-secondary font-semibold text-xs mb-1.5">С чего начать</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.starter_actions.map((action) => (
                      <Badge key={action} variant="brand">{action}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentDetailPanel({ assessment, compact }: { assessment: AdminAssessmentDetail; compact?: boolean }) {
  return (
    <div className={cn('space-y-6', compact ? 'pt-4 border-t border-default' : '')}>
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

      <AkinatorSessionSection assessment={assessment} />
      <AkinatorAnswersSection assessment={assessment} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeedbackSection assessment={assessment} />
        <SimulationsSection assessment={assessment} />
      </div>

      <SubjectReadinessSection assessment={assessment} />
      <SelectedDirectionSection assessment={assessment} />
      <RoadmapsSection assessment={assessment} />
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<AdminUserParams>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AdminAssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'with_result' | 'without_result'>('all');

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
    return <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-5 text-red-600 font-semibold">{error || 'Пользователь не найден'}</div>;
  }

  const artifactsByType = user.artifacts.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.value);
    return acc;
  }, {});

  const totalAssessments = user.assessments.length;
  const withResult = user.assessments.filter((a) => a.has_result).length;
  const abandoned = user.assessments.filter((a) => a.status === 'in_progress').length;
  const selectedDirection = selectedAssessment?.selected_direction_name ?? selectedAssessment?.selected_direction_slug ?? '—';
  const emailInitials = user.email.slice(0, 2).toUpperCase();

  const filteredAssessments = user.assessments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'with_result') return a.has_result;
    return !a.has_result;
  });

  return (
    <PageContainer className="space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          to={ROUTES.adminUsers}
          className="font-sans text-[15px] font-extrabold text-[#6D28D9] bg-white border-2 border-[#DDD6FE] border-b-[4px] border-b-[#DDD6FE] rounded-full px-5 py-2.5 hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          ← Назад
        </Link>
        <div className="w-[52px] h-[52px] rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[19px] font-extrabold shrink-0 shadow-card">
          {emailInitials}
        </div>
        <div>
          <h1 className="text-[28px] font-extrabold text-primary leading-tight tracking-tight break-all">
            {user.email}
          </h1>
          <p className="text-[15px] font-semibold text-secondary mt-1">
            Зарегистрирован {formatDate(user.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Тестирований</div>
          <div className="text-[28px] font-extrabold mt-1 text-primary">{totalAssessments}</div>
        </div>
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">С результатом</div>
          <div className="text-[28px] font-extrabold mt-1 text-[#22C55E]">{withResult}</div>
        </div>
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Брошено</div>
          <div className="text-[28px] font-extrabold mt-1 text-[#EA580C]">{abandoned}</div>
        </div>
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[18px] p-[18px]">
          <div className="text-[13px] font-bold text-secondary">Выбранное направление</div>
          <div className="text-[17px] font-extrabold mt-1.5 text-[#6D28D9] leading-snug">{selectedDirection}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-6.5">
          <SubsectionTitle>Аккаунт</SubsectionTitle>
          <div className="flex flex-col mt-2">
            <InfoRow label="Email" value={user.email} />
            <div className="flex items-center justify-between py-2.5 border-b border-[#EDE9FE] last:border-[#EDE9FE] text-[15px] font-semibold">
              <span className="text-secondary">Верифицирован</span>
              <Badge variant={user.is_verified ? 'success' : 'default'}>{user.is_verified ? 'Да' : 'Нет'}</Badge>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#EDE9FE] last:border-[#EDE9FE] text-[15px] font-semibold">
              <span className="text-secondary">Активен</span>
              <Badge variant={user.is_active ? 'success' : 'default'}>{user.is_active ? 'Да' : 'Нет'}</Badge>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#EDE9FE] last:border-b-0 text-[15px] font-semibold">
              <span className="text-secondary">Админ</span>
              <Badge variant={user.is_admin ? 'brand' : 'default'}>{user.is_admin ? 'Да' : 'Нет'}</Badge>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-6.5">
          <SubsectionTitle>Профиль</SubsectionTitle>
          {user.profile ? (
            <div className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-4 border-b border-[#EDE9FE] pb-4">
                <div>
                  <div className="text-[13px] font-semibold text-secondary">Имя</div>
                  <div className="text-[17px] font-extrabold mt-0.5">{user.profile.name}</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-secondary">Возраст · класс</div>
                  <div className="text-[17px] font-extrabold mt-0.5">{user.profile.age} · {user.profile.grade} класс</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-secondary">Город</div>
                  <div className="text-[17px] font-extrabold mt-0.5">{user.profile.city}</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-secondary">Язык</div>
                  <div className="text-[17px] font-extrabold mt-0.5">{user.profile.language}</div>
                </div>
              </div>
              <div className="space-y-3">
                <ChipList label="Даются легко" items={profileSubjects(user.profile, 'easy')} variant="success" />
                <ChipList label="Даются сложно" items={profileSubjects(user.profile, 'hard')} variant="warning" />
              </div>
            </div>
          ) : (
            <p className="text-secondary font-semibold mt-2">Профиль не заполнен</p>
          )}
        </div>
      </div>

      {Object.keys(artifactsByType).length > 0 && (
        <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-6.5">
          <SubsectionTitle>Артефакты</SubsectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
            {Object.entries(artifactsByType).map(([type, values]) => (
              <div key={type}>
                <div className="text-[14px] font-bold text-secondary mb-2">
                  {ARTIFACT_LABELS[type] ?? type}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((val) => (
                    <Badge key={val} variant="brand">
                      {val}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-[#DDD6FE] border-b-[4px] rounded-[22px] p-6.5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SubsectionTitle>Тестирования</SubsectionTitle>
            <p className="text-[14px] font-semibold text-secondary mt-0.5">
              История прохождений и ответы по каждой сессии
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'text-[14px] font-extrabold px-[18px] py-[9px] rounded-full cursor-pointer transition-all border-2',
                filter === 'all'
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-[#DDD6FE] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:bg-[#EFECFF]'
              )}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('with_result')}
              className={cn(
                'text-[14px] font-extrabold px-[18px] py-[9px] rounded-full cursor-pointer transition-all border-2',
                filter === 'with_result'
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-[#DDD6FE] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:bg-[#EFECFF]'
              )}
            >
              С результатом
            </button>
            <button
              onClick={() => setFilter('without_result')}
              className={cn(
                'text-[14px] font-extrabold px-[18px] py-[9px] rounded-full cursor-pointer transition-all border-2',
                filter === 'without_result'
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-[#DDD6FE] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:bg-[#EFECFF]'
              )}
            >
              Без результата
            </button>
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <p className="text-secondary font-semibold">Тесты не найдены</p>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map((assessment, index) => {
              const isOpen = selectedAssessmentId === assessment.id;
              return (
                <div key={assessment.id} className="transition-all">
                  {!isOpen ? (
                    <button
                      type="button"
                      onClick={() => openAssessment(assessment.id)}
                      className="w-full text-left bg-[#F5F3FF] border-2 border-[#EDE9FE] rounded-[16px] p-4 flex justify-between items-center gap-3.5 hover:border-[#C4B5FD] transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-[17px] font-extrabold text-primary">
                          {GOAL_LABELS[assessment.goal] ?? assessment.goal}
                        </span>
                        <span className="text-[14px] font-bold text-[#9CA3AF] ml-2">
                          #{user.assessments.length - index}
                        </span>
                        <div className="text-[14px] font-semibold text-secondary mt-0.5">
                          {STATUS_LABELS[assessment.status] ?? assessment.status} · {formatDate(assessment.created_at)}
                        </div>
                      </div>
                      <span className="text-[14px] font-extrabold text-[#6D28D9] flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        {assessment.has_result ? 'есть результат' : 'без результата'} ⌄
                      </span>
                    </button>
                  ) : (
                    <div className="border-2 border-[#7C3AED] rounded-[18px] p-5 flex flex-col gap-4.5 bg-white shadow-pop">
                      <button
                        type="button"
                        onClick={() => openAssessment(assessment.id)}
                        className="w-full text-left flex justify-between items-center gap-3.5 hover:opacity-80 transition-all cursor-pointer"
                      >
                        <div>
                          <span className="text-[19px] font-extrabold text-primary">
                            {GOAL_LABELS[assessment.goal] ?? assessment.goal}
                          </span>
                          <span className="text-[14px] font-bold text-[#9CA3AF] ml-2">
                            #{user.assessments.length - index}
                          </span>
                          <div className="text-[14px] font-semibold text-secondary mt-0.5">
                            {STATUS_LABELS[assessment.status] ?? assessment.status} · {formatDate(assessment.created_at)}
                          </div>
                        </div>
                        <span className="text-[14px] font-extrabold text-[#6D28D9] flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          {assessment.has_result ? 'есть результат' : 'без результата'} ⌃
                        </span>
                      </button>
                      <div className="mt-2">
                        {assessmentLoading ? (
                          <p className="text-secondary font-semibold py-4 text-center">Загрузка данных...</p>
                        ) : selectedAssessment ? (
                          <AssessmentDetailPanel assessment={selectedAssessment} compact />
                        ) : (
                          <p className="text-red-600 font-semibold py-4 text-center">Не удалось загрузить тест</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
