import { useNavigate } from 'react-router';
import { LogOut, Pencil, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
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

function ChipList({ label, items, accent }: { label: string; items: string[]; accent?: 'green' | 'orange' }) {
  if (!items?.length) return null;
  const chipStyle = accent === 'green'
    ? { background: 'var(--brand-subtle)', color: '#5B21B6' }
    : accent === 'orange'
    ? { background: 'var(--accent-soft)', color: 'var(--accent-text)' }
    : { background: 'var(--brand-subtle)', color: '#5B21B6' };
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-extrabold text-primary mb-2.5" style={{ fontSize: 14 }}>{label}</p>
      <div className="flex flex-wrap gap-[9px]">
        {items.map((item) => (
          <span
            key={item}
            className="px-[15px] py-[7px] rounded-pill font-extrabold"
            style={{ fontSize: 14, ...chipStyle }}
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
  const { soundEnabled, toggleSound, prefersReducedMotion } = useSoundEnabled();

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 space-y-5">
      <h1 className="font-black text-primary text-center tracking-[-0.01em]" style={{ fontSize: 32 }}>Профиль</h1>

      {/* ── Avatar + identity ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 10px 24px rgba(124,58,237,.32)', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="text-center mt-1.5">
          <p className="font-black text-primary" style={{ fontSize: 26 }}>{displayName}</p>
          {user?.email && (
            <p className="text-muted font-semibold mt-0.5" style={{ fontSize: 15 }}>{user.email}</p>
          )}
          {profile?.age_group && (
            <span className="inline-block bg-brand-subtle text-brand-text font-extrabold rounded-pill px-4 py-1.5 mt-[4px]" style={{ fontSize: 13 }}>
              {AGE_GROUP_LABELS[profile.age_group] ?? profile.age_group}
            </span>
          )}
        </div>
      </div>

      {/* ── Personal info ─────────────────────────────────────────── */}
      {profile ? (
        <>
          <Card>
            <div className="flex items-center justify-between pb-[6px] pt-1 mb-1">
              <h2 className="font-black text-primary" style={{ fontSize: 18 }}>Личные данные</h2>
              <button
                type="button"
                onClick={() => navigate('/onboarding/profile')}
                className="flex items-center gap-[6px] text-brand font-extrabold hover:opacity-75 transition-opacity"
                style={{ fontSize: 14 }}
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
              <h2 className="font-black text-primary mb-4" style={{ fontSize: 18 }}>Предметы</h2>
              <ChipList label="✅  Даются легко" items={profile.subjects_easy} accent="green" />
              <ChipList label="🥵  Даются сложно" items={profile.subjects_hard} accent="orange" />
              <ChipList label="❤️  Нравятся" items={profile.subjects_like} />
              <ChipList label="😕  Не нравятся" items={profile.subjects_dislike} />
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
          className="w-full h-14 rounded-pill border-[1.5px] border-strong bg-brand-subtle text-brand font-extrabold transition-colors hover:bg-hover"
          style={{ fontSize: 16 }}
        >
          ↻ Начать тестирование заново
        </button>
      )}

      {/* ── Sound settings ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {soundEnabled ? <Volume2 size={20} className="text-brand flex-shrink-0" /> : <VolumeX size={20} className="text-muted flex-shrink-0" />}
            <div>
              <p className="font-extrabold text-primary" style={{ fontSize: 15 }}>Звуковые эффекты</p>
              <p className="text-secondary font-semibold" style={{ fontSize: 13 }}>
                {prefersReducedMotion && !soundEnabled
                  ? 'Отключены из‑за настройки «уменьшить движение»'
                  : 'Короткие звуки при нажатии кнопок'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            aria-label="Звуковые эффекты"
            onClick={toggleSound}
            className={cn(
              'relative w-12 h-7 rounded-pill transition-colors flex-shrink-0',
              soundEnabled ? 'bg-brand' : 'bg-[#D1D5DB]',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
                soundEnabled && 'translate-x-5',
              )}
            />
          </button>
        </div>

      </Card>

      {/* ── Logout ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-[50px] flex items-center justify-center gap-2 text-muted font-extrabold transition-colors hover:text-danger"
        style={{ fontSize: 15 }}
      >
        <LogOut size={14} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
