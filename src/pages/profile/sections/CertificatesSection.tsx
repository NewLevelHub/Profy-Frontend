import { Pencil } from 'lucide-react';
import type { CertificateItem, GpaScale } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { ChipList } from '../components/ChipList';
import { CERTIFICATE_LABELS, GPA_SCALE_LABELS } from '../certificates/utils/certificateConfig';

export interface CertificatesSectionProps {
  certificates: CertificateItem[];
  gpaValue: number | null;
  gpaScale: GpaScale | null;
  onEdit: () => void;
}

// Mirrors ArtifactsSection's layout (same header/edit-button shape, same
// Card + ChipList building blocks) so this reads as a sibling section, not
// a visually different one-off.
export function CertificatesSection({ certificates, gpaValue, gpaScale, onEdit }: CertificatesSectionProps) {
  const hasGpa = gpaValue != null && gpaScale != null;
  const hasAny = certificates.length > 0 || hasGpa;
  const scoreLabels = certificates.map(c => `${CERTIFICATE_LABELS[c.type]} ${c.score}`);

  return (
    <Card className="bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-tiny font-bold uppercase tracking-label text-muted">Сертификаты и GPA</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-[6px] text-brand font-extrabold hover:opacity-75 transition-opacity text-sm"
          aria-label={hasAny ? 'Редактировать сертификаты и GPA' : 'Добавить сертификаты и GPA'}
        >
          <Pencil size={13} />
          {hasAny ? 'Изменить' : 'Добавить'}
        </button>
      </div>

      {hasAny ? (
        <>
          <ChipList label="Баллы" items={scoreLabels} />
          {hasGpa && (
            <div className="mb-4 last:mb-0">
              <p className="font-extrabold text-primary text-sm mb-2.5">GPA</p>
              <p className="text-secondary text-sm">{gpaValue} из {GPA_SCALE_LABELS[gpaScale]}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-secondary text-sm">Пока пусто — можно добавить баллы IELTS, ЕНТ, SAT, TOEFL или GPA</p>
      )}
    </Card>
  );
}
