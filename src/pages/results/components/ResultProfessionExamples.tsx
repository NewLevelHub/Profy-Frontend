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
    <section aria-label="Профессии">
      <SectionHeading emoji="💼" title="Кем можно стать" />
      <Card className="flex flex-wrap gap-2.5">
        {professions.map(profession => (
          <span
            key={profession}
            className="font-bold text-secondary bg-raised rounded-pill px-3.5 py-2"
            style={{ fontSize: 13.5 }}
          >
            {profession}
          </span>
        ))}
      </Card>
    </section>
  );
}
