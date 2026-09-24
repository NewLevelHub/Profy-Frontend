import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychoEmotionalSection as PsychoEmotionalSectionData } from '@/shared/types';

const COLOR_LABELS: Record<number, string> = {
  0: 'Серый', 1: 'Синий', 2: 'Зелёный', 3: 'Красный',
  4: 'Жёлтый', 5: 'Фиолетовый', 6: 'Коричневый', 7: 'Чёрный',
};

const COLOR_HEX: Record<number, string> = {
  0: '#9AA3AD', 1: '#2E5FA3', 2: '#3D8B4C', 3: '#C0392B',
  4: '#E0B23C', 5: '#8E6BAE', 6: '#8B5A2B', 7: '#1F2328',
};

const SIGN_LABELS: Record<string, string> = { plus: '+', cross: '×', equal: '=', minus: '−' };

const VALIDITY_FLAG_LABELS: Record<string, string> = { ok: 'Прохождение достоверно', caution: 'Есть замечания', low: 'Низкая достоверность' };
const VALIDITY_FLAG_TONES: Record<string, AdminBadgeTone> = { ok: 'brand', caution: 'quiet', low: 'danger' };

function ColorChip({ id }: { id: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={COLOR_LABELS[id] ?? String(id)}>
      <span className="w-3.5 h-3.5 rounded-full border border-default flex-shrink-0" style={{ background: COLOR_HEX[id] }} />
      <span className={ADMIN_META}>{COLOR_LABELS[id] ?? id}</span>
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** PRO-282 «Психоэмоциональный тест» (МЦВ Собчик — слово «Люшер» в продукте
 *  не используется). Ф4.1 — впервые на этом фронтенде. Только сырые числа/
 *  раскладки: трактовка — целиком за специалистом (та же оговорка, что в
 *  схеме бэкенда), эта секция намеренно не подсказывает выводов. */
export function PsychoEmotionalSection({ section }: { section?: PsychoEmotionalSectionData | null }) {
  if (!section) return null;
  const { anxiety, compensation } = section;

  return (
    <AdminCard
      title="Психоэмоциональный тест"
      description="Метод цветовых выборов (МЦВ)"
      aside={<AdminBadge tone="quiet">Прохождение №{section.run_number}</AdminBadge>}
    >
      <p className={cn(ADMIN_META, 'mb-3')}>{formatDate(section.completed_at)}</p>

      {section.validity_flag && (
        <div className="flex items-center gap-2 mb-3">
          <AdminBadge tone={VALIDITY_FLAG_TONES[section.validity_flag] ?? 'neutral'}>
            {VALIDITY_FLAG_LABELS[section.validity_flag] ?? section.validity_flag}
          </AdminBadge>
          {section.validity_reasons.length > 0 && (
            <span className={ADMIN_META}>{section.validity_reasons.join(', ')}</span>
          )}
        </div>
      )}

      {section.black_first && (
        <div role="alert" className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle">
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
            Чёрный на первой позиции — подростковый маркер риска, повод обсудить на встрече (не автоматический вывод).
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(ADMIN_META, 'w-20 flex-shrink-0')}>Выбор 1</span>
          <div className="flex flex-wrap gap-2">
            {section.choice_1.map((id, i) => <ColorChip key={`c1-${i}-${id}`} id={id} />)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(ADMIN_META, 'w-20 flex-shrink-0')}>Выбор 2</span>
          <div className="flex flex-wrap gap-2">
            {section.choice_2.map((id, i) => <ColorChip key={`c2-${i}-${id}`} id={id} />)}
          </div>
        </div>
      </div>

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5 mb-4">
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Расхождение D</span>
          <span className={ADMIN_NUM}>
            {section.d_value}{section.d_memory && ' · выбор по памяти'}{section.d_situationally_unstable && ' · ситуативно нестабильно'}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Расщеплённых пар</span>
          <span className={ADMIN_NUM}>{section.split_count}/4{section.instability && ' · нестабильность'}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Корневой конфликт</span>
          <span className="flex items-center gap-2">
            <ColorChip id={section.root_conflict[0]} /> — <ColorChip id={section.root_conflict[1]} />
          </span>
        </li>
      </ul>

      {section.positional_pairs.length > 0 && (
        <div className="mb-4">
          <p className={cn(ADMIN_META, 'mb-1.5')}>Функциональные пары</p>
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
          <span className={ADMIN_META}>Индекс тревоги</span>
          <span className={ADMIN_NUM}>{anxiety.score}/12 · {anxiety.level}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Индекс компенсации</span>
          <span className={ADMIN_NUM}>
            {compensation.score}/9 · {compensation.level}
            {compensation.purple_forward && ' · фиолетовый впереди'}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Суммарное отклонение (СО)</span>
          <span className={ADMIN_NUM}>{section.so_value}/32 · {section.so_level}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className={ADMIN_META}>Вегетативный коэффициент (ВК)</span>
          <span className={ADMIN_NUM}>{section.vk_value.toFixed(2)} · {section.vk_level}</span>
        </li>
      </ul>

      {section.history.length > 0 && (
        <div className="pt-3 mt-3 border-t border-default">
          <p className={cn(ADMIN_META, 'mb-1.5')}>Предыдущие прохождения</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {section.history.map((run) => (
              <li key={run.run_number} className="flex items-center justify-between gap-2">
                <span className={ADMIN_META}>№{run.run_number} · {formatDate(run.completed_at)}</span>
                <span className={ADMIN_NUM}>
                  {run.so !== null ? `СО ${run.so}` : '—'}
                  {run.anxiety_score !== null && ` · тревога ${run.anxiety_score}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={cn(ADMIN_META, 'mt-3')}>
        Раскладки и индексы — исходные данные. Трактовка целиком за специалистом.
      </p>
    </AdminCard>
  );
}
