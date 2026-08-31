import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Accent, Counter, Reveal, SectionHead } from './primitives';
import { useInView } from '../hooks';

type Geo = 'kz' | 'world';

const INTERESTS = [
  { label: 'Исследования', value: 82, color: 'var(--pine)' },
  { label: 'Творчество', value: 64, color: 'var(--lake)' },
  { label: 'Работа с людьми', value: 47, color: 'var(--pine-light)' },
  { label: 'Практика', value: 31, color: 'var(--dawn)' },
];

const PROFESSIONS = [
  { name: 'Дата-аналитик', sub: 'математика · информатика', match: 94 },
  { name: 'Инженер-исследователь', sub: 'физика · математика', match: 88 },
  { name: 'Продуктовый аналитик', sub: 'математика · английский', match: 81 },
];

const STRENGTHS = ['Аналитическое мышление', 'Внимание к деталям', 'Самостоятельность'];

/** Рисованные обложки кампусов — сцены из токенов палитры, не фотографии. */
function CampusArt({ id, from, to, children }: { id: string; from: string; to: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" className="w-full h-full block transition-transform duration-500 group-hover:scale-[1.06]" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill={`url(#${id})`} />
      <circle cx="52" cy="30" r="15" fill="color-mix(in srgb, var(--paper) 22%, transparent)" />
      {children}
    </svg>
  );
}

const LIGHT = 'color-mix(in srgb, var(--paper) 20%, transparent)';
const DARK = 'color-mix(in srgb, var(--midnight) 34%, transparent)';

