import { useEffect } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

interface BelbinDoneProps {
  onContinue: () => void;
}

export function BelbinDone({ onContinue }: BelbinDoneProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center gap-5 text-center py-16">
      <CheckCircle2 size={48} className="text-success" />
      <Heading level="display-sm">Тест «Роли в команде» пройден</Heading>
      <Text variant="body-md" className="text-secondary max-w-md">
        Отлично! Ответы сохранены. Переходим к следующему этапу — тесту характеристик интеллекта (АСТУР).
      </Text>
      <Button size="lg" onClick={onContinue} className="gap-2 mt-2">
        Перейти к тесту АСТУР
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}
