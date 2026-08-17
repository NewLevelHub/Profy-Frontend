import type { InterestMapItem } from '@/shared/types';

export interface SphereCardData {
  code: string;
  title: string;
  /** ПОПРОБОВАТЬ — a concrete, low-stakes thing to try this month. */
  tryNow: string;
  /** ПОНАБЛЮДАТЬ — something to pay attention to while trying it. */
  observe: string;
}

/**
 * "Sphere" data-source investigation (scenario A / explore):
 *
 * `InterestMapItem.sphere` (result-v2 contract §5, already fetched for
 * every user via `report.interest_map`) IS real backend data naming each
 * RIASEC/MI sphere, and `level` is a real signal for ranking them — so the
 * SELECTION of which 4 spheres to show, and their title, is genuinely
 * data-driven (top 4 items by level, `high` before `medium` before `low`).
 *
 * What does NOT exist anywhere in the API: concrete "попробовать/
 * понаблюдать" suggestion copy per sphere. `interest_map` only carries a
 * shared free-text `interest_map_note` for the whole map, not per-item
 * suggestions, and there's no separate "spheres" endpoint distinct from the
 * 6 RIASEC / 8 MI categories. This dictionary is therefore hand-authored
 * client-side content keyed by the same `code` values RIASEC_ICONS/MI_ICONS
 * already use — a real content-source gap, flagged rather than presented as
 * if it were personalized. If/when the backend adds per-sphere suggestion
 * text, swap this dictionary for that field directly.
 */
const SPHERE_SUGGESTIONS: Record<string, { tryNow: string; observe: string }> = {
  // RIASEC
  R: { tryNow: 'Собери или почини что-то своими руками за выходные', observe: 'Нравится ли сам процесс работы руками, а не только результат' },
  I: { tryNow: 'Разбери один вопрос «как это устроено» до конца, без готового ответа', observe: 'Хочется ли докопаться до сути, даже когда никто не просит' },
  A: { tryNow: 'Сделай что-то своё — рисунок, текст, видео, музыку — без цели «для оценки»', observe: 'Легко ли начинать без чёткого плана, что получится' },
  S: { tryNow: 'Помоги кому-то разобраться в теме, которая тебе самому понятна', observe: 'Заряжает объяснение другим или, наоборот, утомляет' },
  E: { tryNow: 'Предложи и доведи до конца свою идею в компании друзей или в классе', observe: 'Комфортно ли брать на себя решение и ответственность' },
  C: { tryNow: 'Наведи порядок в системе — расписании, папке, списке — и продержи его неделю', observe: 'Даёт ли структура спокойствие или быстро становится скучно' },
  // MI (junior)
  verbal: { tryNow: 'Напиши короткую историю или веди дневник неделю подряд', observe: 'Легко ли находить слова, чтобы объяснить, что чувствуешь' },
  logical: { tryNow: 'Реши головоломку или задачку, на которую нет быстрого ответа', observe: 'Нравится ли искать закономерность больше, чем сам ответ' },
  musical: { tryNow: 'Попробуй сыграть мелодию или создать простой ритм', observe: 'Замечаешь ли ритм и звуки там, где другие не замечают' },
  visual: { tryNow: 'Нарисуй или сфотографируй то, что видишь по-своему', observe: 'Легко ли представлять вещи в образах, а не в словах' },
  bodily: { tryNow: 'Попробуй новое движение — спорт, танец, конструктор руками', observe: 'Запоминается ли лучше то, что сделал сам, а не прочитал' },
  interpersonal: { tryNow: 'Организуй небольшую игру или дело для друзей', observe: 'Заряжает ли компания или быстрее устаёшь в группе' },
  intrapersonal: { tryNow: 'Запиши, что для тебя было важным событием этой недели и почему', observe: 'Легко ли назвать, что чувствуешь, без подсказки' },
  naturalistic: { tryNow: 'Понаблюдай за растением, животным или погодой несколько дней подряд', observe: 'Замечаешь ли детали в природе, которые другие пропускают' },
};

const FALLBACK_SUGGESTION = {
  tryNow: 'Выдели один час на эту сферу и попробуй что-то маленькое своими руками',
  observe: 'Что в процессе понравилось, а что — нет, без оценки результата',
};

const LEVEL_RANK: Record<InterestMapItem['level'], number> = { high: 2, medium: 1, low: 0 };

/** Top 4 interest_map items by level, real-data-driven selection. */
export function pickSpheres(items: InterestMapItem[]): SphereCardData[] {
  const sorted = [...items].sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]);
  return sorted.slice(0, 4).map((item) => {
    const suggestion = SPHERE_SUGGESTIONS[item.code] ?? FALLBACK_SUGGESTION;
    return {
      code: item.code,
      title: item.sphere,
      tryNow: suggestion.tryNow,
      observe: suggestion.observe,
    };
  });
}
