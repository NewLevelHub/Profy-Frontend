import type { ReactNode } from 'react';

/** `kicker` — только когда он говорит то, чего нет в заголовке («Направление» над именем направления). */
export function StudentPageHeading({ kicker, title, subtitle, children }: { kicker?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return <div className="rd-student-page-heading">
    <div>{kicker && <p className="rd-eyebrow">{kicker}</p>}<h1>{title}<span className="rd-orange">.</span></h1>{subtitle && <p>{subtitle}</p>}</div>
    {children}
  </div>;
}
