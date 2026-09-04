import type { CertificateItem } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';
import { RuledGrid, RuledStat } from '../components/RuledGrid';
import { CERTIFICATE_LABELS } from '@/shared/config/certificates';

export interface CertificatesSectionProps {
  certificates: CertificateItem[];
  onEdit: () => void;
}

// Mirrors ArtifactsSection's ledger row shape; the stat cells themselves
// match the reference's certificate row (fixed columns, "—" for anything
// not entered yet, rather than hiding missing scores).
export function CertificatesSection({ certificates, onEdit }: CertificatesSectionProps) {
  const hasAny = certificates.length > 0;
  const scoreByType = new Map(certificates.map((c) => [c.type, c.score]));

  return (
    <LedgerSection
      id="certificates"
      number="04"
      title="БАЛЛЫ"
      editLabel={hasAny ? 'Изменить' : 'Добавить'}
      editAriaLabel={hasAny ? 'Редактировать баллы за экзамены' : 'Добавить баллы за экзамены'}
      onEdit={onEdit}
    >
      <RuledGrid className="flex flex-wrap">
        <RuledStat label={CERTIFICATE_LABELS.ielts} value={scoreByType.get('ielts') ?? null} />
        <RuledStat label={CERTIFICATE_LABELS.unt} value={scoreByType.get('unt') ?? null} />
        <RuledStat label={CERTIFICATE_LABELS.sat} value={scoreByType.get('sat') ?? null} />
        <RuledStat label={CERTIFICATE_LABELS.toefl} value={scoreByType.get('toefl') ?? null} />
      </RuledGrid>
    </LedgerSection>
  );
}
