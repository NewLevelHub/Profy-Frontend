import type { ReactNode } from 'react';

export function AuthHeading({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <>
      {icon && <span className="rd-icon-tile rd-lilac rd-auth-form-icon" aria-hidden="true">{icon}</span>}
      <h1>{title}<span className="rd-orange" aria-hidden="true">.</span></h1>
      {children && <p className="rd-login-intro">{children}</p>}
    </>
  );
}
