import { Briefcase } from 'lucide-react';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface ResultProfessionExamplesProps {
  professions: string[];
}

// Icon cards, ported from ResultsScreen.dc.html's "Кем можно стать" grid —
// the mockup pairs each title with a hand-picked emoji + one-line blurb,
// neither of which AkinatorResultResponse.professions (a flat title list)
// carries, so every card uses the same neutral icon instead of a per-title
// illustration.
export function ResultProfessionExamples({ professions }: ResultProfessionExamplesProps) {
  if (professions.length === 0) return null;

  return (
    <section aria-label="Профессии">
      <SectionHeading emoji="💼" title="Кем можно стать" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professions.map(profession => (
          <div
            key={profession}
            className="bg-surface border-2 border-strong border-b-4 rounded-2xl p-5 flex flex-col gap-2"
          >
            <Briefcase className="w-7 h-7 text-brand" strokeWidth={2} />
            <span className="font-extrabold text-primary text-[18px] text-pretty">{profession}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
