import { RotateCcw } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Mascot } from '@/shared/ui/Mascot';
import { Skeleton } from '@/shared/ui/Skeleton';

export interface CompletedTestCardProps {
  completedAt: string | null;
  directionName: string | null;
  questionsAnswered: number | null;
  matchPercent: number | null;
  isLoading: boolean;
  confirmRestart: boolean;
  onViewResults: () => void;
  onRestartRequest: () => void;
  onRestartConfirm: () => void;
  onRestartCancel: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function CompletedTestCard({
  completedAt, directionName, questionsAnswered, matchPercent, isLoading,
  confirmRestart, onViewResults, onRestartRequest, onRestartConfirm, onRestartCancel,
}: CompletedTestCardProps) {
  return (
    <>
      <div className="bg-surface border-2 border-strong rounded-[26px] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center">
        <div
          className="w-[130px] h-[160px] sm:w-[150px] sm:h-[186px] flex-none rounded-[20px] bg-brand-subtle flex items-end justify-center overflow-hidden"
          aria-hidden="true"
        >
          <Mascot kind="psy" className="w-[112px] h-[140px] sm:w-[134px] sm:h-[176px]" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start gap-2.5 text-center sm:text-left">
          {completedAt && <Badge variant="success">{`Тест пройден ${formatDate(completedAt)}`}</Badge>}
          <h1 className="font-black text-primary text-2xl sm:text-[30px] leading-tight text-pretty">
            Ты уже прошёл тестирование
          </h1>
          <p className="text-secondary font-semibold text-[15px] sm:text-base text-pretty">
            Можно вернуться к прошлому результату или пройти всё заново — тогда старые ответы, план развития и подборка вузов обновятся.
          </p>

          {confirmRestart ? (
            <div className="w-full mt-2 p-4 rounded-2xl bg-warning-subtle flex flex-col gap-3">
              <div>
                <p className="text-label font-extrabold text-primary mb-1">Пройти тест заново?</p>
                <p className="text-caption text-secondary">
                  Прошлый результат, план развития и подборка вузов будут заменены новыми.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" className="flex-1" onClick={onRestartCancel}>
                  Отмена
                </Button>
                <Button size="sm" className="flex-1 bg-danger! hover:bg-danger/80!" onClick={onRestartConfirm}>
                  Да, начать заново
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap justify-center sm:justify-start mt-2">
              <Button onClick={onViewResults}>Посмотреть результаты</Button>
              <Button variant="ghost" onClick={onRestartRequest}>
                <RotateCcw size={16} />
                Пройти заново
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-caption font-bold text-secondary mb-1">Вопросов пройдено</p>
          {isLoading ? <Skeleton className="h-7 w-10" /> : (
            <p className="text-title font-black text-primary">{questionsAnswered ?? '—'}</p>
          )}
        </Card>
        <Card>
          <p className="text-caption font-bold text-secondary mb-1">Топ-направление</p>
          {isLoading ? <Skeleton className="h-7 w-32" /> : (
            <p className="font-black text-brand text-lg leading-tight">{directionName ?? '—'}</p>
          )}
        </Card>
        <Card>
          <p className="text-caption font-bold text-secondary mb-1">Совпадение</p>
          {isLoading ? <Skeleton className="h-7 w-14" /> : (
            <p className="text-title font-black text-success">{matchPercent != null ? `${matchPercent}%` : '—'}</p>
          )}
        </Card>
      </div>
    </>
  );
}
