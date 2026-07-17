import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { directionsApi } from '@/shared/api/directions';
import { Button, Spinner } from '@/shared/ui';
import { OptionCard } from '../components/OptionCard';
import { useProfileStore } from '@/shared/store/profile';
import {
  getProfessionQuestions,
  scoreProfessionQuiz,
  VERDICT_COPY,
  type MatchVerdict,
} from './questionBanks';

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

  const { data: tree, isLoading } = useQuery({
    queryKey: ['directions', 'tree'],
    queryFn: () => directionsApi.tree(),
  });

  const sphere = tree?.find(s => s.slug === sphereSlug);
  const profession = sphere?.professions.find(p => p.slug === professionSlug);

  const professionName =
    state.professionName ??
    (ageGroup === 'junior' && profession?.label_junior
      ? profession.label_junior
      : profession?.name) ??
    professionSlug ??
    'профессия';

  const questions = useMemo(
    () => getProfessionQuestions(professionSlug ?? '', professionName),
    [professionSlug, professionName],
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [verdict, setVerdict] = useState<MatchVerdict | null>(null);
  const [percent, setPercent] = useState(0);

  const current = questions[questionIndex];
  const progress =
    questions.length === 0
      ? 0
      : ((questionIndex + (selectedIndex != null ? 0.5 : 0)) / questions.length) * 100;

  function handleNext() {
    if (selectedIndex == null || !current) return;

    const nextAnswers = { ...answers, [current.id]: selectedIndex };
    setAnswers(nextAnswers);

    if (questionIndex + 1 >= questions.length) {
      const result = scoreProfessionQuiz(questions, nextAnswers);
      setPercent(result.percent);
      setVerdict(result.verdict);
      return;
    }

    setQuestionIndex(i => i + 1);
    setSelectedIndex(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (verdict) {
    const copy = VERDICT_COPY[verdict];
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-[70px] lg:py-12">
          <div className="max-w-[520px] mx-auto flex flex-col gap-6">
            <div
              className="inline-flex self-start items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px]"
              style={{ fontSize: 13 }}
            >
              Проверка гипотезы
            </div>
            <h1
              className="font-black text-primary tracking-[-0.01em]"
              style={{ fontSize: 32 }}
            >
              {copy.title}
            </h1>
            <p className="text-secondary font-semibold" style={{ fontSize: 17 }}>
              {professionName}: совпадение ≈ {percent}%
            </p>
            <p className="text-primary font-semibold leading-relaxed" style={{ fontSize: 16 }}>
              {copy.body}
            </p>

            <div className="flex flex-col gap-3 mt-4">
              {verdict === 'strong' && (
                <Button
                  size="lg"
                  className="w-full h-12 rounded-pill font-extrabold"
                  onClick={() => navigate('/home')}
                >
                  Отлично, на главную
                </Button>
              )}
              {(verdict === 'partial' || verdict === 'weak') && (
                <Button
                  size="lg"
                  className="w-full h-12 rounded-pill font-extrabold"
                  onClick={() =>
                    navigate(`/assessment/known-profession/${sphereSlug}`)
                  }
                >
                  Выбрать другую в этой сфере
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                className="w-full h-12 rounded-pill"
                onClick={() => navigate('/assessment/goal')}
              >
                Пройти полный тест
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full h-12 rounded-pill"
                onClick={() => navigate('/assessment/known-profession')}
              >
                Выбрать другую сферу
              </Button>
            </div>
          </div>
        </div>
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
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-page/95 backdrop-blur border-t border-default px-6 py-4">
        <div className="max-w-[620px] mx-auto">
          <Button
            size="lg"
            className="w-full h-12 rounded-pill font-extrabold"
            disabled={selectedIndex == null}
            onClick={handleNext}
          >
            {questionIndex + 1 >= questions.length ? 'Узнать результат' : 'Дальше'}
          </Button>
        </div>
      </div>
    </div>
  );
}
