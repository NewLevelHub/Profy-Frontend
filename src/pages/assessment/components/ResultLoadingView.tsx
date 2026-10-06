import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { JourneyShell } from '@/shared/ui/redesign/JourneyShell';
import '@/shared/ui/redesign/checkpoints.css';

const MESSAGE_KEYS = ['resultLoading.msg1', 'resultLoading.msg2', 'resultLoading.msg3', 'resultLoading.msg4'];

/** Embedded reports already have language/theme controls in the app header. */
export function ResultLoadingView({ className, fullPage = false }: { className?: string; fullPage?: boolean }) {
  const { t } = useTranslation('assessment');
  const [messageIndex, setMessageIndex] = useState(0);
  const MessageHeading = fullPage ? 'h1' : 'h2';
  useEffect(() => {
    const timer = window.setInterval(() => setMessageIndex(index => (index + 1) % MESSAGE_KEYS.length), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const content = <div className={cn('rd-report-loading', className)} role="status" aria-live="polite" aria-atomic="true">
    <img src="/mascot/redesign/book.png" alt="" width={200} height={200} />
    <div className="rd-loading-message"><LoaderCircle className="rd-loading-spinner" size={22} aria-hidden="true" /><MessageHeading>{t(MESSAGE_KEYS[messageIndex])}</MessageHeading></div>
    <p>{t('resultLoading.takesSeconds')}</p>
  </div>;
  return fullPage ? <JourneyShell><main id="journey-content" tabIndex={-1}>{content}</main></JourneyShell> : content;
}
