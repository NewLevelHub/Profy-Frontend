import { useTranslation } from 'react-i18next';
import { ArrowLeft, Printer } from 'lucide-react';

interface PrintToolbarProps {
  onBack: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

/**
 * Screen-only controls above the sheet — `data-print-hide` drops the whole
 * bar from the printed output (see styles/print.css). The hint is not
 * decoration: "экспорт в PDF" here IS the browser's print dialog, and
 * without the pointer to «Сохранить как PDF» the destination defaults to a
 * physical printer on plenty of machines.
 */
export function PrintToolbar({ onBack, onPrint, disabled }: PrintToolbarProps) {
  const { t } = useTranslation('results');
  return <div data-print-hide className="print-toolbar">
    <button type="button" className="rd-text-link" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" />{t('print.toolbar.back')}</button>
    <div><p>{t('print.toolbar.hint')}</p><button type="button" className="rd-button" disabled={disabled} onClick={onPrint}>
      <Printer size={17} aria-hidden="true" />{t('page.downloadPdf')}
    </button></div>
  </div>;
}
