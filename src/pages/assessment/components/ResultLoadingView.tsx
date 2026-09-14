import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mascot } from '@/shared/ui/Mascot';

const MESSAGE_KEYS = [
  'resultLoading.msg1',
  'resultLoading.msg2',
  'resultLoading.msg3',
  'resultLoading.msg4',
];

interface ResultLoadingViewProps {
  /** Outer wrapper layout — full viewport on the dedicated route, a shorter
   *  centered band when shown inside the results page (language switch). */
  className?: string;
}

/**
 * The mascot + rotating-message + progress-spine screen shown while the
 * result report is being produced. Used both by the post-assessment
 * `/assessment/loading` route and, on a language switch, by ResultsPage while
 * the backend translates the existing report.
 */
export function ResultLoadingView({ className }: ResultLoadingViewProps) {
  const { t } = useTranslation('assessment');
  const [messageIndex, setMessageIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      const timer = setTimeout(() => {
        setMessageIndex(i => (i + 1) % MESSAGE_KEYS.length);
        setMsgVisible(true);
      }, 250);
      return () => clearTimeout(timer);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn('flex flex-col items-center justify-center bg-page px-6', className)}>
      <div className="w-full max-w-lg mx-auto text-center flex flex-col gap-6">
        <Mascot state="waiting" size={140} className="mx-auto" />
        <div
          className="transition-opacity duration-[250ms]"
          style={{ opacity: msgVisible ? 1 : 0 }}
        >
          <p className="text-subtitle font-semibold text-primary" style={{ minHeight: '2rem' }}>
            {t(MESSAGE_KEYS[messageIndex])}
          </p>
        </div>
        <Spine
          nodes={MESSAGE_KEYS.map((_, i): SpineNode => ({
            id: i,
            status: i < messageIndex ? 'done' : i === messageIndex ? 'current' : 'upcoming',
            goal: i === MESSAGE_KEYS.length - 1,
          }))}
          thickness={0.85}
          ariaLabel={t('resultLoading.stepAria', {
            current: messageIndex + 1,
            total: MESSAGE_KEYS.length,
          })}
        />
        <p className="text-body text-secondary">{t('resultLoading.takesSeconds')}</p>
      </div>
    </div>
  );
}
