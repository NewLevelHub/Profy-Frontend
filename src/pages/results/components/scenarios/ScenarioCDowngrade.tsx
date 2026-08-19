const STEPS = [
  {
    title: 'Выбрать профильные предметы',
    when: '~ ЗА 2 ГОДА ДО ВЫПУСКА',
    text: 'В большинстве систем профиль обучения выбирают заранее — это определяет, какие экзамены и предметы будут в приоритете дальше.',
  },
  {
    title: 'Изучить требования программ',
    when: '~ ЗА 1 ГОД ДО ВЫПУСКА',
    text: 'У большинства программ похожая структура требований: экзамены, портфолио, иногда собеседование — стоит посмотреть заранее, что именно нужно.',
  },
  {
    title: 'Подать документы летом',
    when: 'ЛЕТО ВЫПУСКНОГО ГОДА',
    text: 'Подача обычно идёт в основные и резервные варианты одновременно — иметь план B на этом этапе нормально, а не признак неуверенности.',
  },
];

/**
 * C→B soft downgrade — shown to middle-tier (12–14) students who pick the
 * "university" goal. Renders alongside (below) the full ScenarioB content
 * for the same goal, not instead of it. Deliberately generic/non-personalized
 * and without a program table or subject-gap analysis: at 12–14 the subject
 * profile isn't locked in yet, so a specific per-program subject match would
 * overstate how settled the path is.
 */
export function ScenarioCDowngrade() {
  return (
    <div
      className="rounded-[var(--radius)] p-4 sm:p-6 flex flex-col gap-4"
      style={{ border: '1.5px dashed var(--lake)', background: 'transparent' }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="inline-block font-mono text-mono-xs font-bold uppercase tracking-label rounded-pill px-3 py-1"
          style={{ border: '1px dashed var(--lake)', color: 'var(--lake)' }}
        >
          СОКРАЩЁННАЯ ВЕРСИЯ · ПОЛНАЯ С 15 ЛЕТ
        </span>
      </div>
      <div>
        <h3 className="text-title font-extrabold text-primary leading-snug">
          Три шага, одинаковые почти для всех программ
        </h3>
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-caption"
              style={{ border: '1.5px solid var(--lake)', color: 'var(--lake)' }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <p className="text-tiny font-mono font-bold uppercase tracking-label text-muted">{step.when}</p>
              <p className="font-extrabold text-primary text-body-sm">{step.title}</p>
              <p className="text-caption text-secondary leading-snug mt-0.5">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-caption text-muted leading-snug">
        Без конкретной программы и разбора предметов: в 12–14 лет выбор предметов ещё не зафиксирован, а без него точный разбор был бы преждевременным.
      </p>
    </div>
  );
}
