import { createPortal } from 'react-dom';
import { PrintMasthead } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import type { AdminUserListItem } from '@/shared/types';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';

/**
 * Печатная версия списка пользователей.
 *
 * Отвечает на другой вопрос, чем CSV: CSV — данные для таблицы (баллы RIASEC,
 * Big Five, идентификаторы), PDF — сводка, которую распечатывают или
 * пересылают. Поэтому здесь нет колонок с сырыми баллами: одиннадцать чисел на
 * строку на A4 не читаются, а в CSV они уже есть.
 *
 * Ключевое требование к такому листу — сказать, что именно на нём. Экспорт
 * идёт по текущим фильтрам, и лист без их перечисления через неделю
 * невозможно интерпретировать: «63 пользователя» из какого среза?
 *
 * Палитра литералами — по той же причине, что и в AssessmentPrintReport:
 * бумага всегда светлая, токены темы — нет.
 */

const INK = '#203A30';
const MUTE = '#65735F';
const LINE = '#DCE3D7';

function formatDate(value: string): string {
  return formatIntlDate(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const CELL: React.CSSProperties = {
  padding: '1.4mm 2mm 1.4mm 0',
  borderBottom: `0.2mm solid ${LINE}`,
  verticalAlign: 'top',
};

interface UsersPrintReportProps {
  /** Render the same document inline in the DEV design gallery. */
  preview?: boolean;
  items: readonly AdminUserListItem[];
  /** Сколько строк подошло под фильтры на сервере — может быть больше `items`. */
  total: number;
  /** Человекочитаемые активные фильтры: «Ступень: 14 лет и старше», … */
  filters: readonly string[];
  /** True, когда выгрузка упёрлась в потолок и на листе не весь срез. */
  truncated: boolean;
}

export function UsersPrintReport({ items, total, filters, truncated, preview = false }: UsersPrintReportProps) {
  const { t } = useTranslation('admin');
  const body = (
    <div className="print-report"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '9pt',
        lineHeight: 1.4,
        color: INK,
        background: '#fff',
      }}
    >
      <PrintMasthead label={t('nav.kicker')} title={t('nav.users')}>
        <p style={{ margin: '1.5mm 0 0', color: MUTE }}>
          {t('print.usersInExport', { count: items.length })}
          {items.length !== total ? t('print.ofMatching', { total }) : ''} · {t('print.exportedAt')}{' '}
          {formatIntlDate(new Date(), {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        {/* Без этой строки лист через неделю не интерпретировать: непонятно,
            срез это или все пользователи. */}
        <p style={{ margin: '1mm 0 0', color: MUTE }}>
          {filters.length > 0 ? t('print.filters', { filters: filters.join(' · ') }) : t('print.noFilters')}
        </p>
        {truncated && (
          <p style={{ margin: '1mm 0 0', color: '#A6572F' }}>
            {t('print.truncated', { count: items.length })}
          </p>
        )}
      </PrintMasthead>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4mm' }}>
        <thead>
          <tr>
            {[t('feedback.col.user'), t('common.col.age'), t('users.col.assessment'), t('users.col.goal'), t('print.testsCount'), t('users.col.registered')].map(
              (header, index) => (
                <th
                  key={header}
                  style={{
                    ...CELL,
                    borderBottom: `0.3mm solid ${INK}`,
                    textAlign: index >= 4 ? 'right' : 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '7pt',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: MUTE,
                    fontWeight: 500,
                  }}
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ breakInside: 'avoid' }}>
              <td style={CELL}>
                <span style={{ fontWeight: 600 }}>{item.profile_name ?? '—'}</span>
                <br />
                <span style={{ color: MUTE, fontSize: '8pt' }}>{item.email}</span>
              </td>
              <td style={CELL}>
                {item.age != null ? t('common:ageYears', { count: item.age }) : '—'}
              </td>
              <td style={CELL}>
                {item.latest_assessment_status
                  ? t(ASSESSMENT_STATUS_LABELS[item.latest_assessment_status])
                  : t('users.status.notStarted')}
              </td>
              <td style={CELL}>
                {item.latest_assessment_goal
                  ? t(ASSESSMENT_GOAL_LABELS[item.latest_assessment_goal])
                  : '—'}
              </td>
              <td
                style={{
                  ...CELL,
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {item.assessments_count}
              </td>
              <td
                style={{
                  ...CELL,
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(item.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: '5mm', color: MUTE, fontSize: '8pt' }}>
        {t('print.rawScoresNote')}
      </footer>
    </div>
  );

  if (preview) return body;
  return createPortal(<div id="print-root">{body}</div>, document.body);
}
