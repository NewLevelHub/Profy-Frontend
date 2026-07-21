import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface ResultProfessionExamplesProps {
  professions: string[];
}

// Plain rows on purpose, not pills like ResultBackups — those are
// alternatives to pick between, these are just what the one chosen
// specialty actually leads to, so they read as a quiet fact, not a choice.
export function ResultProfessionExamples({ professions }: ResultProfessionExamplesProps) {
  if (professions.length === 0) return null;

  return (
    <section aria-label="Чем можно заниматься">
      <SectionHeading emoji="💼" title="Чем можно заниматься" />
      <Card className="flex flex-col gap-2.5">
        {professions.map(profession => (
          <p key={profession} className="text-primary font-semibold" style={{ fontSize: 15 }}>
            <span className="text-secondary mr-2" aria-hidden="true">—</span>
            {profession}
          </p>
        ))}
      </Card>
    </section>
  );
}
