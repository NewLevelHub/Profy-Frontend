/**
 * Local prototype: per-profession validation question banks.
 * Later this moves to the backend (seeded banks keyed by leaf slug).
 *
 * Scoring: each option has fitScore 0 | 1 | 2
 *   2 = strongly matches the profession
 *   1 = neutral / partial
 *   0 = mismatch signal
 */

export interface ProfessionQuestionOption {
  text: string;
  fitScore: 0 | 1 | 2;
}

export interface ProfessionQuestion {
  id: string;
  text: string;
  options: ProfessionQuestionOption[];
}

export type MatchVerdict = 'strong' | 'partial' | 'weak';

export interface ProfessionQuizResult {
  score: number;
  maxScore: number;
  percent: number;
  verdict: MatchVerdict;
}

/** Specialized banks — expand per profession over time. */
const SPECIALIZED_BANKS: Record<string, ProfessionQuestion[]> = {
  programmer: [
    {
      id: 'programmer-1',
      text: 'Как тебе идея несколько часов сидеть и собирать что-то из логики и правил?',
      options: [
        { text: 'Обожаю, могу потерять счёт времени', fitScore: 2 },
        { text: 'Нормально, если задача интересная', fitScore: 1 },
        { text: 'Быстро надоедает, хочется двигаться', fitScore: 0 },
      ],
    },
    {
      id: 'programmer-2',
      text: 'Когда что-то ломается — что делаешь первым?',
      options: [
        { text: 'Разбираюсь сам: почему так вышло', fitScore: 2 },
        { text: 'Спрашиваю у кого-то и чиню вместе', fitScore: 1 },
        { text: 'Лучше отложить или попросить сделать другого', fitScore: 0 },
      ],
    },
    {
      id: 'programmer-3',
      text: 'Что ближе в свободное время?',
      options: [
        { text: 'Собрать игру, сайт или бота', fitScore: 2 },
        { text: 'Поиграть / посмотреть туториал', fitScore: 1 },
        { text: 'Что угодно, только не компьютер', fitScore: 0 },
      ],
    },
    {
      id: 'programmer-4',
      text: 'Как относишься к точным правилам и «мелочам», от которых зависит результат?',
      options: [
        { text: 'Люблю, когда всё чётко и работает', fitScore: 2 },
        { text: 'Терплю, если надо', fitScore: 1 },
        { text: 'Раздражает, хочу больше свободы', fitScore: 0 },
      ],
    },
    {
      id: 'programmer-5',
      text: 'Работа в одиночку за экраном vs постоянное общение с людьми — что ближе?',
      options: [
        { text: 'Спокойно один, иногда с командой', fitScore: 2 },
        { text: 'Пополам — и так, и так ок', fitScore: 1 },
        { text: 'Только с людьми, иначе скучно', fitScore: 0 },
      ],
    },
  ],

  surgeon: [
    {
      id: 'surgeon-1',
      text: 'Как ты к ответственности, когда от твоих действий зависит здоровье другого?',
      options: [
        { text: 'Готов учиться и брать такую ответственность', fitScore: 2 },
        { text: 'Пока страшно, но интересно', fitScore: 1 },
        { text: 'Лучше помогать иначе, без такой цены ошибки', fitScore: 0 },
      ],
    },
    {
      id: 'surgeon-2',
      text: 'Мелкая работа руками под давлением времени — как звучит?',
      options: [
        { text: 'Кайф, люблю точные движения', fitScore: 2 },
        { text: 'Смогу, если потренируюсь', fitScore: 1 },
        { text: 'Руки трясутся от одной мысли', fitScore: 0 },
      ],
    },
    {
      id: 'surgeon-3',
      text: 'Долгая учёба (много лет) ради профессии — ок?',
      options: [
        { text: 'Да, если цель ясна', fitScore: 2 },
        { text: 'Сложно, но возможно', fitScore: 1 },
        { text: 'Хочу быстрее выйти в дело', fitScore: 0 },
      ],
    },
    {
      id: 'surgeon-4',
      text: 'Что ближе: разобраться в теле/биологии или в гаджетах и коде?',
      options: [
        { text: 'Тело, биология, как устроен человек', fitScore: 2 },
        { text: 'И то, и другое интересно', fitScore: 1 },
        { text: 'Скорее техника и компьютеры', fitScore: 0 },
      ],
    },
  ],

  psychologist: [
    {
      id: 'psychologist-1',
      text: 'Друзья часто рассказывают тебе о своих проблемах?',
      options: [
        { text: 'Да, и мне правда интересно слушать', fitScore: 2 },
        { text: 'Иногда, если близкий человек', fitScore: 1 },
        { text: 'Редко — мне тяжело чужие эмоции', fitScore: 0 },
      ],
    },
    {
      id: 'psychologist-2',
      text: 'Как тебе идея разбираться, почему люди чувствуют и поступают так, а не иначе?',
      options: [
        { text: 'Очень близко, постоянно об этом думаю', fitScore: 2 },
        { text: 'Интересно иногда', fitScore: 1 },
        { text: 'Скучновато, лучше делать руками', fitScore: 0 },
      ],
    },
    {
      id: 'psychologist-3',
      text: 'Долгий разговор один на один vs шумная группа — что комфортнее?',
      options: [
        { text: 'Глубокий разговор с одним человеком', fitScore: 2 },
        { text: 'Зависит от настроения', fitScore: 1 },
        { text: 'Только в компании, иначе неловко', fitScore: 0 },
      ],
    },
    {
      id: 'psychologist-4',
      text: 'Готов ли ты много учиться про психику и держать чужие секреты?',
      options: [
        { text: 'Да, это кажется важным', fitScore: 2 },
        { text: 'Наверное да, если понравится', fitScore: 1 },
        { text: 'Не хочу чужих тяжёлых историй', fitScore: 0 },
      ],
    },
  ],

  'graphic-designer': [
    {
      id: 'gd-1',
      text: 'Замечаешь ли ты шрифты, цвета и «как выглядит» вокруг?',
      options: [
        { text: 'Постоянно, глаз цепляется сам', fitScore: 2 },
        { text: 'Иногда, если красиво', fitScore: 1 },
        { text: 'Почти не обращаю внимания', fitScore: 0 },
      ],
    },
    {
      id: 'gd-2',
      text: 'Сделать плакат / обложку / аватарку с нуля — как звучит?',
      options: [
        { text: 'Хочу прямо сейчас', fitScore: 2 },
        { text: 'Могу попробовать', fitScore: 1 },
        { text: 'Лучше пусть сделает другой', fitScore: 0 },
      ],
    },
    {
      id: 'gd-3',
      text: 'Критика «переделай ещё раз» — твоя реакция?',
      options: [
        { text: 'Ок, сделаю лучше — это часть работы', fitScore: 2 },
        { text: 'Немного обидно, но переживу', fitScore: 1 },
        { text: 'Очень тяжело, лучше без правок', fitScore: 0 },
      ],
    },
    {
      id: 'gd-4',
      text: 'Что ближе: придумать картинку или посчитать/написать код?',
      options: [
        { text: 'Придумать визуал', fitScore: 2 },
        { text: 'И то и другое', fitScore: 1 },
        { text: 'Скорее логика и цифры', fitScore: 0 },
      ],
    },
  ],
};

