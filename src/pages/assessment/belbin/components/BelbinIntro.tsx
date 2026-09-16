import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

interface BelbinIntroProps {
  instruction: string;
  onStart: () => void;
}

export function BelbinIntro({ instruction, onStart }: BelbinIntroProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-10">
      <Heading level="display-sm">Кто вы в организации</Heading>
      <Text variant="body-md" className="text-secondary max-w-xl whitespace-pre-wrap">
        {instruction}
      </Text>
      <Button size="lg" onClick={onStart}>
        Начать
      </Button>
    </div>
  );
}
