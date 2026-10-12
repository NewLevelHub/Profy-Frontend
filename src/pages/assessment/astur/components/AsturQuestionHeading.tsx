import type { ReactNode } from 'react';

export function AsturQuestionHeading({ index, id, children }: { index: number; id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="rd-astur-question-heading">
      <span className="rd-assessment-question-number" aria-hidden="true">{String(index).padStart(2, '0')}</span>
      <span>{children}</span>
    </h2>
  );
}
