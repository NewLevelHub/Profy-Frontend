import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Brand } from './Brand';
import { FullScreenPreferences } from '../FullScreenPreferences';
import './redesign.css';
import './journey.css';

export function JourneyShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return (
    <div className="redesign rd-journey">
      <a className="rd-skip" href="#journey-content">{t('redesign.skip')}</a>
      <header className="rd-journey-header">
        <Brand linked={false} />
        <FullScreenPreferences />
      </header>
      {children}
    </div>
  );
}
