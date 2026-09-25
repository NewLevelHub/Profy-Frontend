import { cn } from '@/shared/lib/cn';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { StringListEditor } from '@/shared/ui/admin/StringListEditor';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA, MONO_LABEL } from '@/shared/ui/admin/density';
import type {
  AsturBankItem,
  AsturBankLocalizedList,
  AsturBankLocalizedText,
  AsturBankSubtest,
  AsturItemDifficulty,
  AsturItemReviewStatus,
} from '@/shared/types';
import { AsturKeyEditor } from './AsturKeyEditor';

type Lang = 'ru' | 'kk';
type TextField = 'text' | 'instruction' | 'third';
type ListField = 'options' | 'pair' | 'words' | 'concepts';

const TEXT_LABELS: Record<TextField, string> = { text: 'Текст', instruction: 'Команда', third: 'Третье слово' };
const SUBJECT_TAGGED = new Set(['awareness', 'generalization']);

interface AsturItemEditorProps {
  subtest: AsturBankSubtest;
  item: AsturBankItem;
  subjects: Record<string, AsturBankLocalizedText>;
  readOnly: boolean;
  onChange: (item: AsturBankItem) => void;
}

/** Keeps a single-choice key pointing at the same option when that
 *  option's own wording is edited — the key is stored as option text. */
function withSyncedKey(item: AsturBankItem, lang: Lang, values: string[]): AsturBankItem {
  const previous = item.options?.[lang] ?? [];
  const answer = item.answer as AsturBankLocalizedText | undefined;
  const next: AsturBankItem = { ...item, options: { ...(item.options as AsturBankLocalizedList), [lang]: values } };
  if (answer && typeof answer[lang] === 'string') {
    const keyIndex = previous.indexOf(answer[lang]);
    if (keyIndex !== -1 && values[keyIndex] !== undefined) next.answer = { ...answer, [lang]: values[keyIndex] };
  }
  return next;
}

/** One item — content, key and reviewer metadata together, so a question
 *  can never be published without the key that matches it. */
