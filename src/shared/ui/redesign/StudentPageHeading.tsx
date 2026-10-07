import type { ReactNode } from 'react';

export function StudentPageHeading({ kicker, title, subtitle, children }: { kicker: string; title: string; subtitle?: string; children?: ReactNode }) {
  return <div className="rd-student-page-heading">
    <div><p className="rd-eyebrow"><span className="rd-green-dot" />{kicker}</p><h1>{title}<span className="rd-orange">.</span></h1>{subtitle && <p>{subtitle}</p>}</div>
    {children}
  </div>;
}
