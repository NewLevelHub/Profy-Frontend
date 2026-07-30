import { Map } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Mascot } from '@/shared/ui/Mascot';

interface FeedbackSentCardProps {
  onEdit: () => void;
  onPlan: () => void;
}

export function FeedbackSentCard({ onEdit, onPlan }: FeedbackSentCardProps) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center py-10 px-6 sm:py-10 sm:px-10">
      <div
        className="w-[124px] h-[154px] sm:w-[150px] sm:h-[186px] rounded-[22px] bg-brand-subtle flex items-end justify-center overflow-hidden"
        aria-hidden="true"
      >
        <Mascot kind="media" className="w-[108px] h-[134px] sm:w-[130px] sm:h-[162px]" />
      </div>
      <Badge variant="success">Отзыв отправлен</Badge>
      <h2 className="font-black text-primary tracking-[-0.02em] text-[26px] sm:text-[30px] text-pretty">
        Спасибо! Это правда помогает
      </h2>
      <p className="text-secondary font-semibold text-[15px] sm:text-base max-w-[520px] text-pretty">
        Мы читаем каждый отзыв и подкручиваем вопросы и подбор направлений. Свой отзыв всегда можно изменить.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <Button size="lg" className="gap-2" onClick={onPlan}>
          <Map className="w-5 h-5" />
          Перейти к плану развития
        </Button>
        <Button size="lg" variant="ghost" onClick={onEdit}>
          Изменить отзыв
        </Button>
      </div>
    </Card>
  );
}
