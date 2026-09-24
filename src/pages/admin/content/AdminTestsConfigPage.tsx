import { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import type { AsturBankItem } from '@/shared/types';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXT, ADMIN_TEXTAREA, MONO_LABEL } from '@/shared/ui/admin/density';
import { AdminInlineItemTable, type AdminInlineItemColumn } from './AdminInlineItemTable';
import { useAsturEditor } from './useAsturEditor';

/** First non-empty field, so the picker table has something to show per
 *  item regardless of which fields this subtest's items carry. */
function itemPreview(item: AsturBankItem): string {
  if (item.text?.ru) return item.text.ru;
  if (item.instruction?.ru) return item.instruction.ru;
  if (item.third?.ru) return item.third.ru;
  if (item.words?.ru) return item.words.ru.join(', ');
  if (item.concepts?.ru) return item.concepts.ru.join(' → ');
  if (item.pair?.ru) return item.pair.ru.filter(Boolean).join(' / ');
  if (item.sequence) return item.sequence.join(', ');
  return '—';
}

export default function AdminTestsConfigPage() {
  const {
    isLoading,
    isLoadError,
    subtestsRu,
    subtestsKk,
    activeSubtestIdx,
    setActiveSubtestIdx,
    setSubtestField,
    setItemLocalizedField,
    setItemListField,
    setItemSequence,
    dirty,
    saving,
    state,
    reset,
    save,
  } = useAsturEditor();

  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);

  const selectSubtest = (idx: number) => {
    setActiveSubtestIdx(idx);
    setSelectedItemIdx(null);
  };

  if (isLoadError) {
    return <AdminError message="Не удалось загрузить контент АСТУР." />;
  }

  if (isLoading) {
    return <AdminLoading label="Загрузка контента АСТУР…" />;
  }

  const activeRu = subtestsRu[activeSubtestIdx];
  const activeKk = subtestsKk[activeSubtestIdx];
  const hasEditableItems = !activeRu.items.every((item) => Object.keys(item).length === 0);

  const columns: AdminInlineItemColumn<AsturBankItem>[] = [
    { key: 'index', header: '№', width: '56px', cell: (_item, index) => <span className={MONO_LABEL}>{index + 1}</span> },
    { key: 'preview', header: 'Задание (RU)', cell: (item) => itemPreview(item) },
    ...(activeRu.items.some((item) => item.answer_format)
      ? [{ key: 'format', header: 'Формат', width: '128px', cell: (item: AsturBankItem) => item.answer_format ?? '—' }]
      : []),
  ];

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: 'АСТУР — редактор контента' }]}
        title="АСТУР (Характеристики интеллекта)"
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            8 субтестов · {subtestsRu.reduce((sum, s) => sum + s.items.length, 0)} заданий · правки хранятся поверх
            банка и переживают деплой, но не пересоздание базы
          </p>
        }
        actions={dirty && <UnsavedBadge />}
      />

      <div className="flex items-start gap-2.5 p-3.5 rounded-[14px] border border-warning bg-warning-subtle">
        <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
        <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
          Правильные ответы и ключи оценивания в этом редакторе не показываются и не редактируются — только текст,
          который видит проходящий тест. Меняя формулировку варианта ответа, слова в списке или числовой ряд,
          убедитесь, что смысл (а для чисел — закономерность) не потерялся: скрытый правильный ответ автоматически не
          пересчитывается.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Субтесты АСТУР" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {subtestsRu.map((subtest, idx) => (
            <button
              key={subtest.key}
              type="button"
              onClick={() => selectSubtest(idx)}
              className={cn(
                MONO_LABEL,
                'text-left px-3.5 py-2.5 rounded-[14px] whitespace-nowrap lg:whitespace-normal transition-colors flex-shrink-0 lg:w-full',
                activeSubtestIdx === idx
                  ? 'field-tile text-brand font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-hover',
              )}
            >
              {subtest.number}. {subtest.name.ru}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-5 min-w-0">
          <AdminCard
            title="Название и инструкция субтеста"
            description={`${activeRu.item_count} заданий · ${activeRu.scored ? 'входит в общий балл' : 'считается отдельно'}`}
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <AdminField label="Название (RU)">
                {({ id }) => (
                  <input
                    id={id}
                    className={ADMIN_INPUT}
                    value={activeRu.name.ru}
                    onChange={(e) => setSubtestField('ru', 'name', e.target.value)}
                  />
                )}
              </AdminField>
              <AdminField label="Название (KK)">
                {({ id }) => (
                  <input
                    id={id}
                    className={ADMIN_INPUT}
                    value={activeKk.name.kk}
                    onChange={(e) => setSubtestField('kk', 'name', e.target.value)}
                  />
                )}
              </AdminField>
              <AdminField label="Инструкция (RU)">
                {({ id }) => (
                  <textarea
                    id={id}
                    className={ADMIN_TEXTAREA}
                    value={activeRu.instruction.ru}
                    onChange={(e) => setSubtestField('ru', 'instruction', e.target.value)}
                  />
                )}
              </AdminField>
              <AdminField label="Инструкция (KK)">
                {({ id }) => (
                  <textarea
                    id={id}
                    className={ADMIN_TEXTAREA}
                    value={activeKk.instruction.kk}
                    onChange={(e) => setSubtestField('kk', 'instruction', e.target.value)}
                  />
                )}
              </AdminField>
            </div>
          </AdminCard>

          {!hasEditableItems ? (
            <AdminCard title="Задания" description="У этого субтеста нет редактируемого текста.">
              <p className={cn(ADMIN_TEXT, 'text-muted')}>
                {activeRu.item_count} заданий представляют собой изображения (статичный визуальный стимул), а не
                текст.
              </p>
            </AdminCard>
          ) : selectedItemIdx === null ? (
            <AdminCard title="Задания" description="Нажмите на строку, чтобы отредактировать задание на обоих языках.">
              <AdminInlineItemTable label="Задания субтеста" columns={columns} rows={activeRu.items} onRowClick={setSelectedItemIdx} />
            </AdminCard>
          ) : (
            <AdminCard
              title={`Задание #${selectedItemIdx + 1}`}
              aside={<BackButton onClick={() => setSelectedItemIdx(null)} />}
            >
              <AsturItemEditor
                itemRu={activeRu.items[selectedItemIdx]}
                itemKk={activeKk.items[selectedItemIdx]}
                onChangeText={(lang, field, value) => setItemLocalizedField(lang, selectedItemIdx, field, value)}
                onChangeList={(lang, field, values) => setItemListField(lang, selectedItemIdx, field, values)}
                onChangeSequence={(values) => setItemSequence(selectedItemIdx, values)}
              />
            </AdminCard>
          )}
        </div>
      </div>

      <AdminSaveBar dirty={dirty} saving={saving} changedLabels={[]} onSave={() => save()} onReset={reset} state={state} />
    </>
  );
}