/** Generic validation bank when a specialized one is not ready yet. */
function buildGenericBank(professionName: string): ProfessionQuestion[] {
  return [
    {
      id: 'generic-1',
      text: `Насколько уверенно ты чувствуешь, что «${professionName}» — это твоё?`,
      options: [
        { text: 'Очень уверенно, давно об этом думаю', fitScore: 2 },
        { text: 'Нравится идея, но ещё проверяю', fitScore: 1 },
        { text: 'Скорее просто звучит круто', fitScore: 0 },
      ],
    },
    {
      id: 'generic-2',
      text: `Что ты уже делал(а) похожее на работу «${professionName}»?`,
      options: [
        { text: 'Пробовал(а) сам(а): кружок, проект, практика', fitScore: 2 },
        { text: 'Смотрел(а) видео / читал(а) про это', fitScore: 1 },
        { text: 'Пока только название нравится', fitScore: 0 },
      ],
    },
    {
      id: 'generic-3',
      text: 'Если представить обычный рабочий день в этой профессии — что чувствуешь?',
      options: [
        { text: 'Воодушевление, хочется попробовать', fitScore: 2 },
        { text: 'Интересно, но есть сомнения', fitScore: 1 },
        { text: 'Скорее усталость или скуку от мысли', fitScore: 0 },
      ],
    },
    {
      id: 'generic-4',
      text: 'Готов(а) ли ты вкладываться в учёбу и практику ради этой цели?',
      options: [
        { text: 'Да, готов(а) много учиться', fitScore: 2 },
        { text: 'Если не слишком долго', fitScore: 1 },
        { text: 'Хочу быстрый результат без долгой подготовки', fitScore: 0 },
      ],
    },
    {
      id: 'generic-5',
      text: 'Если друг предложит другую «модную» профессию — что сделаешь?',
      options: [
        { text: 'Останусь при своём выборе', fitScore: 2 },
        { text: 'Подумаю, сравню', fitScore: 1 },
        { text: 'Легко переключусь на новое', fitScore: 0 },
      ],
    },
  ];
}

export function getProfessionQuestions(
  slug: string,
  professionName: string,
): ProfessionQuestion[] {
  return SPECIALIZED_BANKS[slug] ?? buildGenericBank(professionName);
}

export function hasSpecializedBank(slug: string): boolean {
  return slug in SPECIALIZED_BANKS;
}

export function scoreProfessionQuiz(
  questions: ProfessionQuestion[],
  answers: Record<string, number>,
): ProfessionQuizResult {
  let score = 0;
  let maxScore = 0;

  for (const q of questions) {
    maxScore += 2;
    const optionIndex = answers[q.id];
    if (optionIndex == null) continue;
    const option = q.options[optionIndex];
    if (option) score += option.fitScore;
  }

  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  let verdict: MatchVerdict = 'weak';
  if (percent >= 70) verdict = 'strong';
  else if (percent >= 40) verdict = 'partial';

  return { score, maxScore, percent, verdict };
}

export const VERDICT_COPY: Record<
  MatchVerdict,
  { title: string; body: string }
> = {
  strong: {
    title: 'Похоже, выбор совпадает',
    body: 'Твои ответы хорошо стыкуются с этой профессией. Можно смотреть, как к ней идти.',
  },
  partial: {
    title: 'Есть совпадения, но есть и вопросы',
    body: 'Часть ответов близка, часть — нет. Имеет смысл посмотреть соседние профессии в той же сфере или пройти полный тест.',
  },
  weak: {
    title: 'Пока слабо совпадает',
    body: 'Название может нравиться, но по ответам это пока не очень похоже на тебя. Давай посмотрим другие варианты.',
  },
};
