import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/lib/assessmentLabels';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';
import type {
  AdminAssessmentDetail,
  AdminUserDetail,
  AgeGroup,
  BigFiveDomain,
  HollandType,
  MotivationCategory,
} from '@/shared/types';

/**
 * Печатная версия прохождения — то, что уходит в PDF.
 *
 * Не копия экрана. Экран интерактивный: секции сворачиваются, 314 ответов
 * лежат под катом, есть ховеры и кнопки. На бумаге ничего этого нет, поэтому
 * здесь отдельная вёрстка: всё раскрыто, одна колонка, никаких элементов
 * управления, полосы — заливкой, которую браузер печатает
 * (`print-color-adjust: exact`).
 *
 * Что НЕ попадает в PDF: 314 строк «вопрос — ответ» и 12 троек мотивации. Это
 * ~20 страниц сырых данных, для которых уже есть ZIP с CSV — там их можно
 * фильтровать и считать, чего в PDF всё равно не сделать. PDF отвечает на
 * вопрос «что получилось у ученика», ZIP — «из чего это посчитано».
 *
 * Разметка намеренно на инлайновых стилях, а не на Tailwind-классах: печатный
 * лист — единственное место в проекте, где ширина фиксирована в миллиметрах, а
 * не в вьюпорте, и утилитарные классы тут только мешали бы читать вёрстку.
 */

const RIASEC_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const BIG_FIVE_ORDER: BigFiveDomain[] = ['O', 'C', 'E', 'A', 'N'];

const RIASEC_LABELS: Record<HollandType, string> = {
  R: 'admin:riasecShort.R',
  I: 'admin:riasecShort.I',
  A: 'admin:riasecShort.A',
  S: 'admin:riasecShort.S',
  E: 'admin:riasecShort.E',
  C: 'admin:riasecShort.C',
};

const BIG_FIVE_LABELS: Record<BigFiveDomain, string> = {
  O: 'admin:bigfiveShort.O',
  C: 'admin:bigfiveShort.C',
  E: 'admin:bigfiveShort.E',
  A: 'admin:bigfiveShort.A',
  N: 'admin:bigfiveShort.N',
};

const THINKING_LABELS: Record<string, string> = {
  creative_think: 'admin:thinking.creative_think',
  systematic: 'admin:thinking.systematic',
  strategic: 'admin:thinking.strategic',
  practical: 'admin:thinking.practical',
};

const MOTIVATION_LABELS: Record<string, string> = {
  interest: 'admin:motivation.interest',
  challenge: 'admin:motivation.challenge',
  helping: 'admin:motivation.helping',
  freedom: 'admin:motivation.freedom',
  money: 'admin:motivation.money',
  recognition: 'admin:motivation.recognition',
  stability: 'admin:motivation.stability',
  creation: 'admin:motivation.creation',
  teamwork: 'admin:motivation.teamwork',
};

const CONSISTENCY_LABELS: Record<string, string> = {
  high: 'admin:summary.level.high',
  medium: 'admin:summary.level.medium',
  low: 'admin:summary.level.low',
};

/** Тот же потолок, что в карточке: топ-3 ученика × позиция буквы, 3·3+2·2+1·1. */
const MAX_MATCH_SCORE = 14;

/**
 * Единственное место в проекте, где палитра «Тропы» зашита литералами, а не
 * взята из токенов — и намеренно.
 *
 * `var(--text-primary)` в тёмной теме светлый. Бумага белая всегда: у админа с
 * включённой тёмной темой отчёт ушёл бы на печать почти невидимым. Печатный
 * лист живёт в одной, светлой теме, поэтому берёт светлые значения токенов
 * напрямую. Значения — из src/styles/theme.css, светлый блок.
 */
