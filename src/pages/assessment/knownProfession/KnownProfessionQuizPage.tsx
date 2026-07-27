import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, Spinner } from '@/shared/ui';
import { OptionCard } from '../components/OptionCard';
import { useProfileStore } from '@/shared/store/profile';
import { useKnownProfessionTree } from './hooks/useKnownProfessionTree';
import { useKnownProfessionQuiz } from './hooks/useKnownProfessionQuiz';

interface LocationState {
  professionName?: string;
  sphereName?: string;
}

export default function KnownProfessionQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sphereSlug, professionSlug } = useParams<{
    sphereSlug: string;
    professionSlug: string;
  }>();
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');
  const state = (location.state as LocationState | null) ?? {};

  const { data: tree, isLoading: treeLoading } = useKnownProfessionTree();

  const sphere = tree?.find(s => s.slug === sphereSlug);
  const profession = sphere?.professions.find(p => p.slug === professionSlug);

  const professionName =
    state.professionName ??
    (ageGroup === 'junior' && profession?.label_junior
      ? profession.label_junior
      : profession?.name) ??
    professionSlug ??
    'профессия';

  const {
    isLoading: quizLoading,
    error,
    questions,
    questionIndex,
    current,
    isLastQuestion,
    progress,
    selectedIndex,
    setSelectedIndex,
    handleNext,
    submitting,
    finalizeError,
  } = useKnownProfessionQuiz(professionSlug ?? '');

  if (treeLoading || quizLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || (!quizLoading && questions.length === 0)) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-secondary text-center">
          Для «{professionName}» пока нет вопросов. Попробуй другую профессию.
        </p>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-pill"
          onClick={() => navigate(`/assessment/known-profession/${sphereSlug}`)}
        >
          Выбрать другую профессию
        </Button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-6">
        <p className="text-secondary">Вопросы не найдены</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <div className="px-6 pt-6 pb-3">
        <div className="max-w-[620px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/assessment/known-profession/${sphereSlug}`)
              }
              className="text-secondary font-bold text-sm hover:text-primary"
            >
              ← Назад
            </button>
            <span className="text-secondary font-bold text-sm">
              {questionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-active overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-brand-text font-extrabold text-sm">
            {professionName}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        <div className="max-w-[620px] mx-auto pt-6">
          <h2
            className="font-black text-primary mb-6 leading-snug"
            style={{ fontSize: 24 }}
          >
            {current.text}
          </h2>
          <div className="flex flex-col gap-3">
            {current.options.map((opt, i) => (
              <OptionCard
                key={i}
                text={opt.text}
                index={i}
                selected={selectedIndex === i}
                ageGroup={ageGroup}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </div>
          {finalizeError && (
            <p className="text-danger text-sm text-center mt-4">
              Не удалось сохранить результат. Попробуй ещё раз.
            </p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-page/95 backdrop-blur border-t border-default px-6 py-4">
        <div className="max-w-[620px] mx-auto">
          <Button
            size="lg"
            className="w-full h-12 rounded-pill font-extrabold"
            disabled={selectedIndex == null || submitting}
            onClick={handleNext}
          >
            {submitting ? 'Сохраняем…' : isLastQuestion ? 'Узнать результат' : 'Дальше'}
          </Button>
        </div>
      </div>
    </div>
  );
}
