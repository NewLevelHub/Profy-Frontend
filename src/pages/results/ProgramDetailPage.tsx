import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import {
  ArrowLeft, Target,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Mascot } from '@/shared/ui/Mascot';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { toDisplayString, splitRequirementNotes, getUniversityRankingLabels } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';
import { DomainCardFrame, DomainKicker, DomainListCard } from '@/pages/results/components/DomainCardParts';
import type { ProgramDetail } from '@/shared/types';

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

// Icon-led section heading — SectionHeading (shared/ui) only supports an
// emoji lead, and these sections (requirements, career paths, grants) read
// better with a lucide icon, so this stays a local variant. Weight/color
// match SectionHeading's body-lg/font-semibold/midnight so it reads as the
// same heading role, not a heavier one-off. No bottom margin of its own —
// callers inside DomainCardFrame get spacing from its gap-6; callers outside
// it (e.g. "Карьерные пути") add their own mb-* wrapper instead, so the two
// don't stack into a double gap.
function SectionHeadingLocal({ icon: Icon, children, className }: { icon: LucideIcon; children: string; className?: string }) {
  return (
    <h3 className={cn('text-body-lg font-semibold text-[color:var(--midnight)] flex items-center gap-2', className)}>
      <Icon className="w-4 h-4 text-muted shrink-0" />
      {children}
    </h3>
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

  const isKzUni = program.university.country === 'Казахстан';
  // Foreign universities never have an ENT/grant track — only KZ universities do.
  const activeTab: 'kz' | 'intl' = isKzUni ? 'kz' : 'intl';

  return (
    <DomainCardFrame ariaLabel="Требования к поступлению">
      <DomainKicker>Требования к поступлению</DomainKicker>

      {/* KZ Track View */}
      {activeTab === 'kz' && (
        <div className="flex flex-col gap-4">
          {/* Required Exams */}
          <div className="flex flex-col gap-3">
            <p className="text-caption font-bold text-muted">Профильные предметы ЕНТ</p>
            {req.exams && req.exams.length > 0 ? (
              <div className="flex flex-col gap-2">
                {req.exams.map((exam, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary"
                  >
                    {exam}
                  </div>
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
            <div className="flex flex-col gap-3">
              <p className="text-caption font-bold text-muted">Обязательные предметы ЕНТ (минимальные пороги)</p>
              <div className="flex flex-col gap-2">
                <div className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary">
                  История Казахстана: от 5 баллов
                </div>
                <div className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary">
                  Математическая грамотность: от 3 баллов
                </div>
                <div className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary">
                  Грамотность чтения: от 3 баллов
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[var(--hairline)]" />

          {/* Passing Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] p-4">
              <div className="text-caption font-bold text-muted mb-1">Пороговый балл ЕНТ (участие в конкурсе и платное)</div>
              <div className="text-body-lg font-bold text-brand">
                {req.min_ent_threshold !== null && req.min_ent_threshold !== undefined ? `от ${req.min_ent_threshold} баллов` : 'Не установлен'}
              </div>
            </div>
            <div className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] p-4">
              <div className="text-caption font-bold text-muted mb-1">Проходной балл на грант (конкурс 2026–2027 гг.)</div>
              <div className="text-body-lg font-bold text-secondary">
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
                {[...splitRequirementNotes(req.notes), `Язык обучения: ${program.language}`].map((part, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] px-3.5 py-2.5 text-body-sm text-primary font-semibold leading-snug"
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
                <div className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Английский язык</div>
                  <div className="text-body-md font-bold text-primary">{req.language_level}</div>
                </div>
              )}
              {req.min_sat !== null && (
                <div className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Минимальный SAT</div>
                  <div className="text-body-md font-bold text-primary">{req.min_sat}</div>
                </div>
              )}
              {req.min_gpa !== null && (
                <div className="bg-surface border border-[var(--hairline)] rounded-[var(--radius)] p-4">
                  <div className="text-caption font-bold text-muted mb-1">Минимальный GPA</div>
                  <div className="text-body-md font-bold text-primary">{req.min_gpa} / 4.0</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grants — merged into this card as its own kicker'd section below a
          hairline divider, same pattern as ThinkingStyleMotivationSection's
          "СТИЛЬ МЫШЛЕНИЯ" / "МОТИВАЦИЯ" split, instead of a separate
          standalone card. No icon — kickers don't carry one anywhere else. */}
      {(program.grants ?? []).length > 0 && (
        <>
          <div className="border-t border-[var(--hairline)]" />
          <div>
            <DomainKicker>Гранты и стипендии</DomainKicker>
            {/* Grant text is often a full sentence (e.g. "President's
                Undergraduate Scholarship для выдающихся иностранных
                студентов..."), not a short tag — same white bordered
                DomainListCard used by "Сильные стороны", not a pill. */}
            <div className="flex flex-col gap-3">
              {program.grants.map((grant, i) => (
                <DomainListCard key={i} title={toDisplayString(grant)} />
              ))}
            </div>
          </div>
        </>
      )}
    </DomainCardFrame>
  );
}

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error } = useProgramDetail();

  return (
    <PageContainer className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-brand text-label font-semibold hover:opacity-70 transition-opacity animate-fade-in"
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

          {(() => {
            // program.description is intentionally null for programs whose
            // seed data had no real per-program description (see
            // university-cards-ux-fix-plan.md §7) — fall back to the
            // university's own description instead of showing nothing,
            // same fallback ProgramListSection.tsx's card already uses.
            const desc = program.description || program.university.description;
            const hasWhoFor = Boolean(program.who_its_for && program.who_its_for.length > 0);
            if (!desc && !hasWhoFor) return null;

            // Two-column grid only makes sense once both cards exist — with
            // only one of them present, a fixed lg:grid-cols-2 leaves the
            // other half of the row empty (seen on programs with no
            // who_its_for data, e.g. Imperial College's Инженер-механик).
            return (
              <div className={desc && hasWhoFor ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'grid grid-cols-1'}>
                {desc && (
                  <DomainCardFrame ariaLabel="Описание">
                    {/* Kicker + rating on the left, mascot on the right —
                        same layout/typography DirectionDetailPage's "Навыки
                        и предметы для развития" uses for its heading row. */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0 flex flex-col gap-2">
                        <DomainKicker>Описание</DomainKicker>
                        {(() => {
                          const rankLabels = getUniversityRankingLabels(program.university);
                          if (rankLabels.length === 0) return null;
                          return (
                            <p className="text-body text-primary leading-relaxed">
                              Рейтинг: {rankLabels.join(' · ')}
                            </p>
                          );
                        })()}
                      </div>
                      <Mascot state="graduate" size={68} className="flex-shrink-0" />
                    </div>
                    <p className="text-body text-primary leading-relaxed m-0">{desc}</p>
                  </DomainCardFrame>
                )}

                {hasWhoFor && (
                  <Card className="bg-brand-subtle">
                    <SectionHeadingLocal icon={Target} className="mb-2.5">Для кого</SectionHeadingLocal>
                    <p className="text-body text-primary leading-relaxed m-0">{program.who_its_for}</p>
                  </Card>
                )}
              </div>
            );
          })()}

          {(program.career_options ?? []).length > 0 && (
            <div>
              <SectionHeadingLocal icon={Briefcase} className="mb-2.5">Карьерные пути</SectionHeadingLocal>
              <div className="flex gap-2 flex-wrap">
                {program.career_options.map((career, i) => (
                  <span
                    key={i}
                    className="bg-brand-subtle text-brand text-sm font-bold px-4 py-2 rounded-pill"
                  >
                    {toDisplayString(career)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements + grants (merged in — see ProgramRequirementsCard) */}
          <ProgramRequirementsCard program={program} />

          <div className="flex flex-col gap-3 pt-2">
            {/* Sole bottom action now — visiting the university's own site
                is this page's actual goal action. Still an <a>, not a
                Button, since it's an external link (Button only renders a
                <button>, which can't get real link semantics like
                target="_blank", right-click "open in new tab", etc). */}
            {(() => {
              const websiteUrl = program.requirements_summary?.website || program.university.website;
              if (!websiteUrl) return null;
              return (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3.5 text-body-md font-medium font-sans rounded-[var(--radius)] bg-brand text-on-brand hover:bg-brand-hover transition-colors press-scale focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]"
                >
                  Перейти на сайт вуза
                </a>
              );
            })()}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