const INK = '#26332F';
const MUTE = '#6B7671';
const LINE = '#D2CCBE';
const PINE = '#0E4A41';
const LAKE = '#2C6A8C';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return formatIntlDate(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '58mm',
        height: '2.4mm',
        background: '#E7E2D5',
        borderRadius: '1px',
        overflow: 'hidden',
        verticalAlign: 'middle',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <span
        style={{
          display: 'block',
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      />
    </span>
  );
}

function ScaleRows({
  rows,
  color,
}: {
  rows: { key: string; label: string; value: number }[];
  color: string;
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td style={{ width: '8mm', padding: '0.8mm 0', fontFamily: 'var(--font-mono)', color: MUTE }}>
              {row.key}
            </td>
            <td style={{ padding: '0.8mm 0' }}>{row.label}</td>
            <td style={{ width: '60mm', padding: '0.8mm 0' }}>
              <Bar value={row.value} color={color} />
            </td>
            <td
              style={{
                width: '12mm',
                padding: '0.8mm 0',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(row.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: '7mm', breakInside: 'avoid' }}>
      <h2
        style={{
          fontSize: '11pt',
          fontWeight: 600,
          margin: '0 0 2.5mm',
          paddingBottom: '1.2mm',
          borderBottom: `0.3mm solid ${LINE}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

interface AssessmentPrintReportProps {
  user: AdminUserDetail;
  assessment: AdminAssessmentDetail;
  /** Порядковый номер прохождения в карточке пользователя. */
  index: number;
}

export function AssessmentPrintReport({ user, assessment, index }: AssessmentPrintReportProps) {
  const { t } = useTranslation('admin');
  const analysis = assessment.analysis_result;
  const profile = user.profile;
  const name = profile?.name || user.email;

  const blockCounts = new Map<string, number>();
  for (const response of assessment.responses) {
    blockCounts.set(response.instrument, (blockCounts.get(response.instrument) ?? 0) + 1);
  }

  // Junior измеряется через MI, а не RIASEC: у него в `profile` лежат категории
  // MI, и подписывать их буквами Холланда было бы враньём.
  const isRiasecProfile =
    analysis != null && RIASEC_ORDER.some((letter) => letter in (analysis.profile ?? {}));

  const body = (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '9.5pt',
        lineHeight: 1.45,
        color: INK,
        background: '#fff',
        padding: '0',
      }}
    >
      <header style={{ borderBottom: `0.5mm solid ${INK}`, paddingBottom: '3mm' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '7.5pt',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: MUTE,
          }}
        >
          {t('print.assessmentBrand')}
        </p>
        <h1 style={{ fontSize: '17pt', fontWeight: 600, margin: '1.5mm 0 0' }}>{name}</h1>
        <p style={{ margin: '1mm 0 0', color: MUTE }}>
          {user.email}
          {profile?.age_group ? ` · ${AGE_TIER_LABELS[profile.age_group as AgeGroup]}` : ''}
          {' · '}
          {t(ASSESSMENT_GOAL_LABELS[assessment.goal])} · {t('print.attemptNo', { index })}
        </p>
      </header>

      <Section title={t('print.section.profile')}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              [t('common.col.age'), profile?.age != null ? `${profile.age}` : '—'],
              [t('print.grade'), profile?.grade != null ? `${profile.grade}` : '—'],
              [t('universities.col.city'), [profile?.city, profile?.country].filter(Boolean).join(', ') || '—'],
              [t('print.completed'), formatDate(assessment.completed_at)],
              [t('print.started'), formatDate(assessment.created_at)],
              [t('print.answered'), t('print.answeredOf', { count: assessment.answered_count, total: assessment.total_questions })],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ width: '32mm', padding: '0.6mm 0', color: MUTE }}>{label}</td>
                <td style={{ padding: '0.6mm 0' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={t('print.section.composition')}>
        <p style={{ margin: 0 }}>
          {[...blockCounts.entries()]
            .map(([instrument, count]) => `${instrument.toUpperCase()} — ${count}`)
            .join(' · ')}
          {assessment.motivation_responses.length > 0
            ? ` · ${t('print.motivationTriplets', { count: assessment.motivation_responses.length })}`
            : ''}
        </p>
      </Section>

      {analysis && isRiasecProfile && (
        <Section title={t('print.section.riasec')}>
          <ScaleRows
            color={PINE}
            rows={RIASEC_ORDER.filter((key) => key in analysis.profile).map((key) => ({
              key,
              label: t(RIASEC_LABELS[key]),
              value: analysis.profile[key],
            }))}
          />
          <p style={{ margin: '2mm 0 0', color: MUTE }}>
            {t('print.code', { code: analysis.code.join(' · ') || '—' })} · {t('summary.consistency')}{' '}
            {CONSISTENCY_LABELS[analysis.meta.consistency] ? t(CONSISTENCY_LABELS[analysis.meta.consistency]) : analysis.meta.consistency} ·
            {t('print.differentiation', { value: Math.round(analysis.meta.differentiation) })}
          </p>
        </Section>
      )}

      {analysis && !isRiasecProfile && Object.keys(analysis.profile).length > 0 && (
        <Section title={t('print.section.mi')}>
          <ScaleRows
            color={PINE}
            rows={Object.entries(analysis.profile).map(([key, value]) => ({
              key: '',
              label: key,
              value,
            }))}
          />
        </Section>
      )}

      {analysis && Object.keys(analysis.big_five).length > 0 && (
        <Section title={t('print.section.bigfive')}>
          <ScaleRows
            color={LAKE}
            rows={BIG_FIVE_ORDER.filter((key) => key in analysis.big_five).map((key) => ({
              key,
              label: t(BIG_FIVE_LABELS[key]),
              value: analysis.big_five[key],
            }))}
          />
        </Section>
      )}

      {analysis && Object.keys(analysis.thinking_style).length > 0 && (
        <Section title={t('print.section.thinking')}>
          <ScaleRows
            color={LAKE}
            rows={Object.entries(analysis.thinking_style).map(([key, value]) => ({
              key: '',
              label: THINKING_LABELS[key] ? t(THINKING_LABELS[key]) : key,
              value: value as number,
            }))}
          />
        </Section>
      )}

      {analysis && analysis.motivation_top.length > 0 && (
        <Section title={t('feedback.sectionShort.motivation')}>
          <p style={{ margin: '0 0 1.5mm' }}>
            {t('print.topMotives')}{' '}
            <strong>
              {analysis.motivation_top
                .map((key) => (MOTIVATION_LABELS[key as MotivationCategory] ? t(MOTIVATION_LABELS[key as MotivationCategory]) : key))
                .join(', ')}
            </strong>
          </p>
          {/* Сырые баллы мотивации — счётчики выборов без документированного
              потолка, поэтому без полос: полоса подразумевала бы шкалу. */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(analysis.motivation)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ padding: '0.6mm 0' }}>{MOTIVATION_LABELS[key] ? t(MOTIVATION_LABELS[key]) : key}</td>
                    <td
                      style={{
                        width: '14mm',
                        padding: '0.6mm 0',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Section>
      )}

      {analysis && analysis.careers.length > 0 && (
        <Section title={t('print.section.directions')}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {analysis.careers.map((career, position) => (
                <tr key={career.name}>
                  <td
                    style={{
                      width: '8mm',
                      padding: '0.7mm 0',
                      color: MUTE,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {position + 1}
                  </td>
                  <td style={{ padding: '0.7mm 0' }}>{career.name}</td>
                  <td
                    style={{
                      width: '22mm',
                      padding: '0.7mm 0',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      color: MUTE,
                    }}
                  >
                    {career.match_score} / {MAX_MATCH_SCORE}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '2mm 0 0', color: MUTE }}>
            {t('print.matchNote', { max: MAX_MATCH_SCORE })}
          </p>
        </Section>
      )}

      {analysis && Object.keys(analysis.personality_notes).length > 0 && (
        <Section title={t('print.section.meaning')}>
          {Object.entries(analysis.personality_notes).map(([key, note]) => (
            <p key={key} style={{ margin: '0 0 1.5mm' }}>
              {note}
            </p>
          ))}
        </Section>
      )}

      {analysis && analysis.summary && (
        <Section title={t('print.section.summary')}>
          <p style={{ margin: 0 }}>{analysis.summary}</p>
        </Section>
      )}

      <footer
        style={{
          marginTop: '8mm',
          paddingTop: '2mm',
          borderTop: `0.3mm solid ${LINE}`,
          color: MUTE,
          fontSize: '8pt',
        }}
      >
        {t('print.assessmentFootnote')}
      </footer>
    </div>
  );

  return createPortal(
    <div id="print-root" data-print-root>
      {body}
    </div>,
    document.body,
  );
}
