import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useProfileStore } from '@/shared/store/profile';
import { formatDate } from '@/shared/i18n/format';
import { useResults } from '../../hooks/useResults';

/**
 * Logic layer for the printable result. Reuses `useResults` wholesale — the
 * printed document must show exactly the report the student saw on
 * /results, not a second fetch with its own loading/404-then-generate
 * behaviour — and adds the three things print needs on top: the PDF
 * filename, the print trigger, and the way back.
 */
export function useResultPrint() {
  const { t } = useTranslation('results');
  const results = useResults();
  const profile = useProfileStore((s) => s.profile);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { report } = results;
  const autoPrint = searchParams.get('auto') === '1';
  const hasAutoPrinted = useRef(false);

  // Browsers use `document.title` as the default filename in the print →
  // "Save as PDF" dialog, so the title IS the export's filename.
  useEffect(() => {
    const previous = document.title;
    const raw = report?.created_at ? new Date(report.created_at) : new Date();
    const stamp = Number.isNaN(raw.getTime()) ? '' : ` — ${formatDate(raw)}`;
    document.title = t('print.docTitle', {
      name: profile?.name ? ` — ${profile.name}` : '',
    }) + stamp;
    return () => {
      document.title = previous;
    };
  }, [profile?.name, report?.created_at, t]);

  const print = useCallback(() => window.print(), []);

  // Arriving from the "Скачать PDF" button on /results (?auto=1) opens the
  // print dialog by itself, so the export stays one click. Deliberately no
  // cleanup: printing is a one-shot side effect, and cancelling it on
  // StrictMode's simulated unmount would mean the dialog never opens in dev.
  // The ref (which survives that remount) is what keeps it to one dialog.
  useEffect(() => {
    if (!autoPrint || hasAutoPrinted.current || !report) return;
    hasAutoPrinted.current = true;
    // Printing before the webfonts resolve lays the document out in the
    // fallback face and bakes that into the PDF.
    void Promise.resolve(document.fonts?.ready).then(() =>
      window.requestAnimationFrame(print),
    );
  }, [autoPrint, report, print]);

  const back = useCallback(() => navigate('/results'), [navigate]);

  return { ...results, profile, print, back };
}