function UnsavedBadge() {
  return (
    <span className={cn(MONO_LABEL, 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-warning-subtle text-warning')}>
      <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden="true" />
      Есть несохранённые изменения
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-body-sm font-medium text-secondary hover:text-brand transition-colors"
    >
      <ArrowLeft size={14} />
      Назад к списку
    </button>
  );
}

interface AsturItemEditorProps {
  itemRu: AsturBankItem;
  itemKk: AsturBankItem;
  onChangeText: (lang: 'ru' | 'kk', field: 'text' | 'instruction' | 'third', value: string) => void;
  onChangeList: (lang: 'ru' | 'kk', field: 'options' | 'pair' | 'words' | 'concepts', values: string[]) => void;
  onChangeSequence: (values: number[]) => void;
}

/** Renders exactly the fields this item's subtest type carries — `text`,
 *  `instruction`, `third`, `options`, `pair`, `words`, `concepts` are
 *  bilingual (RU/KK side by side); `sequence` is locale-independent
 *  numbers; `answer_format` is a structural tag shown read-only, never
 *  editable free text. */
function AsturItemEditor({ itemRu, itemKk, onChangeText, onChangeList, onChangeSequence }: AsturItemEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      {itemRu.answer_format && (
        <p className={cn(ADMIN_META, 'm-0')}>формат ответа: {itemRu.answer_format}</p>
      )}

      {itemRu.text && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label="Текст (RU)">
            {({ id }) => (
              <textarea
                id={id}
                className={cn(ADMIN_INPUT, 'min-h-[100px] resize-y')}
                value={itemRu.text!.ru}
                onChange={(e) => onChangeText('ru', 'text', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Текст (KK)">
            {({ id }) => (
              <textarea
                id={id}
                className={cn(ADMIN_INPUT, 'min-h-[100px] resize-y')}
                value={itemKk.text!.kk}
                onChange={(e) => onChangeText('kk', 'text', e.target.value)}
              />
            )}
          </AdminField>
        </div>
      )}

      {itemRu.instruction && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label="Команда (RU)">
            {({ id }) => (
              <textarea
                id={id}
                className={cn(ADMIN_INPUT, 'min-h-[100px] resize-y')}
                value={itemRu.instruction!.ru}
                onChange={(e) => onChangeText('ru', 'instruction', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Команда (KK)">
            {({ id }) => (
              <textarea
                id={id}
                className={cn(ADMIN_INPUT, 'min-h-[100px] resize-y')}
                value={itemKk.instruction!.kk}
                onChange={(e) => onChangeText('kk', 'instruction', e.target.value)}
              />
            )}
          </AdminField>
        </div>
      )}

      {itemRu.pair && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <PairFields label="Пара (RU)" pair={itemRu.pair.ru} onChange={(values) => onChangeList('ru', 'pair', values)} />
          <PairFields label="Пара (KK)" pair={itemKk.pair!.kk} onChange={(values) => onChangeList('kk', 'pair', values)} />
        </div>
      )}

      {itemRu.third && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AdminField label="Третье слово (RU)">
            {({ id }) => (
              <input
                id={id}
                className={ADMIN_INPUT}
                value={itemRu.third!.ru}
                onChange={(e) => onChangeText('ru', 'third', e.target.value)}
              />
            )}
          </AdminField>
          <AdminField label="Третье слово (KK)">
            {({ id }) => (
              <input
                id={id}
                className={ADMIN_INPUT}
                value={itemKk.third!.kk}
                onChange={(e) => onChangeText('kk', 'third', e.target.value)}
              />
            )}
          </AdminField>
        </div>
      )}

      {itemRu.options && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <StringListEditor
            label="Варианты ответа (RU)"
            values={itemRu.options.ru}
            onChange={(values) => onChangeList('ru', 'options', values)}
            allowAdd={false}
          />
          <StringListEditor
            label="Варианты ответа (KK)"
            values={itemKk.options!.kk}
            onChange={(values) => onChangeList('kk', 'options', values)}
            allowAdd={false}
          />
        </div>
      )}

      {itemRu.words && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <StringListEditor
            label="Слова (RU)"
            values={itemRu.words.ru}
            onChange={(values) => onChangeList('ru', 'words', values)}
            allowAdd={false}
          />
          <StringListEditor
            label="Слова (KK)"
            values={itemKk.words!.kk}
            onChange={(values) => onChangeList('kk', 'words', values)}
            allowAdd={false}
          />
        </div>
      )}

      {itemRu.concepts && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <StringListEditor
            label="Понятия — от общего к частному (RU)"
            ordered
            values={itemRu.concepts.ru}
            onChange={(values) => onChangeList('ru', 'concepts', values)}
          />
          <StringListEditor
            label="Понятия — от общего к частному (KK)"
            ordered
            values={itemKk.concepts!.kk}
            onChange={(values) => onChangeList('kk', 'concepts', values)}
          />
        </div>
      )}

      {itemRu.sequence && <SequenceField values={itemRu.sequence} onChange={onChangeSequence} />}
    </div>
  );
}

/** `pair` is always exactly 2 slots, not an open-ended list — two fixed
 *  inputs read better here than StringListEditor's add/remove affordance. */
function PairFields({ label, pair, onChange }: { label: string; pair: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <p className={cn(MONO_LABEL, 'text-muted')}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={ADMIN_INPUT}
          value={pair[0] ?? ''}
          onChange={(e) => onChange([e.target.value, pair[1] ?? ''])}
          placeholder="1-е слово"
        />
        <input
          className={ADMIN_INPUT}
          value={pair[1] ?? ''}
          onChange={(e) => onChange([pair[0] ?? '', e.target.value])}
          placeholder="2-е слово"
        />
      </div>
    </div>
  );
}

/** Numeric series — locale-independent, comma-separated for quick editing
 *  rather than one StringListEditor row per number. */
function SequenceField({ values, onChange }: { values: number[]; onChange: (values: number[]) => void }) {
  return (
    <AdminField label="Числовой ряд" hint="Через запятую, например: 2, 4, 6, 8">
      {({ id }) => (
        <input
          id={id}
          className={ADMIN_INPUT}
          value={values.join(', ')}
          onChange={(e) => {
            const parsed = e.target.value
              .split(',')
              .map((part) => Number(part.trim()))
              .filter((n) => !Number.isNaN(n));
            onChange(parsed);
          }}
        />
      )}
    </AdminField>
  );
}
