import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { toDisplayString, formatCost, convertLabelCurrenciesToUsd, splitRequirementNotes, getUniversityRankingLabels } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';
import type { ProgramDetail, UniversityRequirement } from '@/shared/types';

function ProgramDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[var(--radius)] border border-default p-6 flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

function SectionHeadingLocal({ children }: { children: string }) {
  return (
    <h3 className="text-body-lg font-black text-primary mb-2.5">{children}</h3>
  );
}



function extractGrantScoreRange(scores: string[]): string | null {
  if (!scores || scores.length === 0) return null;
  const generalScore = scores.find(s => s.includes('Общий конкурс')) || scores[0];
  const match = generalScore.match(/проходной балл\s+([\d–-]+)/i);
  return match ? match[1] : null;
}

function ProgramRequirementsCard({ program }: { program: ProgramDetail }) {
  const req = program.requirements_summary;
  if (!req) return null;

  const hasKzData = !!(
    (req.exams && req.exams.length > 0) ||
    req.min_ent_threshold ||
    (req.admission_scores_2026 && req.admission_scores_2026.length > 0) ||
    req.exam_hint_from_notes
  );
  
  const hasIntlData = !!(
    req.language_level ||
    req.portfolio_needed !== null ||
    req.min_sat !== null ||
    req.min_gpa !== null ||
    (req.required_documents && req.required_documents.length > 0) ||
    (req.extracurriculars && req.extracurriculars.length > 0) ||
    req.website
  );

  const isKzUni = program.university.country === 'Казахстан';
  const showTabs = !isKzUni && hasKzData && hasIntlData;
  const defaultTab = isKzUni ? 'kz' : (hasKzData ? 'kz' : 'intl');
  const [activeTab, setActiveTab] = useState<'kz' | 'intl'>(defaultTab);

  return (
    <div className="bg-surface border border-default rounded-[var(--radius)] p-6 shadow-card flex flex-col gap-5">
      {/* Header */}
      <div className="border-b border-default pb-4">
        <h3 className="text-body-lg font-black text-primary m-0 flex items-center gap-2">
          📝 Требования к поступлению
        </h3>
      </div>

      {/* Tab Switcher */}
      {showTabs && (
        <div className="flex bg-default/40 p-1 rounded-pill gap-1 self-start">
          <button
            onClick={() => setActiveTab('kz')}
            className={`px-4 py-2 rounded-pill text-xs font-extrabold transition-all ${
              activeTab === 'kz'
                ? 'bg-surface text-brand shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            Казахстан (ЕНТ и Гранты)
          </button>
          <button
            onClick={() => setActiveTab('intl')}
            className={`px-4 py-2 rounded-pill text-xs font-extrabold transition-all ${
              activeTab === 'intl'
                ? 'bg-surface text-brand shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            Международный трек
          </button>
        </div>
      )}

      {/* KZ Track View */}
      {activeTab === 'kz' && (
        <div className="flex flex-col gap-4">
          {/* Required Exams */}
          <div>
            <div className="text-caption font-bold text-muted mb-1.5">Профильные предметы ЕНТ</div>
            {req.exams && req.exams.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {req.exams.map((exam, i) => (
                  <span key={i} className="bg-brand-subtle text-brand text-sm font-extrabold px-3 py-1.5 rounded-pill">
                    🎯 {exam}
                  </span>
                ))}
              </div>
            ) : req.exam_hint_from_notes ? (
              <div className="text-body-sm text-secondary font-semibold border-l-2 border-brand pl-3 italic">
                {req.exam_hint_from_notes}
              </div>
            ) : (
              <div className="text-body-sm text-muted">Предметы не указаны, уточняйте в приемной комиссии.</div>
            )}
          </div>

          {/* Compulsory subjects for KZ universities */}
          {isKzUni && (
            <div>
              <div className="text-caption font-bold text-muted mb-2">Обязательные предметы ЕНТ (минимальные пороги)</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-default/40 text-secondary text-xs font-extrabold px-3.5 py-2 rounded-pill">
                  📖 История Казахстана: от 5 баллов
                </span>
                <span className="inline-flex items-center gap-1.5 bg-default/40 text-secondary text-xs font-extrabold px-3.5 py-2 rounded-pill">
                  🧮 Математическая грамотность: от 3 баллов
                </span>
                <span className="inline-flex items-center gap-1.5 bg-default/40 text-secondary text-xs font-extrabold px-3.5 py-2 rounded-pill">
                  👁️ Грамотность чтения: от 3 баллов
                </span>
              </div>
            </div>
          )}

          {/* Passing Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-default/20 border border-default rounded-[var(--radius)] p-4">
              <div className="text-caption font-bold text-muted mb-1">Пороговый балл ЕНТ (участие в конкурсе и платное)</div>
              <div className="text-body-lg font-black text-brand">
                {req.min_ent_threshold !== null && req.min_ent_threshold !== undefined ? `от ${req.min_ent_threshold} баллов` : 'Не установлен'}
              </div>
            </div>
            <div className="bg-default/20 border border-default rounded-[var(--radius)] p-4">
              <div className="text-caption font-bold text-muted mb-1">Проходной балл на грант (конкурс 2026–2027 гг.)</div>
              <div className="text-body-lg font-black text-secondary">
                {(() => {
                  const range = extractGrantScoreRange(req.admission_scores_2026);
                  if (!range) return 'Не установлен';
                  const parts = range.split(/[–-]/);
                  if (parts.length === 2 && parts[0].trim() === parts[1].trim()) {
                    return `от ${parts[0].trim()} баллов`;
                  }
                  if (range.includes('–') || range.includes('-')) {
                    return `${range} баллов`;
                  }
                  return `от ${range} баллов`;
                })()}
              </div>
            </div>
          </div>


        </div>
      )}

      {/* International Track View */}
      {activeTab === 'intl' && (
        <div className="flex flex-col gap-4">
          {/* General requirements notes — source text packs several distinct
              requirements into one paragraph (see splitRequirementNotes),
              so each is rendered as its own small card, not one text block. */}
          {req.notes && req.notes.length > 0 && (
            <div>
              <div className="text-caption font-bold text-muted mb-1.5">Общие требования вуза</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {splitRequirementNotes(req.notes).map((part, i) => (
                  <div
                    key={i}
                    className="bg-default/20 border border-default rounded-[var(--radius)] px-3.5 py-2.5 text-body-sm text-secondary font-semibold leading-snug"
                  >
                    {part}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Minimum scores */}
          {(req.language_level || req.min_sat || req.min_gpa) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {req.language_level && (
                <div className="bg-default/20 border border-default rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Английский язык</div>
                  <div className="text-body-md font-black text-primary">{req.language_level}</div>
                </div>
              )}
              {req.min_sat !== null && (
                <div className="bg-default/20 border border-default rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Минимальный SAT</div>
                  <div className="text-body-md font-black text-primary">{req.min_sat}</div>
                </div>
              )}
              {req.min_gpa !== null && (
                <div className="bg-default/20 border border-default rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Минимальный GPA</div>
                  <div className="text-body-md font-black text-primary">{req.min_gpa} / 4.0</div>
                </div>
              )}
            </div>
          )}


        </div>
      )}

      {/* Website link — was previously only rendered inside the intl-track
          view, so it never showed for KZ universities at all (they don't
          get the tab switcher, showTabs is unconditionally false for them)
          even though University.website is populated for nearly all of
          them. Hoisted out so it's visible regardless of which track is
          active or which country the university is in. */}
      {(req.website || program.university.website) && (
        <a
          href={req.website || program.university.website!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-brand text-on-brand text-xs font-extrabold rounded-pill hover:bg-brand-hover transition-colors self-start decoration-none"
        >
          Перейти на сайт вуза ↗
        </a>
      )}
    </div>
  );
}

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error } = useProgramDetail();

  return (
    <PageContainer className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-brand text-body-sm font-extrabold hover:opacity-70 transition-opacity animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {isLoading ? (
        <ProgramDetailSkeleton />
      ) : error !== null || !program ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error ?? 'Программа не найдена'}</p>
          <Button variant="ghost" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          <PageHeader
            title={program.name}
            subtitle={program.university.name}
          />

          {/* Rating rendered as its own row of chips, one per rating scale
              the university actually has — never merged into one string
              (a single ranking_label can carry both a general and a
              subject-specific rank, e.g. Georgia Tech's US News entry). */}
          {getUniversityRankingLabels(program.university).length > 0 && (
            <div className="flex gap-2.5 flex-wrap">
              {getUniversityRankingLabels(program.university).map((rankText, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-sm font-extrabold px-3.5 py-1.5 rounded-pill"
                >
                  🏆 {rankText}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(() => {
              // program.description is intentionally null for programs whose
              // seed data had no real per-program description (see
              // university-cards-ux-fix-plan.md §7) — fall back to the
              // university's own description instead of showing nothing,
              // same fallback ProgramListSection.tsx's card already uses.
              const desc = program.description || program.university.description;
              if (!desc) return null;
              return (
                <div className="bg-surface border border-default rounded-[var(--radius)] p-6 shadow-card">
                  <SectionHeadingLocal>📋 Описание</SectionHeadingLocal>
                  <p className="text-body-sm text-secondary font-semibold leading-relaxed m-0">{desc}</p>
                </div>
              );
            })()}

            {program.who_its_for && program.who_its_for.length > 0 && (
              <div className="bg-brand-subtle rounded-[var(--radius)] p-6">
                <SectionHeadingLocal>🎯 Для кого</SectionHeadingLocal>
                <p className="text-body-sm text-secondary font-semibold leading-relaxed m-0">{program.who_its_for}</p>
              </div>
            )}
          </div>

          {/* Program characteristics — language moved down here from the top
              block (between title and description) so it doesn't clutter
              that area; grouped with cost since both are per-program
              characteristics rather than headline info. */}
          <div className="flex gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-brand-subtle text-brand text-sm font-extrabold px-3.5 py-1.5 rounded-pill">
              🌐 {program.language}
            </span>
            {/* No max-width/nowrap constraint — converted free-text cost
                labels can run long and must wrap inside the pill, not
                overflow the card (see university-cards-ux-fix-plan.md §1/§10). */}
            <span className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-sm font-extrabold px-3.5 py-1.5 rounded-pill text-left">
              💰 {program.cost_per_year !== null ? formatCost(program.cost_per_year) : convertLabelCurrenciesToUsd(program.cost_label)}
            </span>
          </div>

          {(program.career_options ?? []).length > 0 && (
            <div>
              <SectionHeadingLocal>💼 Карьерные пути</SectionHeadingLocal>
              <div className="flex gap-2 flex-wrap">
                {program.career_options.map((career, i) => (
                  <span
                    key={i}
                    className="bg-brand-subtle text-brand text-sm font-extrabold px-4 py-2 rounded-pill"
                  >
                    {toDisplayString(career)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* New Structured Requirements Component */}
          <ProgramRequirementsCard program={program} />

          {(program.grants ?? []).length > 0 && (
            <div className="bg-accent-soft border border-[color:var(--dawn)]/30 rounded-[var(--radius)] px-6 py-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎓</span>
                <div className="text-base font-black text-accent">Гранты и стипендии</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {program.grants.map((grant, i) => (
                  <span
                    key={i}
                    className="bg-surface text-accent text-sm font-extrabold px-4 py-2 rounded-pill"
                  >
                    {toDisplayString(grant)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 min-w-[200px] h-[58px] border-none rounded-pill bg-brand text-on-brand text-body-md font-extrabold cursor-pointer hover:bg-brand-hover transition-all"
            >
              🎓 Посмотреть университеты
            </button>
            <button
              onClick={() => navigate('/results')}
              className="flex-1 min-w-[200px] h-[58px] border-[1.5px] border-brand rounded-pill bg-surface text-brand text-body-md font-extrabold cursor-pointer hover:bg-brand-subtle transition-all"
            >
              Назад к результатам
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
