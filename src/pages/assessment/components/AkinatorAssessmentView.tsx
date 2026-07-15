import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { OptionCard } from './OptionCard';
import { useAkinatorAssessment } from '../hooks/useAkinatorAssessment';

export function AkinatorAssessmentView() {
  const {
    isLoading,
    saving,
    error,
    question,
    reveal,
    step,
    isResolving,
    selectedIndex,
    transitioning,
    exitConfirmOpen,
    questionProgress,
    ageGroup,
    handleOptionSelect,
    handleResolve,
    handleReject,
    handleFeedback,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAkinatorAssessment();

  const [note, setNote] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedFeedbackValue, setSelectedFeedbackValue] = useState<boolean | null>(null);

  const headerTitle = question
    ? `Вопрос ${step + 1}`
    : reveal
    ? 'Результаты подобраны!'
    : 'Анализ';

  const onFeedbackSubmit = (liked: boolean) => {
    handleFeedback(liked, note.trim() || null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-page">
      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      {exitConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-dialog-title"
        >
          <div className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 id="exit-dialog-title" className="text-title font-black text-primary">
                Выйти из теста?
              </h2>
              <p className="text-body text-secondary">
                Прогресс сохранён, ты сможешь продолжить позже.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full rounded-pill"
                onClick={confirmExit}
              >
                Выйти
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-pill"
                onClick={cancelExit}
              >
                Остаться в тесте
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-7 pt-[18px] pb-4"
        style={{ background: 'rgba(245,243,255,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between max-w-[980px] mx-auto mb-[14px]">
          <div className="w-[38px] h-[38px] flex-shrink-0" />

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
              🧠 Акинатор · {headerTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExit}
            aria-label="Выйти из теста"
            className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-danger-subtle hover:text-danger flex-shrink-0"
            style={{ boxShadow: '0 2px 8px rgba(30,27,75,.06)', fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* ── Progress bar ──────────────────────────────────── */}
        <div className="max-w-[980px] mx-auto">
          <div className="h-3 bg-brand-subtle rounded-pill overflow-hidden relative">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{
                width: `${reveal ? 100 : questionProgress}%`,
                background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
              }}
              role="progressbar"
              aria-valuenow={Math.round(reveal ? 100 : questionProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогресс Акинатора"
            />
          </div>
          <div className="flex justify-between mt-2 mx-0.5" style={{ fontSize: 12 }}>
            <span className="font-bold text-muted">
              {reveal
                ? 'Диагностика завершена'
                : isResolving
                ? 'Разрешение противоречий'
                : 'Поиск подходящих профессий'}
            </span>
            <span className="font-bold text-muted">
              {reveal ? '100%' : `${Math.round(questionProgress)}%`}
            </span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6">
        {isLoading || saving ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            {saving && <p className="text-secondary font-bold">Секунду, сохраняем...</p>}
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-body text-danger font-semibold">{error}</p>
            <Button onClick={retry}>Попробовать снова</Button>
          </div>
        ) : question ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className={cn(
                'flex-1 transition-opacity duration-300',
                transitioning ? 'opacity-0' : 'opacity-100'
              )}
            >
              <div className="flex items-center gap-[10px] mb-2">
                <span className="text-[26px]">⚡</span>
                <span className="font-extrabold text-brand tracking-[.02em]" style={{ fontSize: 14 }}>
                  {isResolving ? 'РАЗРЕШЕНИЕ ПРОТИВОРЕЧИЙ' : 'АНАЛИЗ ИНТЕРЕСОВ'}
                </span>
              </div>

              <h2
                className={cn(
                  'font-black text-primary mb-8 leading-snug tracking-[-0.01em]',
                  ageGroup === 'junior' ? 'text-title' : 'text-subtitle'
                )}
                style={{ fontSize: 30 }}
              >
                {question.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                {question.options.map(opt => (
                  <OptionCard
                    key={opt.index}
                    text={opt.text}
                    index={opt.index}
                    selected={selectedIndex === opt.index}
                    ageGroup={ageGroup}
                    onPress={() => handleOptionSelect(opt.index)}
                  />
                ))}

                {/* I don't know button styled as OptionCard but placed separately */}
                <button
                  type="button"
                  onClick={() => handleOptionSelect(null)}
                  className={cn(
                    'w-full flex items-center justify-center gap-[14px] text-center border-2 px-5 py-[18px] transition-all duration-150 md:col-span-2 mt-4',
                    selectedIndex === null
                      ? 'border-brand bg-active-tint'
                      : 'border-dashed border-default bg-surface/50 text-secondary hover:border-[#C4B5FD]'
                  )}
                  style={{ borderRadius: 18 }}
                >
                  <span className="font-bold text-secondary" style={{ fontSize: 16 }}>
                    🤷‍♂️ Затрудняюсь ответить / Не знаю
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : reveal ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div
              className="w-full max-w-xl bg-surface rounded-[24px] p-6 lg:p-8 flex flex-col gap-6"
              style={{
                boxShadow: '0 10px 30px rgba(30,27,75,.04)',
                border: '1px solid #EDE9FE',
              }}
            >
              <div className="text-center flex flex-col items-center gap-3">
                <span className="text-5xl select-none animate-bounce">✨</span>
                <h2 className="font-black text-primary tracking-[-0.02em]" style={{ fontSize: 32 }}>
                  Результат готов!
                </h2>
                <p className="text-secondary leading-relaxed font-medium" style={{ fontSize: 16 }}>
                  {reveal.message}
                </p>
              </div>

              {/* Matched Directions Cards */}
              <div className="flex flex-col gap-3">
                {reveal.leaves.map((leaf, index) => (
                  <div
                    key={leaf.slug}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-brand bg-active-tint/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{index === 0 ? '🏆' : '⭐'}</span>
                      <span className="font-bold text-primary text-subtitle">{leaf.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedFeedbackValue(true);
                          setShowFeedbackForm(true);
                        }}
                      >
                        Подходит 👍
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(leaf.slug)}
                        className="text-danger hover:bg-danger-subtle"
                      >
                        Исключить ✕
                      </Button>
                    </div>
                  </div>
                ))}

                {reveal.backups.length > 0 && (
                  <div className="mt-4">
                    <p className="font-bold text-secondary text-caption mb-2">Другие возможные варианты:</p>
                    <div className="flex flex-col gap-2">
                      {reveal.backups.map(leaf => (
                        <div
                          key={leaf.slug}
                          className="flex items-center justify-between p-3 rounded-lg border border-default bg-surface/50"
                        >
                          <span className="font-semibold text-secondary">{leaf.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(leaf.slug)}
                            className="text-danger"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cluster resolve button */}
              {reveal.status === 'cluster' && (
                <div className="p-4 rounded-xl bg-brand-subtle flex flex-col gap-3 text-center items-center mt-2">
                  <p className="text-secondary font-bold text-caption">
                    Найдено несколько похожих направлений. Хочешь ответить на несколько дополнительных вопросов, чтобы сузить выбор?
                  </p>
                  <Button onClick={handleResolve} className="rounded-pill px-6" style={{ background: '#7C3AED' }}>
                    ⚖️ Уточнить выбор
                  </Button>
                </div>
              )}

              {/* General feedback prompt if the user hasn't clicked feedback yet */}
              {!showFeedbackForm && (
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedFeedbackValue(false);
                      setShowFeedbackForm(true);
                    }}
                    className="text-danger"
                  >
                    👎 Ничего не подошло
                  </Button>
                </div>
              )}

              {/* Feedback Form */}
              {showFeedbackForm && (
                <div className="flex flex-col gap-4 border-t pt-5 mt-2">
                  <p className="font-bold text-primary text-center">
                    {selectedFeedbackValue
                      ? 'Рады, что подошло! Напиши пару слов о своем выборе:'
                      : 'Жаль, что не подошло. Напиши, что именно пошло не так:'}
                  </p>
                  <textarea
                    className="w-full min-h-[100px] border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-primary"
                    placeholder="Твой комментарий..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                  <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={() => setShowFeedbackForm(false)}>
                      Отмена
                    </Button>
                    <Button onClick={() => onFeedbackSubmit(selectedFeedbackValue ?? false)}>
                      Сохранить и завершить
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
