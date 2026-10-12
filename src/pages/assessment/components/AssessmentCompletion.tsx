import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface AssessmentCompletionProps {
  title: string;
  message: string;
  action: string;
  onContinue: () => void;
}

/** Presentation only; each stage retains its own completion and navigation. */
export function AssessmentCompletion({ title, message, action, onContinue }: AssessmentCompletionProps) {
  return (
    <section className="rd-assessment-completion">
      <div className="rd-assessment-completion-art" aria-hidden="true">
        <img src="/mascot/redesign/celebrate.png" alt="" width={180} height={180} />
        <span><Check size={18} /></span>
      </div>
      <h1>{title}</h1>
      <p>{message}</p>
      <Button size="lg" onClick={onContinue}>
        {action}<ArrowRight size={18} aria-hidden="true" />
      </Button>
    </section>
  );
}