const UNIVERSITIES: {
  name: string; prog: string; why: string; city: string; rank: string;
  match: number; flag: string; geo: Geo; art: ReactNode;
}[] = [
  {
    name: 'Nazarbayev University', prog: 'Data Science', why: 'Сильная математика и работа с данными с первого курса.',
    city: 'Астана', rank: '#1 в Казахстане', match: 96, flag: 'KZ', geo: 'kz',
    art: <CampusArt id="pv-art-1" from="var(--pine)" to="var(--lake)">
      <rect x="8" y="106" width="26" height="44" fill={LIGHT} /><rect x="40" y="120" width="18" height="30" fill={LIGHT} />
      <rect x="214" y="98" width="24" height="52" fill={LIGHT} /><rect x="246" y="114" width="30" height="36" fill={LIGHT} />
      <rect x="282" y="106" width="18" height="44" fill={LIGHT} />
      <path d="M104 150V96a26 26 0 0 1 52 0v54z" fill={DARK} />
      <rect x="60" y="92" width="34" height="58" fill={DARK} /><rect x="160" y="84" width="26" height="66" fill={DARK} />
      <rect x="192" y="100" width="20" height="50" fill={DARK} /><rect x="127" y="52" width="6" height="18" fill={DARK} />
    </CampusArt>,
  },
  {
    name: 'Nanyang Technological University', prog: 'Data Science and AI', why: 'Один из сильнейших в Азии по анализу данных.',
    city: 'Сингапур', rank: '#15 в мире', match: 92, flag: 'SG', geo: 'world',
    art: <CampusArt id="pv-art-2" from="var(--lake)" to="var(--pine-light)">
      <rect x="0" y="116" width="40" height="34" fill={LIGHT} /><rect x="250" y="108" width="50" height="42" fill={LIGHT} />
      <path d="M0 150v-42q56-34 118-14t182-16v72z" fill={DARK} />
      <path d="M44 150v-30M44 120q-14-8-20 2M44 120q14-8 20 2M44 120q-4-14 6-18" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </CampusArt>,
  },
  {
    name: 'Satbayev University', prog: 'Информационные системы', why: 'Много практики с базами данных и аналитикой.',
    city: 'Алматы', rank: '#4 в Казахстане', match: 89, flag: 'KZ', geo: 'kz',
    art: <CampusArt id="pv-art-3" from="var(--clay)" to="var(--dawn)">
      <rect x="0" y="110" width="52" height="40" fill={LIGHT} /><rect x="240" y="104" width="60" height="46" fill={LIGHT} />
      <path d="M78 62h144l-72-26z" fill={DARK} /><rect x="78" y="124" width="144" height="26" fill={DARK} />
      {[88, 112, 136, 160, 184, 206].map(x => <rect key={x} x={x} y="88" width="12" height="62" fill={DARK} />)}
    </CampusArt>,
  },
  {
    name: 'University of Toronto', prog: 'Statistics & Machine Learning', why: 'Классическая статистическая школа и сильные исследования.',
    city: 'Торонто', rank: '#25 в мире', match: 88, flag: 'CA', geo: 'world',
    art: <CampusArt id="pv-art-4" from="var(--pine)" to="var(--clay)">
      <rect x="0" y="112" width="44" height="38" fill={LIGHT} /><rect x="258" y="102" width="42" height="48" fill={LIGHT} />
      <path d="M126 46l18-30 18 30z" fill={DARK} /><rect x="126" y="54" width="36" height="96" fill={DARK} />
      <rect x="74" y="96" width="44" height="54" fill={DARK} /><rect x="174" y="90" width="52" height="60" fill={DARK} />
      <circle cx="144" cy="70" r="7" fill="color-mix(in srgb, var(--paper) 30%, transparent)" />
    </CampusArt>,
  },
  {
    name: 'TU Delft', prog: 'Applied Data Science', why: 'Инженерный подход и проекты с реальными данными.',
    city: 'Делфт', rank: '#47 в мире', match: 85, flag: 'NL', geo: 'world',
    art: <CampusArt id="pv-art-5" from="var(--lake)" to="var(--lake-light)">
      <rect x="10" y="110" width="34" height="40" fill={LIGHT} /><rect x="262" y="98" width="38" height="52" fill={LIGHT} />
      <rect x="52" y="78" width="44" height="72" fill={DARK} /><rect x="102" y="54" width="58" height="96" fill={DARK} />
      <rect x="168" y="90" width="40" height="60" fill={DARK} /><rect x="214" y="66" width="42" height="84" fill={DARK} />
      <rect x="112" y="140" width="26" height="10" fill="color-mix(in srgb, var(--paper) 22%, transparent)" />
      <rect x="130" y="140" width="26" height="10" fill="color-mix(in srgb, var(--paper) 22%, transparent)" />
    </CampusArt>,
  },
  {
    name: 'KBTU', prog: 'Математическое и компьютерное моделирование', why: 'Профиль ближе к исследованиям, чем к разработке.',
    city: 'Алматы', rank: '#6 в Казахстане', match: 84, flag: 'KZ', geo: 'kz',
    art: <CampusArt id="pv-art-6" from="var(--pine-light)" to="var(--lake)">
      <rect x="0" y="120" width="60" height="30" fill={LIGHT} /><rect x="240" y="114" width="60" height="36" fill={LIGHT} />
      <rect x="30" y="96" width="80" height="54" fill={DARK} /><rect x="126" y="80" width="54" height="70" fill={DARK} />
      <rect x="190" y="106" width="64" height="44" fill={DARK} />
      <path d="M0 132q76-26 150 0t150 0" stroke="color-mix(in srgb, var(--paper) 28%, transparent)" strokeWidth="4" fill="none" />
    </CampusArt>,
  },
  {
    name: 'Technical University of Munich', prog: 'Data Engineering', why: 'Сильная инженерия данных и связи с индустрией.',
    city: 'Мюнхен', rank: '#28 в мире', match: 83, flag: 'DE', geo: 'world',
    art: <CampusArt id="pv-art-7" from="var(--lake-light)" to="var(--pine)">
      <rect x="0" y="106" width="50" height="44" fill={LIGHT} /><rect x="250" y="112" width="50" height="38" fill={LIGHT} />
      <rect x="60" y="84" width="30" height="66" fill={DARK} /><rect x="98" y="50" width="26" height="100" fill={DARK} />
      <rect x="132" y="70" width="34" height="80" fill={DARK} /><rect x="174" y="92" width="28" height="58" fill={DARK} />
      <rect x="208" y="78" width="36" height="72" fill={DARK} />
      <path d="M111 50V26" stroke={DARK} strokeWidth="3" /><circle cx="111" cy="22" r="4" fill={DARK} />
    </CampusArt>,
  },
  {
    name: 'ЕНУ им. Гумилёва', prog: 'Статистика', why: 'Отдельный трек по статистике и анализу данных.',
    city: 'Астана', rank: '#3 в Казахстане', match: 82, flag: 'KZ', geo: 'kz',
    art: <CampusArt id="pv-art-8" from="var(--pine)" to="var(--pine-light)">
      <rect x="0" y="114" width="46" height="36" fill={LIGHT} /><rect x="252" y="106" width="48" height="44" fill={LIGHT} />
      <path d="M112 78a38 38 0 0 1 76 0z" fill={DARK} /><rect x="112" y="130" width="76" height="20" fill={DARK} />
      <rect x="64" y="100" width="44" height="50" fill={DARK} /><rect x="196" y="92" width="44" height="58" fill={DARK} />
      {[124, 146, 168].map(x => <rect key={x} x={x} y="98" width="10" height="52" fill={DARK} />)}
    </CampusArt>,
  },
];

