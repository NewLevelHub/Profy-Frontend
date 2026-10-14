import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { JourneyShell } from './JourneyShell';
import { MASCOT, type MascotArt } from './mascotArt';
import './checkpoints.css';

interface JourneyCheckpointProps {
  kicker?: string;
  title: string;
  body?: string;
  illustration?: MascotArt;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Shared composition for the short pauses between full assessment screens. */
export function JourneyCheckpoint({ kicker, title, body, illustration = 'notepad', children, actions, className }: JourneyCheckpointProps) {
  return <JourneyShell>
    <main id="journey-content" tabIndex={-1} className={cn('rd-checkpoint', className)}>
      <header className="rd-checkpoint-heading">
        <div>
          {kicker && <p className="rd-eyebrow">{kicker}</p>}
          <h1>{title}</h1>
          {body && <p className="rd-checkpoint-intro">{body}</p>}
        </div>
        <img src={MASCOT[illustration]} alt="" width={220} height={220} />
      </header>
      {children}
      {actions && <footer className="rd-checkpoint-actions">{actions}</footer>}
    </main>
  </JourneyShell>;
}
