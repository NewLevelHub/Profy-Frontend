import { useNavigate } from 'react-router';
import { LogOut, RotateCcw, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useProfile } from './hooks/useProfile';

const AGE_GROUP_LABELS: Record<string, string> = {
  junior: 'Младший (6–10 лет)',
  middle: 'Средний (11–14 лет)',
  senior: 'Старший (15–18 лет)',
};

function InfoRow({ label, value, last }: { label: string; value: string | number | null | undefined; last?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className={cn('flex items-center justify-between py-2.5', !last && 'border-b border-default')}>
      <span className="text-body text-secondary font-semibold">{label}</span>
      <span className="text-body text-primary font-bold text-right ml-4">{value}</span>
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-caption font-extrabold text-primary mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full text-caption font-semibold bg-brand-subtle text-brand border border-default"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    displayName,
    initial,
    hasSubjects,
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  } = useProfile();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-h1 font-black text-primary">Профиль</h1>

      {/* ── Avatar + identity ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className="w-20 h-20 rounded-full bg-brand flex items-center justify-center shadow-button flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-[34px] font-black text-on-brand leading-none">{initial}</span>
        </div>
        <div className="text-center">
          <p className="text-title font-black text-primary">{displayName}</p>
          {user?.email && (
            <p className="text-caption text-secondary mt-0.5">{user.email}</p>
          )}
          {profile?.age_group && (
            <Badge variant="brand" className="mt-2">
              {AGE_GROUP_LABELS[profile.age_group] ?? profile.age_group}
            </Badge>
          )}
        </div>
      </div>

      {/* ── Personal info ─────────────────────────────────────────── */}
      {profile ? (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-label font-extrabold text-primary">Личные данные</h2>
              <button
                type="button"
                onClick={() => navigate('/onboarding/profile')}
                className="flex items-center gap-1 text-caption font-semibold text-brand hover:opacity-75 transition-opacity"
                aria-label="Редактировать профиль"
              >
                <Pencil size={13} />
                Изменить
              </button>
            </div>
            <InfoRow label="Имя" value={profile.name} />
            <InfoRow label="Возраст" value={profile.age ? `${profile.age} лет` : null} />
            <InfoRow label="Класс" value={profile.grade ? `${profile.grade} класс` : null} />
            <InfoRow label="Город" value={profile.city} />
            <InfoRow label="Страна" value={profile.country} />
            <InfoRow label="Язык обучения" value={profile.language} last />
          </Card>

          {hasSubjects && (
            <Card>
              <h2 className="text-label font-extrabold text-primary mb-4">Предметы</h2>
              <ChipList label="❤️  Нравятся" items={profile.subjects_like} />
              <ChipList label="😕  Не нравятся" items={profile.subjects_dislike} />
              <ChipList label="✅  Даются легко" items={profile.subjects_easy} />
              <ChipList label="🤯  Даются сложно" items={profile.subjects_hard} />
            </Card>
          )}
        </>
      ) : (
        <Card className="flex flex-col items-center py-10 text-center">
          <span className="text-5xl mb-3" aria-hidden="true">📝</span>
          <p className="text-title font-black text-primary mb-1">Профиль не заполнен</p>
          <p className="text-body text-secondary">
            Данные появятся после прохождения настройки профиля
          </p>
        </Card>
      )}

      {/* ── Restart assessment ────────────────────────────────────── */}
      {confirmRestart ? (
        <Card className="border-warning/40 bg-warning-subtle">
          <p className="text-label font-extrabold text-primary mb-1">Начать заново?</p>
          <p className="text-caption text-secondary mb-4">
            Весь текущий прогресс будет сброшен. Ты начнёшь диагностику с самого начала.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleRestartCancel}>
              Отмена
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-danger! hover:bg-danger/80!"
              onClick={handleRestartConfirm}
            >
              Начать заново
            </Button>
          </div>
        </Card>
      ) : (
        <button
          type="button"
          onClick={handleRestartRequest}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-[var(--radius)] bg-brand-subtle text-brand font-bold text-body hover:opacity-80 transition-opacity"
        >
          <RotateCcw size={16} />
          Начать тестирование заново
        </button>
      )}

      {/* ── Logout ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-caption text-secondary font-semibold hover:text-danger transition-colors"
      >
        <LogOut size={14} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
