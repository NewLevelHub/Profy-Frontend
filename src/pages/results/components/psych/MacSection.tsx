import type { MacFeedItem, PsychMacSection } from '@/shared/types';
import { PsychSectionShell } from './PsychSectionShell';

interface MacSectionProps {
  section?: PsychMacSection | null;
}

/**
 * МАК — метафорические ассоциативные карты. Лента "стимул → карта →
 * дословный текст", без скоринга и ИИ-интерпретации (PRO-282 §4). `null`
 * секция → рендерит ничего (блок не пройден). Section-object prop only, так
 * что PRO-320 переиспользует это на admin-экране.
 *
 * v1 (сегодняшняя демка): только лента. Сравнительный вид E4 и рабочее поле
 * специалиста (заметки/тег-гипотезы/резюме, PRO-318) не реализованы —
 * E4/workspace нет ни на бэкенде, ни здесь.
 */
export function MacSection({ section }: MacSectionProps) {
  if (!section) return null;

  return (
    <PsychSectionShell title="Метафорические карты">
      <div className="flex flex-col gap-4">
        {section.feed.length === 0 ? (
          <p className="text-body text-secondary leading-relaxed">
            Блок начат, но ни одно упражнение ещё не завершено.
          </p>
        ) : (
          section.feed.map((item, i) => <MacFeedRow key={i} item={item} />)
        )}
      </div>
    </PsychSectionShell>
  );
}

function MacFeedRow({ item }: { item: MacFeedItem }) {
  return (
    <div className="flex flex-col gap-3 border-t border-default pt-3 first:border-t-0 first:pt-0 sm:flex-row">
      <div className="flex shrink-0 gap-2 sm:flex-col">
        {item.card_image_urls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className="h-[120px] w-[86px] rounded-lg border border-default object-cover"
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <p className="text-caption text-secondary italic">«{item.stimulus_question}»</p>
        <dl className="flex flex-col gap-1.5">
          {item.followup_questions.map((q, i) => (
            <div key={i}>
              <dt className="text-caption text-muted">{q}</dt>
              <dd className="text-body text-primary leading-snug">
                {item.followup_answers[i] ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
