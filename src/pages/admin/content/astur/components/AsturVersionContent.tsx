import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_INPUT, ADMIN_TEXTAREA, MONO_LABEL } from '@/shared/ui/admin/density';
import type { AsturBankDocument, AsturBankItem } from '@/shared/types';
import { AdminInlineItemTable, type AdminInlineItemColumn } from '../../AdminInlineItemTable';
import type { useAsturVersionEditor } from '../hooks/useAsturVersionEditor';
import { AsturItemEditor } from './AsturItemEditor';

interface AsturVersionContentProps {
  editor: ReturnType<typeof useAsturVersionEditor>;
  document: AsturBankDocument;
  readOnly: boolean;
}

function itemPreview(item: AsturBankItem): string {
  if (item.text?.ru) return item.text.ru;
  if (item.instruction?.ru) return item.instruction.ru;
  if (item.third?.ru) return `${item.pair?.ru.join(' : ')} = ${item.third.ru} : ?`;
  if (item.words?.ru) return item.words.ru.join(', ');
  if (item.concepts?.ru) return item.concepts.ru.join(' → ');
  if (item.pair?.ru) return item.pair.ru.join(' / ');
  if (item.sequence) return item.sequence.join(', ');
  return item.item_id;
}

/** Subtest rail + subtest header (names, instruction, timer) + item list /
 *  selected item editor. */
export function AsturVersionContent({ editor, document, readOnly }: AsturVersionContentProps) {
  const subtest = document.subtests[editor.activeSubtestIdx];
  const selectedIdx = editor.selectedItemIdx;
  const keyChanged = new Set(editor.version?.key_changed_item_ids ?? []);

  const columns: AdminInlineItemColumn<AsturBankItem>[] = [
    { key: 'index', header: '№', width: '56px', cell: (_item, index) => <span className={MONO_LABEL}>{index + 1}</span> },
    { key: 'preview', header: 'Задание (RU)', cell: (item) => itemPreview(item) },
    {
      key: 'status',
      header: 'Статус',
      width: '200px',
      cell: (item) => (
        <span className="flex flex-wrap gap-1">
          {keyChanged.has(item.item_id) && <AdminBadge tone="accent">ключ изменён</AdminBadge>}
          <AdminBadge tone={item.review_status === 'reviewed' ? 'brand' : 'quiet'}>
            {item.review_status === 'reviewed' ? 'проверено' : 'не проверено'}
          </AdminBadge>
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Субтесты АСТУР" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
        {document.subtests.map((s, idx) => (
          <button
            key={s.key}
            type="button"
            onClick={() => editor.selectSubtest(idx)}
            className={cn(
              MONO_LABEL,
              'text-left px-3.5 py-2.5 rounded-[14px] whitespace-nowrap lg:whitespace-normal transition-colors flex-shrink-0 lg:w-full',
              editor.activeSubtestIdx === idx ? 'field-tile text-brand font-semibold' : 'text-secondary hover:text-primary hover:bg-hover',
            )}
          >
            {s.number}. {s.name.ru}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-5 min-w-0">
        <AdminCard title="Субтест" description={`${subtest.items.length} заданий · метод оценки: ${subtest.scoring_method}`}>
          <fieldset disabled={readOnly} className="grid gap-3.5 sm:grid-cols-2 m-0 p-0 border-0 min-w-0">
            {(['ru', 'kk'] as const).map((lang) => (
              <AdminField key={`name-${lang}`} label={`Название (${lang.toUpperCase()})`}>
                {({ id }) => (
                  <input id={id} className={ADMIN_INPUT} value={subtest.name[lang]} onChange={(e) => editor.setSubtestText(lang, 'name', e.target.value)} />
                )}
              </AdminField>
            ))}
            {(['ru', 'kk'] as const).map((lang) => (
              <AdminField key={`instr-${lang}`} label={`Инструкция (${lang.toUpperCase()})`}>
                {({ id }) => (
                  <textarea
                    id={id}
                    className={ADMIN_TEXTAREA}
                    value={subtest.instruction[lang]}
                    onChange={(e) => editor.setSubtestText(lang, 'instruction', e.target.value)}
                  />
                )}
              </AdminField>
            ))}
            {subtest.time_limit_sec !== null && (
              <AdminField label="Таймер субтеста, секунд">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    className={ADMIN_INPUT}
                    value={subtest.time_limit_sec ?? ''}
                    onChange={(e) => editor.setSubtestTimer(e.target.value ? Number(e.target.value) : null)}
                  />
                )}
              </AdminField>
            )}
          </fieldset>
        </AdminCard>

        {selectedIdx === null ? (
          <AdminCard title="Задания" description="Нажмите на строку, чтобы открыть задание: текст, варианты и ключ вместе.">
            <AdminInlineItemTable label="Задания субтеста" columns={columns} rows={subtest.items} onRowClick={editor.setSelectedItemIdx} />
          </AdminCard>
        ) : (
          <AdminCard
            title={`Задание #${selectedIdx + 1}`}
            aside={
              <button
                type="button"
                onClick={() => editor.setSelectedItemIdx(null)}
                className="inline-flex items-center gap-1.5 text-body-sm font-medium text-secondary hover:text-brand transition-colors"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Назад к списку
              </button>
            }
          >
            <AsturItemEditor
              subtest={subtest}
              item={subtest.items[selectedIdx]}
              subjects={document.subjects}
              readOnly={readOnly}
              onChange={(next) => editor.updateItem(selectedIdx, next)}
            />
          </AdminCard>
        )}
      </div>
    </div>
  );
}