const FILTERS: { id: Geo | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'kz', label: 'Казахстан' },
  { id: 'world', label: 'Зарубежные' },
];

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="pv-label flex items-center gap-[0.45rem] mb-3 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-subtle">
      {children}
    </div>
  );
}

function Block({ className, children, style }: { className?: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('rounded-[var(--radius)] border px-[1.1rem] py-4 bg-page transition-colors', className)}
      style={{ borderColor: 'var(--border-faint)', ...style }}
    >
      {children}
    </div>
  );
}

export function PreviewSection() {
  const [tab, setTab] = useState<'report' | 'unis'>('report');
  const [filter, setFilter] = useState<Geo | 'all'>('all');
  const [lit, setLit] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  /* Подсветка идёт за курсором: координаты пишутся в CSS-переменные прямо на
     узле — это чистое оформление, гонять его через состояние значило бы
     перерисовывать всю секцию на каждое движение мыши. */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = windowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    if (!lit) setLit(true);
  };

  const visible = UNIVERSITIES.filter(u => filter === 'all' || u.geo === filter);

  return (
    <section id="preview" className="relative isolate py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="pv-glow" aria-hidden="true" />
      <div className="relative z-[1] w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead
            center
            eyebrow="Экраны продукта"
            title={<>Вот так выглядит <Accent>твой результат</Accent></>}
            sub="Сначала — отчёт по трём тестам, потом университеты и программы под каждую подобранную профессию. Переключи вкладку и посмотри оба экрана."
          />
        </Reveal>

        <Reveal>
          <div
            className="flex gap-[0.3rem] w-max mx-auto mb-[clamp(1.6rem,3vw,2.4rem)] p-[0.3rem] rounded-pill bg-surface border border-default"
            role="tablist"
            aria-label="Экраны продукта"
          >
            {([['report', 'Отчёт'], ['unis', 'Университеты']] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'px-[1.3rem] py-2 rounded-pill font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors',
                  'max-[680px]:px-[0.9rem] max-[680px]:text-[0.64rem] max-[680px]:tracking-[0.1em]',
                  tab === id ? 'bg-brand text-on-brand' : 'text-secondary hover:text-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div
            ref={el => { windowRef.current = el; inViewRef.current = el; }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setLit(false)}
            className={cn(
              'pv-window relative rounded-[var(--radius)] border border-strong bg-surface overflow-hidden shadow-pop',
              lit && 'pv-lit',
              inView && 'is-visible',
            )}
          >
            <div className="flex items-center gap-[0.42rem] px-4 py-[0.7rem] bg-raised" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: 'var(--dawn)' }} />
              <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: 'var(--border-strong)' }} />
              <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: 'var(--border-strong)' }} />
              <span
                className="ml-[0.7rem] px-[0.8rem] py-[0.22rem] rounded-pill bg-surface font-mono text-[0.64rem] tracking-[0.04em] text-subtle max-[680px]:hidden"
                style={{ border: '1px solid var(--border-faint)' }}
              >
                profy.kz / {tab === 'report' ? 'отчёт' : 'университеты'}
              </span>
            </div>

            {tab === 'report' ? (
              <div key="report" className="pv-screen relative z-[2] p-[clamp(1rem,2.2vw,1.6rem)]" role="tabpanel">
                <div className="grid grid-cols-[1.12fr_.88fr] gap-[0.9rem] items-start max-[900px]:grid-cols-1">
                  <Block className="pv-hero relative overflow-hidden col-span-2 max-[900px]:col-span-1 !pl-[1.4rem]">
                    <Label>Краткое резюме</Label>
                    <p className="text-[0.92rem] leading-[1.6] text-secondary max-w-[62ch]">
                      Тебя тянет разбираться, как всё устроено: ты быстрее включаешься там, где есть данные
                      и понятная логика, и заметно теряешь интерес к задачам без видимого результата.
                    </p>
                    <div className="flex flex-wrap gap-[0.4rem] mt-[0.9rem]">
                      {[['3', 'теста пройдено'], ['15', 'минут заняло'], ['6', 'блоков в отчёте']].map(([n, t]) => (
                        <span
                          key={t}
                          className="inline-flex items-baseline gap-[0.35rem] px-[0.7rem] py-[0.3rem] rounded-pill bg-surface text-[0.75rem] text-secondary"
                          style={{ border: '1px solid var(--border-faint)' }}
                        >
                          <b className="font-mono text-[0.74rem] font-semibold" style={{ color: 'var(--pine)' }}>{n}</b>
                          {t}
                        </span>
                      ))}
                    </div>
                  </Block>

                  <Block>
                    <Label>Карта интересов</Label>
                    {INTERESTS.map((bar, i) => (
                      <div key={bar.label} className={i > 0 ? 'mt-[0.7rem]' : undefined}>
                        <div className="flex justify-between items-baseline gap-4 mb-[0.3rem]">
                          <span className="text-[0.82rem] text-secondary">{bar.label}</span>
                          <b className="font-mono text-[0.72rem] font-semibold" style={{ color: 'var(--midnight)' }}>
                            <Counter target={bar.value} />%
                          </b>
                        </div>
                        <div className="h-[6px] rounded-pill overflow-hidden" style={{ background: 'var(--border-faint)' }}>
                          <div
                            className="pv-fill"
                            style={{ '--w': `${bar.value}%`, '--gc': bar.color, '--bar-delay': `${i * 0.1}s` } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    ))}
                  </Block>

                  <Block>
                    <Label>Подходящие профессии</Label>
                    {PROFESSIONS.map((prof, i) => (
                      <div
                        key={prof.name}
                        className={cn('flex items-center gap-[0.85rem] py-[0.7rem] last:pb-0', i > 0 && 'border-t')}
                        style={i > 0 ? { borderColor: 'var(--border-faint)' } : { paddingTop: 0 }}
                      >
                        <div className="flex-1 min-w-0">
                          <strong className="block text-[0.87rem] font-semibold tracking-[-0.01em]" style={{ color: 'var(--midnight)' }}>
                            {prof.name}
                          </strong>
                          <em className="not-italic block mt-[0.12rem] text-[0.72rem] text-subtle">{prof.sub}</em>
                        </div>
                        {/* Верхнее совпадение — залитый бейдж с медленным бликом. */}
                        <span
                          className={cn(
                            'shrink-0 font-mono text-[0.74rem] font-semibold px-[0.6rem] py-[0.28rem] rounded-pill border',
                            i === 0 && 'pv-match-top relative overflow-hidden',
                          )}
                          style={
                            i === 0
                              ? { color: 'var(--paper)', background: 'var(--pine)', borderColor: 'var(--pine)' }
                              : { color: 'var(--pine)', background: 'var(--bg-surface)', borderColor: 'var(--border)' }
                          }
                        >
                          <Counter target={prof.match} />%
                        </span>
                      </div>
                    ))}
                  </Block>

                  <Block className="col-span-2 max-[900px]:col-span-1">
                    <Label>Сильные стороны и стиль мышления</Label>
                    <div className="flex flex-wrap gap-[0.4rem] items-center">
                      {STRENGTHS.map(chip => (
                        <span
                          key={chip}
                          className="px-[0.7rem] py-[0.3rem] rounded-pill text-[0.75rem] text-secondary bg-surface"
                          style={{ border: '1px solid var(--border-faint)' }}
                        >
                          {chip}
                        </span>
                      ))}
                      <span
                        className="px-[0.7rem] py-[0.3rem] rounded-pill text-[0.75rem]"
                        style={{
                          color: 'var(--pine)',
                          borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--pine-light)',
                          background: 'color-mix(in srgb, var(--pine-light) 12%, var(--bg-surface))',
                        }}
                      >
                        Системный стиль мышления
                      </span>
                      <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-[0.12em] text-subtle max-[680px]:ml-0 max-[680px]:w-full">
                        и ещё 4 блока ниже
                      </span>
                    </div>
                  </Block>
                </div>
              </div>
            ) : (
              <div key="unis" className="pv-screen relative z-[2] p-[clamp(1rem,2.2vw,1.6rem)]" role="tabpanel">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[0.8rem] text-subtle mr-[0.15rem]">Под профессию</span>
                  <span
                    className="inline-flex items-center gap-[0.45rem] px-[0.8rem] py-[0.32rem] rounded-pill text-[0.78rem] font-semibold"
                    style={{ background: 'var(--pine)', color: 'var(--paper)' }}
                  >
                    Дата-аналитик
                    <span className="font-mono text-[0.7rem] font-semibold opacity-[0.78]">94%</span>
                  </span>
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      aria-pressed={filter === f.id}
                      className={cn(
                        'px-[0.8rem] py-[0.3rem] rounded-pill text-[0.75rem] border bg-surface transition-colors',
                        // Слева контекст, справа управление — группы не слипаются.
                        f.id === 'all' && 'ml-auto max-[680px]:ml-0',
                        filter === f.id ? 'font-semibold' : 'text-secondary hover:text-primary',
                      )}
                      style={
                        filter === f.id
                          ? { color: 'var(--pine)', borderColor: 'var(--pine-light)', background: 'color-mix(in srgb, var(--pine-light) 14%, var(--bg-surface))' }
                          : { borderColor: 'var(--border)' }
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(228px,1fr))] gap-[0.85rem] max-[680px]:grid-cols-1">
                  {visible.map(uni => (
                    <div
                      key={uni.name}
                      className="pv-uni group flex flex-col overflow-hidden rounded-[var(--radius)] border bg-page transition-colors hover:border-brand"
                      style={{ borderColor: 'var(--border-faint)' }}
                    >
                      <div className="relative aspect-video overflow-hidden bg-raised">
                        {uni.art}
                        <span
                          className="absolute top-2 right-2 font-mono text-[0.74rem] font-semibold px-[0.6rem] py-[0.28rem] rounded-pill backdrop-blur-[6px]"
                          style={{ background: 'color-mix(in srgb, var(--paper) 92%, transparent)', color: 'var(--pine)' }}
                        >
                          {uni.match}%
                        </span>
                        <span
                          className="absolute left-2 bottom-2 inline-flex items-center gap-[0.3rem] px-2 py-[0.16rem] rounded-pill font-mono text-[0.58rem] font-semibold tracking-[0.1em] backdrop-blur-[6px]"
                          style={{ background: 'color-mix(in srgb, var(--midnight) 55%, transparent)', color: 'var(--paper)' }}
                        >
                          {uni.flag}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 px-[0.95rem] pt-[0.85rem] pb-4">
                        <strong className="text-[0.85rem] font-semibold tracking-[-0.01em] leading-[1.35]" style={{ color: 'var(--midnight)' }}>
                          {uni.name}
                        </strong>
                        <div className="text-[0.76rem] text-secondary mt-1">{uni.prog}</div>
                        <p className="text-[0.73rem] leading-[1.5] text-subtle mt-[0.45rem]">{uni.why}</p>
                        <div
                          className="flex flex-wrap gap-x-[0.8rem] gap-y-[0.3rem] mt-auto pt-[0.7rem] text-[0.7rem] text-subtle"
                          style={{ borderTop: '1px solid var(--border-faint)' }}
                        >
                          <i className="not-italic inline-flex items-center gap-[0.28rem]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[11px] h-[11px] shrink-0">
                              <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
                            </svg>
                            {uni.city}
                          </i>
                          <i className="not-italic inline-flex items-center gap-[0.28rem]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-[11px] h-[11px] shrink-0">
                              <path d="M12 3l2.5 5.3L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.7z" />
                            </svg>
                            {uni.rank}
                          </i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pv-note flex items-center gap-[0.6rem] mt-4 text-[0.8rem] text-subtle">
                  И так — под каждую из подобранных профессий, с городом и местом в рейтинге.
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
