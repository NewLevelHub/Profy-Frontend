import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface SummaryCardProps {
  summary: string;
  disclaimer: string;
  isFlatProfile: boolean;
}

// summary + disclaimer are rendered together, never deduplicated by
// meaning — disclaimer is a fixed, server-authored guarantee, summary is
// the personalized (LLM or fallback) text (contract §4.2).
export function SummaryCard({ summary, disclaimer, isFlatProfile }: SummaryCardProps) {
  return (
    <section aria-label="Резюме">
      <SectionHeading emoji="📋" title="Резюме" />
      <Card className="bg-brand-subtle flex flex-col gap-3">
        <p className="text-body text-primary leading-relaxed">{summary}</p>
        {isFlatProfile && (
          <p className="text-caption text-secondary">
            Твои результаты по разным направлениям близки друг к другу — это нормально,
            если ты ещё не определился. Такой результат стоит воспринимать как отправную
            точку, а не окончательный вывод.
          </p>
        )}
        <p className="text-caption text-secondary border-t border-default pt-3">{disclaimer}</p>
      </Card>
    </section>
  );
}
