import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { adminApi } from '@/shared/api/admin';
import { downloadBlob } from '@/shared/lib/downloadBlob';
import { printWithTitle } from '@/shared/lib/printDocument';
import { listReturnPath } from '@/shared/lib/listReturnPath';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import { AGE_TIER_LABELS, MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { Button } from '@/shared/ui/Button';
import { Spine } from '@/shared/ui/Spine';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import { DiagnosticSummaryBlock } from './components/DiagnosticSummaryBlock';
import { AssessmentPrintReport } from './components/AssessmentPrintReport';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';
import type {
  AdminAssessmentDetail,
  AgeGroup,
  AdminMotivationResponseItem,
  AdminResponseItem,
  AdminUserDetail,
  MotivationCategory,
  PersonalityTrait,
} from '@/shared/types';

const PERSONALITY_TRAIT_LABELS: Record<PersonalityTrait, string> = {
  openness: 'admin:trait.openness',
  conscientiousness: 'admin:trait.conscientiousness',
  extraversion: 'admin:trait.extraversion',
  agreeableness: 'admin:trait.agreeableness',
  emotional_stability: 'admin:trait.emotional_stability',
};

const ARTIFACT_LABELS: Record<string, string> = {
  hobby: 'admin:artifact.hobby',
  club: 'admin:artifact.club',
  sport: 'admin:artifact.sport',
  achievement: 'admin:artifact.achievement',
  goal: 'admin:artifact.goal',
  book: 'admin:artifact.book',
  game: 'admin:artifact.game',
  topic: 'admin:artifact.topic',
  profession: 'admin:artifact.profession',
  university: 'admin:artifact.university',
  dream: 'admin:artifact.dream',
};

const RIASEC_TYPE_LABELS: Record<string, string> = {
  R: 'admin:riasecShort.R',
  I: 'admin:riasecShort.I',
  A: 'admin:riasecShort.A',
  S: 'admin:riasecShort.S',
  E: 'admin:riasecShort.E',
  C: 'admin:riasecShort.C',
};

const BIGFIVE_DOMAIN_LABELS: Record<string, string> = {
  N: 'admin:bigfive.N',
  E: 'admin:bigfive.E',
  O: 'admin:bigfive.O',
  A: 'admin:bigfive.A',
  C: 'admin:bigfive.C',
};

const MI_TYPE_LABELS: Record<string, string> = {
  verbal: 'admin:mi.verbal',
  logical: 'admin:mi.logical',
  musical: 'admin:mi.musical',
  visual: 'admin:mi.visual',
  bodily: 'admin:mi.bodily',
  interpersonal: 'admin:mi.interpersonal',
  intrapersonal: 'admin:mi.intrapersonal',
  naturalistic: 'admin:mi.naturalistic',
};

/**
 * Maximum `career_match_score` a direction can reach.
 *
 * The score weights the user's top three types by 3/2/1 and the direction's
 * own three letters by 3/2/1 positionally, so a perfect alignment scores
 * 3·3 + 2·2 + 1·1 = 14 (riasec_service.career_match_score). The UI printed
 * "совпадение 14/6", which made a perfect match look like an overflow bug.
 */
const MAX_MATCH_SCORE = 14;

/** RIASEC letter → its name, for the fields the API returns as bare letters. */
function riasecName(letter: string, t: (key: string) => string): string {
  const key = RIASEC_TYPE_LABELS[letter];
  return key ? t(key) : letter;
}

function groupLabel(instrument: string, category: string, t: (key: string) => string): string {
  if (instrument === 'big_five') return `Big Five: ${t(BIGFIVE_DOMAIN_LABELS[category]) ?? category}`;
  if (instrument === 'riasec') return `RIASEC: ${riasecName(category, t)}`;
  if (instrument === 'mi') return `MI: ${t(MI_TYPE_LABELS[category]) ?? category}`;
  return t('users.other');
}

function formatDate(value: string) {
  return formatIntlDate(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function profileSubjects(
  profile: AdminUserDetail['profile'],
  kind: 'liked' | 'disliked' | 'easy' | 'hard',
): string[] {
  if (!profile) return [];
  const record = profile as unknown as Record<string, string[] | undefined>;
  return record[`subjects_${kind}`] ?? [];
}

/**
 * Label above value, not label-dots-value across a wide card.
 *
 * The old row stretched "Имя" to the far left and "Арман" to the far right of
 * a half-screen card, leaving 40 empty characters between a label and the
 * thing it labels — the eye had to travel the full width to pair them up.
 * Stacked pairs in a grid keep each pair adjacent and let several sit per row.
 *
 * Empty values render as "—" rather than disappearing: the previous version
 * returned null for falsy values, so an admin could not tell "the user left
 * this blank" from "this field doesn't exist".
 */
function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className={cn(MONO_LABEL, 'text-muted')}>{label}</span>
      <span className={cn(ADMIN_TEXT, empty ? 'text-muted' : 'text-primary font-medium', 'truncate')}>
        {empty ? '—' : value}
      </span>
    </div>
  );
}

/**
 * All four subject groups, always, in one grid — including the empty ones.
 *
 * They used to render as four stacked blocks that vanished when empty, so a
 * profile with one liked subject produced a lone chip under a heading and no
 * way to see that "не нравятся" was simply unanswered.
 */
function ChipField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className={cn(MONO_LABEL, 'text-muted')}>{label}</span>
      {items.length === 0 ? (
        <span className={cn(ADMIN_TEXT, 'text-muted')}>—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <span
              key={item}
              className={cn(ADMIN_TEXT, 'px-1.5 py-0.5 rounded-[2px] bg-brand-subtle text-brand')}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Same shape, but hides itself when there's nothing — used for LLM output. */
function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return <ChipField label={label} items={items} />;
}

/**
 * One collapsible section inside an assessment.
 *
 * The assessment panel used to render everything at once: summary, all 60+
 * question/answer rows, motivation triplets, the full analysis result (about
 * ten sub-blocks) and the roadmap, in a single scroll with no navigation. The
 * question rows alone pushed the analysis — the part an admin actually opens
 * this screen for — thousands of pixels down the page. Sections now start
 * closed except the summary, and each says how much is inside.
 */
function Section({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="border border-default rounded-[3px] overflow-hidden bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-raised hover:bg-hover transition-colors text-left"
      >
        <span className="flex items-baseline gap-2">
          <span className={cn(ADMIN_TEXT, 'font-semibold text-primary')}>{title}</span>
          {count !== undefined && <span className={cn(ADMIN_NUM, 'text-muted')}>{count}</span>}
        </span>
        <ChevronDown
          size={15}
          className={cn('text-muted transition-transform flex-shrink-0', open && 'rotate-180')}
        />
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

function ResponsesSection({ responses }: { responses: AdminResponseItem[] }) {
  const { t } = useTranslation('admin');
  if (!responses.length) {
    return <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>{t('users.noAnswers')}</p>;
  }

  const groups = new Map<string, AdminResponseItem[]>();
  for (const response of responses) {
    const key = `${response.instrument}:${response.category}`;
    groups.set(key, [...(groups.get(key) ?? []), response]);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([key, items]) => (
        <div key={key}>
          <p className={cn(MONO_LABEL, 'text-muted mb-2')}>
            {groupLabel(items[0].instrument, items[0].category, t)} · {items.length}
          </p>
          <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
            {items.map((item, index) => (
              <li
                key={`${item.question_id}-${index}`}
                className={cn(ADMIN_TEXT, 'flex items-baseline justify-between gap-4 px-2.5 py-2 rounded-[2px] bg-page border border-default')}
              >
                <span className="text-primary min-w-0">{item.question_text}</span>
                <span className="text-brand font-medium text-right flex-shrink-0">
                  {item.selected_answer_text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function motivationCategoryLabel(category: string, t: (key: string) => string): string {
  return t(MOTIVATION_CATEGORY_LABELS[category as MotivationCategory]) ?? category;
}

function MotivationResponsesSection({ responses }: { responses: AdminMotivationResponseItem[] }) {
  const { t } = useTranslation('admin');
  if (!responses.length) {
    return <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>{t('users.noMotivation')}</p>;
  }

  return (
    <ul className="flex flex-col gap-2 m-0 p-0 list-none">
      {responses.map((item) => (
        <li key={item.triplet_index} className="p-2.5 rounded-[2px] bg-page border border-default">
          <p className={cn(ADMIN_META, 'mb-1.5')}>{t('statements.triplet', { index: item.triplet_index })}</p>
          <div className="flex flex-col gap-1">
            <RankedLine rank={t('users.rank.most')} text={item.most_text} category={item.most_category} tone="brand" />
            <RankedLine rank={t('users.rank.neutral')} text={item.neutral_text} category={item.neutral_category} tone="muted" />
            <RankedLine rank={t('users.rank.least')} text={item.least_text} category={item.least_category} tone="danger" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RankedLine({
  rank,
  text,
  category,
  tone,
}: {
  rank: string;
  text: string;
  category: string;
  tone: 'brand' | 'muted' | 'danger';
}) {
  const { t } = useTranslation('admin');
  return (
    <p className={cn(ADMIN_TEXT, 'flex items-baseline gap-2 m-0')}>
      <span
        className={cn(
          MONO_LABEL,
          'w-[92px] flex-shrink-0',
          tone === 'brand' && 'text-brand',
          tone === 'muted' && 'text-muted',
          tone === 'danger' && 'text-danger',
        )}
      >
        {rank}
      </span>
      <span className="text-primary">{text}</span>
      <span className={ADMIN_META}>{motivationCategoryLabel(category, t)}</span>
    </p>
  );
}

/**
 * Names the download after the person and the test, not after a UUID.
 *
 * The file used to land as `assessment_6ffe117c-88f0-41f7-a088-0d611cad2a91.zip`
 * — unopenable-by-name in a Downloads folder, and indistinguishable from the
 * next one. Latin-transliterated so the name survives every filesystem.
 */
function exportFileName(assessment: AdminAssessmentDetail, userLabel: string, ext: string): string {
  const date = (assessment.completed_at ?? assessment.created_at).slice(0, 10);
  const who = transliterate(userLabel).slice(0, 40) || 'user';
  return `profy_${who}_${date}.${ext}`;
}

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Две выгрузки, отвечающие на разные вопросы.
 *
 * PDF — «что получилось у ученика»: сводка, которую можно распечатать, послать
 * родителю или приложить к разговору. ZIP — «из чего это посчитано»: три CSV,
 * включая все 314 ответов, для анализа в таблице.
 *
 * PDF собирается печатью браузера, а не библиотекой — см. `printWithTitle`.
 */
function AssessmentExportButtons({
  user,
  assessment,
  userLabel,
  index,
}: {
  user: AdminUserDetail;
  assessment: AdminAssessmentDetail;
  userLabel: string;
  index: number;
}) {
  const { t } = useTranslation('admin');
  const [exporting, setExporting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [printing, setPrinting] = useState(false);

  async function handleExport() {
    setExporting(true);
    setFailed(false);
    try {
      const blob = await adminApi.exportAssessment(assessment.id);
      downloadBlob(blob, exportFileName(assessment, userLabel, 'zip'));
    } catch {
      setFailed(true);
    } finally {
      setExporting(false);
    }
  }

  async function handlePrint() {
    setPrinting(true);
    // Лист рендерится в этом же кадре; печать ждёт layout внутри printWithTitle.
    await printWithTitle(exportFileName(assessment, userLabel, 'pdf').replace(/\.pdf$/, ''));
    setPrinting(false);
  }

  return (
    <span className="flex items-center gap-2 flex-wrap">
      {failed && <span className={cn(ADMIN_TEXT, 'text-danger')}>{t('users.exportFailed')}</span>}
      <Button
        variant="ghost"
        size="sm"
        muteSound
        onClick={handlePrint}
        title={t('users.printHint')}
      >
        <FileText size={14} />
        {t('users.downloadPdf')}
      </Button>
      <Button variant="ghost" size="sm" muteSound isLoading={exporting} onClick={handleExport}>
        <Download size={14} />
        {t('users.downloadZip')}
      </Button>
      {printing && <AssessmentPrintReport user={user} assessment={assessment} index={index} />}
    </span>
  );
}

/**
 * Key/value rows for scales with no documented range — motivation's raw counts
 * and `personality_profile`. Unlike riasec/big_five/thinking_style (which
 * DiagnosticSummaryBlock draws as 0–100 bars), rendering these as a percentage
 * would invent a scale.
 */
function ValueList({
  label,
  values,
  labels,
  hint,
  sorted,
}: {
  label: string;
  values: Record<string, number>;
  labels: Record<string, string>;
  hint?: string;
  /** Ranks descending — for counts where "what came out on top" is the point. */
  sorted?: boolean;
}) {
  const { t } = useTranslation('admin');
  const entries = Object.entries(values);
  if (!entries.length) return null;
  const ordered = sorted ? [...entries].sort((a, b) => b[1] - a[1]) : entries;
  return (
    <div>
      <p className={cn(MONO_LABEL, 'text-muted mb-1')}>{label}</p>
      {hint && <p className={cn(ADMIN_META, 'mb-2')}>{hint}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {ordered.map(([key, value]) => (
          <div
            key={key}
            className={cn(ADMIN_TEXT, 'flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-[2px] bg-page border border-default')}
          >
            <span className="text-muted min-w-0 truncate">{labels[key] ? t(labels[key]) : key}</span>
            <span className="font-mono text-mono-sm text-primary tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextNoteList({
  label,
  notes,
  labels,
}: {
  label: string;
  notes: Record<string, string>;
  labels: Record<string, string>;
}) {
  const { t } = useTranslation('admin');
  const entries = Object.entries(notes).filter(([, text]) => text);
  if (!entries.length) return null;
  return (
    <div>
      <p className={cn(MONO_LABEL, 'text-muted mb-2')}>{label}</p>
      <div className="flex flex-col gap-1.5">
        {entries.map(([key, text]) => (
          <div key={key} className="p-2.5 rounded-[2px] bg-page border border-default">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{labels[key] ? t(labels[key]) : key}</p>
            <p className={cn(ADMIN_TEXT, 'text-secondary mt-1')}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardList({ label, cards }: { label: string; cards: { title: string; description: string }[] }) {
  if (!cards.length) return null;
  return (
    <div>
      <p className={cn(MONO_LABEL, 'text-muted mb-2')}>{label}</p>
      <div className="flex flex-col gap-1.5">
        {cards.map((card) => (
          <div key={card.title} className="p-2.5 rounded-[2px] bg-page border border-default">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{card.title}</p>
            <p className={cn(ADMIN_TEXT, 'text-secondary mt-1')}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisSection({ analysis }: { analysis: NonNullable<AdminAssessmentDetail['analysis_result']> }) {
  const { t } = useTranslation('admin');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className={cn(ADMIN_TEXT, 'text-primary m-0 max-w-[70ch]')}>{analysis.summary}</p>
        <span className={ADMIN_META}>{t('users.reportVersion', { version: analysis.report_version })}</span>
      </div>

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {/* `strengths`/`weaknesses` come back as bare RIASEC letters
            (["S","E","R"]) — three one-character chips that said nothing. */}
        <ChipList label={t('users.strongTypes')} items={analysis.strengths.map((letter) => riasecName(letter, t))} />
        <ChipList label={t('users.weakTypes')} items={analysis.weaknesses.map((letter) => riasecName(letter, t))} />
        <ChipList label={t('users.planReinforce')} items={analysis.development_plan.reinforce} />
        <ChipList label={t('users.planCompensate')} items={analysis.development_plan.compensate} />
      </div>

      {analysis.careers.length > 0 && (
        <div>
          <p className={cn(MONO_LABEL, 'text-muted mb-2')}>{t('print.section.directions')}</p>
          <div className="grid gap-1.5 xl:grid-cols-2">
            {analysis.careers.map((career) => (
              <div
                key={career.slug}
                className={cn(
                  ADMIN_TEXT,
                  'flex items-baseline justify-between gap-3 px-2.5 py-2 rounded-[2px] bg-page border border-default',
                )}
              >
                <span className="text-primary font-medium min-w-0 truncate">{career.name}</span>
                <span className={cn(ADMIN_META, 'flex-shrink-0')}>
                  <span className={ADMIN_NUM}>{career.holland_code}</span>
                  {' · '}
                  <span className={ADMIN_NUM}>
                    {career.match_score}/{MAX_MATCH_SCORE}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ValueList
        label={t('print.section.thinking')}
        values={analysis.thinking_style as unknown as Record<string, number>}
        labels={{
          creative_think: 'admin:thinkingLong.creative_think',
          systematic: 'admin:thinkingLong.systematic',
          strategic: 'admin:thinkingLong.strategic',
          practical: 'admin:thinkingLong.practical',
        }}
      />
      <ChipList label={t('users.personalityHighlights')} items={analysis.personality_highlights} />
      <ValueList
        label={t('users.personalityProfile')}
        // Same five numbers as the Big Five bars in the summary above, under
        // trait names instead of letters (with N inverted into "эмоциональная
        // устойчивость"). Saying so beats letting an admin wonder which of two
        // near-identical tables is the real one.
        hint={t('users.personalityProfileHint')}
        values={analysis.personality_profile}
        labels={PERSONALITY_TRAIT_LABELS}
      />
      <TextNoteList
        label={t('users.personalityNotes')}
        notes={analysis.personality_notes}
        labels={PERSONALITY_TRAIT_LABELS}
      />
      <ChipList
        label={t('users.motivationTop')}
        items={analysis.motivation_top.map((key) => t(MOTIVATION_CATEGORY_LABELS[key]) ?? key)}
      />
      <ChipList label={t('users.motivationHighlights')} items={analysis.motivation_highlights} />
      <ValueList
        label={t('users.motivationScores')}
        // Ranked, not in API order: the question this table answers is which
        // motives came out on top, and the raw order buried the leader in the
        // middle of a nine-cell grid.
        sorted
        hint={t('users.motivationScoresHint')}
        values={analysis.motivation}
        labels={MOTIVATION_CATEGORY_LABELS}
      />
      <CardList label={t('users.strengthCards')} cards={analysis.strength_cards} />
      <CardList label={t('users.thinkingNotes')} cards={analysis.thinking_style_notes} />
    </div>
  );
}

function AssessmentPanel({
  user,
  assessment,
  userLabel,
  index,
}: {
  user: AdminUserDetail;
  assessment: AdminAssessmentDetail;
  userLabel: string;
  index: number;
}) {
  const { t } = useTranslation('admin');
  const incomplete = assessment.answered_count < assessment.total_questions;

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
            {t('print.answered')}{' '}
            <span className={cn(ADMIN_NUM, 'text-primary')}>
              {t('print.answeredOf', { count: assessment.answered_count, total: assessment.total_questions })}
            </span>
          </p>
          {/* A progress bar on a finished test is a bar that always reads
              "done" — it only carries information while questions remain. */}
          {incomplete && assessment.total_questions > 0 && (
            <div className="mt-1.5 w-[220px] max-w-full">
              <Spine
                value={(assessment.answered_count / assessment.total_questions) * 100}
                thickness={0.85}
                ariaLabel={t('users.answeredAria', { count: assessment.answered_count, total: assessment.total_questions })}
              />
            </div>
          )}
        </div>
        <AssessmentExportButtons
          user={user}
          assessment={assessment}
          userLabel={userLabel}
          index={index}
        />
      </div>

      <DiagnosticSummaryBlock assessment={assessment} />

      {assessment.analysis_result && (
        <Section title={t('users.analysisResult')} defaultOpen>
          <AnalysisSection analysis={assessment.analysis_result} />
        </Section>
      )}

      <Section title={t('users.questionsAnswers')} count={assessment.responses.length}>
        <ResponsesSection responses={assessment.responses} />
      </Section>

      <Section title={t('users.motivationTriplets')} count={assessment.motivation_responses.length}>
        <MotivationResponsesSection responses={assessment.motivation_responses} />
      </Section>

      {assessment.roadmap && (
        <Section title="Roadmap" count={assessment.roadmap.milestones.length}>
          <div className="flex flex-col gap-1.5">
            {assessment.roadmap.milestones.map((milestone) => (
              <div key={milestone.horizon} className="p-2.5 rounded-[2px] bg-page border border-default">
                <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{milestone.title}</p>
                <ul className={cn(ADMIN_TEXT, 'mt-1.5 mb-0 pl-4 text-secondary flex flex-col gap-0.5')}>
                  {milestone.tasks.map((task) => (
                    <li key={`${milestone.horizon}-${task.text}`}>{task.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/**
 * Account state as chips beside the identity.
 *
 * The healthy states stay quiet and the deviations take a tone — a disabled
 * account or an unverified email is the thing an admin opened this page to
 * find, and it used to be a "Нет" indistinguishable from the "Да" above it.
 * None of this is editable from the admin panel (only
 * scripts/make_admin.py and scripts/delete_user.py touch it), so it is
 * reported, not offered as a control — see
 * docs/admin-backend-requests-pro-242.md §10.
 */
function AccountFlags({ user }: { user: AdminUserDetail }) {
  const { t } = useTranslation('admin');
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {user.is_admin && (
        <AdminBadge tone="brand" title={t('users.adminHint')}>
          {t('users.adminBadge')}
        </AdminBadge>
      )}
      {!user.is_active && (
        <AdminBadge tone="danger" dot title={t('users.disabledHint')}>
          {t('users.disabled')}
        </AdminBadge>
      )}
      {!user.is_verified && (
        <AdminBadge tone="accent" dot title={t('users.emailUnverifiedHint')}>
          {t('users.emailUnverified')}
        </AdminBadge>
      )}
    </span>
  );
}

export default function AdminUserDetailPage() {
  const { t } = useTranslation('admin');
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [openAssessmentId, setOpenAssessmentId] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AdminAssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getUser(userId!);
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setError(t('users.loadOneError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  // Not auto-opened on mount any more: the previous screen fired a second
  // request for the newest assessment before the admin had asked for it, and
  // then rendered its full contents — the heaviest payload on the page — as
  // the default state.
  async function toggleAssessment(assessmentId: string) {
    if (openAssessmentId === assessmentId) {
      setOpenAssessmentId(null);
      setAssessment(null);
      return;
    }

    setOpenAssessmentId(assessmentId);
    setAssessment(null);
    setAssessmentError('');
    setAssessmentLoading(true);
    try {
      setAssessment(await adminApi.getAssessment(assessmentId));
    } catch {
      setAssessmentError(t('users.loadAssessmentError'));
    } finally {
      setAssessmentLoading(false);
    }
  }

  if (loading) return <AdminLoading label={t('users.loadingOne')} />;
  if (error || !user) {
    return <AdminError message={error || t('users.notFound')} onRetry={() => setReloadToken((t) => t + 1)} />;
  }

  const artifactsByType = user.artifacts.reduce<Record<string, string[]>>((acc, item) => {
    acc[item.type] = [...(acc[item.type] ?? []), item.value];
    return acc;
  }, {});

  return (
    <>
      <AdminPageHeader
        crumbs={[
          // Returns to the list as it was left — same filters, same page.
          { label: t('nav.users'), to: listReturnPath('/admin/users') },
          { label: user.profile?.name || user.email },
        ]}
        title={user.profile?.name || user.email}
        // Account state lives here as chips instead of in a card of "Да / Да /
        // Да" rows. A flag only matters when it deviates, and a chip shows that
        // at a glance where three identical "Да" did not.
        meta={
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(ADMIN_NUM, 'text-muted')}>{user.email}</span>
            <span className={ADMIN_META}>·</span>
            <span className={ADMIN_META}>{t('users.registeredOn', { date: formatDate(user.created_at) })}</span>
            <AccountFlags user={user} />
          </div>
        }
      />

      <AdminCard
        title={t('print.section.profile')}
        description={user.profile ? undefined : t('users.noProfile')}
      >
        {user.profile && (
          <>
            {/* One card, not two side by side. The account card held four rows
                next to a much taller profile card, so a third of the screen was
                empty box stretched to match its neighbour. */}
            <div className="grid gap-x-6 gap-y-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
              <Field label={t('common.col.age')} value={user.profile.age} />
              <Field label={t('print.grade')} value={user.profile.grade} />
              <Field
                label={t('users.tier')}
                // Was printed raw from the DB — a lowercase latin "senior" in a
                // column of Russian values.
                value={
                  user.profile.age_group
                    ? (AGE_TIER_LABELS[user.profile.age_group as AgeGroup] ?? user.profile.age_group)
                    : null
                }
              />
              <Field label={t('universities.col.city')} value={user.profile.city} />
              <Field label={t('universities.col.country')} value={user.profile.country} />
              <Field label={t('uni.languageCol')} value={user.profile.language} />
            </div>

            <div className="grid gap-x-6 gap-y-4 grid-cols-2 xl:grid-cols-4 pt-3.5 border-t border-default">
              <ChipField label={t('users.subjects.liked')} items={profileSubjects(user.profile, 'liked')} />
              <ChipField label={t('users.subjects.disliked')} items={profileSubjects(user.profile, 'disliked')} />
              <ChipField label={t('users.subjects.easy')} items={profileSubjects(user.profile, 'easy')} />
              <ChipField label={t('users.subjects.hard')} items={profileSubjects(user.profile, 'hard')} />
            </div>
          </>
        )}
      </AdminCard>

      {Object.keys(artifactsByType).length > 0 && (
        <AdminCard title={t('users.artifacts')} description={t('users.artifactsDescription')}>
          <div className="grid gap-x-6 gap-y-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            {Object.entries(artifactsByType).map(([type, valuesList]) => (
              <ChipList key={type} label={ARTIFACT_LABELS[type] ? t(ARTIFACT_LABELS[type]) : type} items={valuesList} />
            ))}
          </div>
        </AdminCard>
      )}

      <AdminCard
        title={t('users.assessments')}
        aside={<span className={ADMIN_META}>{user.assessments.length}</span>}
      >
        {user.assessments.length === 0 ? (
          <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>{t('users.noAssessments')}</p>
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {user.assessments.map((item, index) => {
              const isOpen = openAssessmentId === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    'rounded-[3px] border transition-colors',
                    isOpen ? 'border-brand' : 'border-default',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAssessment(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-hover transition-colors rounded-[3px]"
                  >
                    <div className="min-w-0">
                      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
                        {ASSESSMENT_GOAL_LABELS[item.goal] ?? item.goal}
                        <span className={cn(ADMIN_META, 'ml-2')}>#{user.assessments.length - index}</span>
                      </p>
                      <p className={cn(ADMIN_META, 'mt-0.5 normal-case tracking-normal')}>
                        {ASSESSMENT_STATUS_LABELS[item.status] ?? item.status} · {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.has_result ? (
                        <AdminBadge tone="neutral">{t('users.hasResult')}</AdminBadge>
                      ) : (
                        <AdminBadge tone="quiet" title={t('users.noResultHint')}>
                          {t('users.noResult')}
                        </AdminBadge>
                      )}
                      {item.has_roadmap && <AdminBadge tone="brand">Roadmap</AdminBadge>}
                      <ChevronDown
                        size={16}
                        className={cn('text-muted transition-transform', isOpen && 'rotate-180')}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3">
                      {assessmentLoading ? (
                        <AdminLoading label={t('users.loadingAssessment')} />
                      ) : assessmentError ? (
                        <AdminError message={assessmentError} onRetry={() => toggleAssessment(item.id)} />
                      ) : assessment ? (
                        <AssessmentPanel
                          user={user}
                          assessment={assessment}
                          userLabel={user.profile?.name || user.email}
                          index={user.assessments.length - index}
                        />
                      ) : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </>
  );
}
