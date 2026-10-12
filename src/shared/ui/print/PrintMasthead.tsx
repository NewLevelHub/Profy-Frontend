import type { ReactNode } from 'react';

/** Paper always uses the light palette, independently of the application theme. */
export function PrintMasthead({ label, title, meta, children }: {
  label: string; title: string; meta?: ReactNode; children?: ReactNode;
}) {
  return <header className="print-masthead print-block">
    <div className="print-masthead-top"><span className="print-wordmark" aria-label="Profile">profile<span>.</span></span><span className="print-document-label">{label}</span></div>
    <h1>{title}</h1>
    {meta && <div className="print-masthead-meta">{meta}</div>}
    {children}
  </header>;
}
