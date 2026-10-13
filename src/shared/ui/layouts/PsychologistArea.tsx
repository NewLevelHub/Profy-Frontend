import { AppLayout } from './AppLayout';
import '../redesign/psychologist.css';
import '../redesign/psychologist-report.css';

/**
 * The psychologist cabinet shell as a lazy route: its stylesheets load with
 * it, before the first render, instead of shipping to every student and
 * guest inside the entry stylesheet.
 */
export default function PsychologistArea() {
  return <AppLayout area="psychologist" />;
}