export function AsturItemEditor({ subtest, item, subjects, readOnly, onChange }: AsturItemEditorProps) {
  const setText = (field: TextField, lang: Lang, value: string) =>
    onChange({ ...item, [field]: { ...(item[field] as AsturBankLocalizedText), [lang]: value } });
  const setList = (field: ListField, lang: Lang, values: string[]) =>
    onChange(
      field === 'options'
        ? withSyncedKey(item, lang, values)
        : { ...item, [field]: { ...(item[field] as AsturBankLocalizedList), [lang]: values } },
    );

  return (
    <fieldset disabled={readOnly} className="flex flex-col gap-4 m-0 p-0 border-0 min-w-0">
      <p className={cn(MONO_LABEL, 'text-muted m-0')}>
        {item.item_id} · навык: {item.skill}
        {item.answer_format ? ` · формат ответа: ${item.answer_format}` : ''}
      </p>

      {(['text', 'instruction', 'third'] as const).map(
        (field) =>
          item[field] && (
            <div key={field} className="grid gap-3.5 sm:grid-cols-2">
              {(['ru', 'kk'] as const).map((lang) => (
                <AdminField key={lang} label={`${TEXT_LABELS[field]} (${lang.toUpperCase()})`}>
                  {({ id }) => (
                    <textarea
                      id={id}
                      className={cn(ADMIN_INPUT, 'min-h-[80px] resize-y')}
                      value={(item[field] as AsturBankLocalizedText)[lang]}
                      onChange={(e) => setText(field, lang, e.target.value)}
                    />
                  )}
                </AdminField>
              ))}
            </div>
          ),
      )}

      {item.pair && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {(['ru', 'kk'] as const).map((lang) => (
            <PairFields key={lang} label={`Пара (${lang.toUpperCase()})`} pair={item.pair![lang]} onChange={(v) => setList('pair', lang, v)} />
          ))}
        </div>
      )}

      {(['options', 'words'] as const).map(
        (field) =>
          item[field] &&
          subtest.key !== 'geometric_figures' && (
            <div key={field} className="grid gap-3.5 sm:grid-cols-2">
              {(['ru', 'kk'] as const).map((lang) => (
                <StringListEditor
                  key={lang}
                  label={`${field === 'options' ? 'Варианты ответа' : 'Слова'} (${lang.toUpperCase()})`}
                  values={(item[field] as AsturBankLocalizedList)[lang]}
                  onChange={(v) => setList(field, lang, v)}
                  allowAdd={false}
                />
              ))}
            </div>
          ),
      )}

      {item.concepts && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {(['ru', 'kk'] as const).map((lang) => (
            <StringListEditor
              key={lang}
              label={`Понятия — от общего к частному (${lang.toUpperCase()})`}
              ordered
              values={item.concepts![lang]}
              onChange={(v) => setList('concepts', lang, v)}
            />
          ))}
        </div>
      )}

      {item.sequence && <SequenceField values={item.sequence} onChange={(sequence) => onChange({ ...item, sequence })} />}

      <AsturKeyEditor method={subtest.scoring_method} item={item} onChange={onChange} />

      <div className="grid gap-3.5 sm:grid-cols-3">
        {SUBJECT_TAGGED.has(subtest.key) && (
          <AdminField label="Предметная область">
            {({ id }) => (
              <select id={id} className={ADMIN_INPUT} value={item.subject ?? ''} onChange={(e) => onChange({ ...item, subject: e.target.value })}>
                {Object.entries(subjects).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name.ru}
                  </option>
                ))}
              </select>
            )}
          </AdminField>
        )}
        <AdminField label="Сложность">
          {({ id }) => (
            <select
              id={id}
              className={ADMIN_INPUT}
              value={item.difficulty ?? ''}
              onChange={(e) => onChange({ ...item, difficulty: (e.target.value || null) as AsturItemDifficulty | null })}
            >
              <option value="">не указана</option>
              <option value="easy">простой</option>
              <option value="medium">средний</option>
              <option value="hard">сложный</option>
            </select>
          )}
        </AdminField>
        <AdminField label="Внутренняя проверка">
          {({ id }) => (
            <select
              id={id}
              className={ADMIN_INPUT}
              value={item.review_status ?? 'unreviewed'}
              onChange={(e) => onChange({ ...item, review_status: e.target.value as AsturItemReviewStatus })}
            >
              <option value="unreviewed">не проверено</option>
              <option value="reviewed">проверено вторым участником</option>
            </select>
          )}
        </AdminField>
      </div>

      <AdminField label="Объяснение ключа (для команды, не показывается ученику)">
        {({ id }) => (
          <textarea
            id={id}
            className={ADMIN_TEXTAREA}
            value={item.key_explanation?.ru ?? ''}
            onChange={(e) => onChange({ ...item, key_explanation: { ...item.key_explanation, ru: e.target.value } })}
          />
        )}
      </AdminField>

      {subtest.key === 'geometric_figures' && (
        <p className={cn(ADMIN_META, 'm-0')}>Стимул — изображение №{item.item_id.split('-').pop()} во фронтенде; текста у задания нет.</p>
      )}
    </fieldset>
  );
}

function PairFields({ label, pair, onChange }: { label: string; pair: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <p className={cn(MONO_LABEL, 'text-muted')}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input className={ADMIN_INPUT} value={pair[0] ?? ''} onChange={(e) => onChange([e.target.value, pair[1] ?? ''])} placeholder="1-е слово" />
        <input className={ADMIN_INPUT} value={pair[1] ?? ''} onChange={(e) => onChange([pair[0] ?? '', e.target.value])} placeholder="2-е слово" />
      </div>
    </div>
  );
}

function SequenceField({ values, onChange }: { values: number[]; onChange: (values: number[]) => void }) {
  return (
    <AdminField label="Числовой ряд" hint="Через запятую, например: 2, 4, 6, 8">
      {({ id }) => (
        <input
          id={id}
          className={ADMIN_INPUT}
          value={values.join(', ')}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(',')
                .map((part) => Number(part.trim()))
                .filter((n) => !Number.isNaN(n)),
            )
          }
        />
      )}
    </AdminField>
  );
}
