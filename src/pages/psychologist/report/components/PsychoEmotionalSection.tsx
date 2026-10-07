import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { formatDate as formatLocaleDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { PsychoEmotionalInterpretation } from '@/shared/ui';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychoEmotionalSection as PsychoEmotionalSectionData } from '@/shared/types';

const SIGN_LABELS: Record<string, string> = { plus: '+', cross: '×', equal: '=', minus: '−' };

const VALIDITY_FLAG_TONES: Record<string, AdminBadgeTone> = { ok: 'brand', caution: 'quiet', low: 'danger' };

// Hex from the canonical МЦВ palette (psychoColors.ts) — this card used to
// carry its own, different set of colours.
function ColorChip({ id }: { id: number }) {
  const { t } = useTranslation('assessment');
  const colour = PSYCHO_COLOR_BY_ID[id];
  const name = colour ? t(`psychoemotional.color.${id}`) : String(id);
  return (
    <span className="inline-flex items-center gap-1.5" title={name}>
      <span className="w-3.5 h-3.5 rounded-full border border-default flex-shrink-0" style={{ background: colour?.hex }} />
      <span className={cn(ADMIN_META, 'capitalize')}>{name}</span>
    </span>
  );
}

function formatDate(value: string) {
  return formatLocaleDate(value, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** PRO-282 «Психоэмоциональный тест» (МЦВ Собчик — слово «Люшер» в продукте
 *  не используется). Ф4.1 — впервые на этом фронтенде. Сверху — текстовое
 *  толкование-гипотезы (PRO-448, по запросу специалистов), под ним сырые
 *  числа и раскладки. */
export function PsychoEmotionalSection({ section }: { section?: PsychoEmotionalSectionData | null }) {
  const { t } = useTranslation('psychologist');
  if (!section) return null;
  const { anxiety, compensation } = section;

  return (
    <AdminCard
      title={t('psycho.title')}
      description={t('psycho.method')}
      aside={<AdminBadge tone="quiet">{t('psycho.run', { n: section.run_number })}</AdminBadge>}
    >
      <p className={cn(ADMIN_META, 'mb-3')}>{formatDate(section.completed_at)}</p>

      {section.validity_flag && (
        <div className="flex items-center gap-2 mb-3">
          <AdminBadge tone={VALIDITY_FLAG_TONES[section.validity_flag] ?? 'neutral'}>
            {t(`psychoCabinet.validity.${section.validity_flag}`)}
          </AdminBadge>
          {section.validity_reasons.length > 0 && (
            <span className={ADMIN_META}>
              {section.validity_reasons
                .map((code) => t(`psycho.reason.${code}`, { defaultValue: code }))
                .join(', ')}
            </span>
          )}
        </div>
      )}

      {section.black_first && (
        <div role="alert" className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle">
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
            {t('psychoCabinet.blackFirst')}
          </p>
        </div>
      )}

      <PsychoEmotionalInterpretation interpretation={section.interpretation} className="mb-4 pb-4 border-b border-default" />

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(ADMIN_META, 'w-20 flex-shrink-0')}>{t('psychoCabinet.choice1')}</span>
          <div className="flex flex-wrap gap-2">
            {section.choice_1.map((id, i) => <ColorChip key={`c1-${i}-${id}`} id={id} />)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(ADMIN_META, 'w-20 flex-shrink-0')}>{t('psychoCabinet.choice2')}</span>
          <div className="flex flex-wrap gap-2">
            {section.choice_2.map((id, i) => <ColorChip key={`c2-${i}-${id}`} id={id} />)}
          </div>
        </div>
      </div>

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5 mb-4">
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.d')}</span>
          <span className={ADMIN_NUM}>
            {section.d_value}
            {section.d_memory && t('psychoCabinet.dMemory')}
            {section.d_situationally_unstable && t('psychoCabinet.dUnstable')}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.splitPairs')}</span>
          <span className={ADMIN_NUM}>{section.split_count}/4
            {section.instability && t('psychoCabinet.instability')}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.rootConflict')}</span>
          <span className="flex items-center gap-2">
            <ColorChip id={section.root_conflict[0]} /> — <ColorChip id={section.root_conflict[1]} />
          </span>
        </li>
      </ul>

      {section.positional_pairs.length > 0 && (
        <div className="mb-4">
          <p className={cn(ADMIN_META, 'mb-1.5')}>{t('psychoCabinet.pairs')}</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {section.positional_pairs.map((pair, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={cn(ADMIN_NUM, 'w-4')}>{SIGN_LABELS[pair.sign] ?? pair.sign}</span>
                <ColorChip id={pair.colors[0]} /> <ColorChip id={pair.colors[1]} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.anxiety')}</span>
          <span className={ADMIN_NUM}>
            {anxiety.score}/12 · {t(`psycho.level.anxiety.${anxiety.level}`)}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.compensation')}</span>
          <span className={ADMIN_NUM}>
            {compensation.score}/9 · {t(`psycho.level.compensation.${compensation.level}`)}
            {compensation.purple_forward && t('psychoCabinet.purpleForward')}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.so')}</span>
          <span className={ADMIN_NUM}>
            {section.so_value}/32 · {t(`psycho.level.so.${section.so_level}`)}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>{t('psychoCabinet.vk')}</span>
          <span className={ADMIN_NUM}>
            {section.vk_value.toFixed(2)} · {t(`psycho.level.vk.${section.vk_level}`)}
          </span>
        </li>
      </ul>

      {section.history.length > 0 && (
        <div className="pt-3 mt-3 border-t border-default">
          <p className={cn(ADMIN_META, 'mb-1.5')}>{t('psychoCabinet.history')}</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {section.history.map((run) => (
              <li key={run.run_number} className="flex items-center justify-between gap-2">
                <span className={ADMIN_META}>№{run.run_number} · {formatDate(run.completed_at)}</span>
                <span className={ADMIN_NUM}>
                  {run.so !== null ? t('psychoCabinet.historySo', { value: run.so }) : '—'}
                  {run.anxiety_score !== null && t('psychoCabinet.historyAnxiety', { value: run.anxiety_score })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminCard>
  );
}
