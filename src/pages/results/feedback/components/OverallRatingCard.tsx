import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';

interface OverallRatingCardProps {
  faces: string[];
  value: number;
  label: string;
  onChange: (value: number) => void;
}

export function OverallRatingCard({ faces, value, label, onChange }: OverallRatingCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-extrabold text-primary text-[20px] m-0">Общая оценка</h2>
      <p className="text-secondary font-semibold text-[15px] m-0">Насколько ты доволен подбором в целом</p>
      <div className="flex gap-2.5 flex-wrap mt-1">
        {faces.map((face, i) => {
          const n = i + 1;
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={active}
              className={cn(
                'w-14 h-14 rounded-2xl text-[28px] border-2 transition-colors',
                active ? 'border-brand bg-brand-subtle' : 'border-default bg-surface grayscale opacity-60 hover:opacity-100 hover:grayscale-0',
              )}
            >
              {face}
            </button>
          );
        })}
      </div>
      <p className="font-extrabold text-brand text-[15px] m-0">{label}</p>
    </Card>
  );
}
