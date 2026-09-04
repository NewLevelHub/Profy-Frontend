import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/typography/Text';

interface PrintToolbarProps {
  onBack: () => void;
  onPrint: () => void;
}

/**
 * Screen-only controls above the sheet — `data-print-hide` drops the whole
 * bar from the printed output (see styles/print.css). The hint is not
 * decoration: "экспорт в PDF" here IS the browser's print dialog, and
 * without the pointer to «Сохранить как PDF» the destination defaults to a
 * physical printer on plenty of machines.
 */
export function PrintToolbar({ onBack, onPrint }: PrintToolbarProps) {
  return (
    <div data-print-hide className="flex items-center justify-between gap-3 flex-wrap mb-5">
      <Button variant="text" size="sm" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        К результатам
      </Button>
      <div className="flex items-center gap-3">
        <Text variant="caption" className="text-secondary hidden sm:block">
          В окне печати выбери «Сохранить как PDF»
        </Text>
        <Button size="sm" onClick={onPrint}>
          <Printer size={16} aria-hidden="true" />
          Скачать PDF
        </Button>
      </div>
    </div>
  );
}
