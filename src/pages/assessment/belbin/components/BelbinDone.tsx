import { CheckCircle2 } from 'lucide-react';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

export function BelbinDone() {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-16">
      <CheckCircle2 size={40} className="text-success" />
      <Heading level="display-sm">Готово</Heading>
      <Text variant="body-md" className="text-secondary max-w-md">
        Ответы отправлены. Результат появится в кабинете психолога — эту страницу можно закрыть.
      </Text>
    </div>
  );
}
