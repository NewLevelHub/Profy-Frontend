import { useTranslation } from 'react-i18next';
import type { CertificateItem, GpaScale } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';
import { RuledGrid, RuledStat } from '../components/RuledGrid';
import { CERTIFICATE_LABELS, GPA_SCALE_LABELS } from '../certificates/utils/certificateConfig';

export interface CertificatesSectionProps {
  certificates: CertificateItem[];
  gpaValue: number | null;
  gpaScale: GpaScale | null;
  onEdit: () => void;
}

// Mirrors ArtifactsSection's ledger row shape; the stat cells themselves
// match the reference's certificate/GPA row (fixed 5 columns, "—" for
// anything not entered yet, rather than hiding missing scores).
export function CertificatesSection({ certificates, gpaValue, gpaScale, onEdit }: CertificatesSectionProps) {
  const { t } = useTranslation('profile');
  const hasGpa = gpaValue != null && gpaScale != null;
  const hasAny = certificates.length > 0 || hasGpa;
  const scoreByType = new Map(certificates.map((c) => [c.type, c.score]));

  return (
    <LedgerSection
      id="certificates"
      number="04"
      title={t('certificates.title')}
      editLabel={hasAny ? t('common.edit') : t('common.add')}
      editAriaLabel={hasAny ? t('certificates.editAria') : t('certificates.addAria')}
      onEdit={onEdit}
    >
      <RuledGrid className="flex flex-wrap">
        <RuledStat label={t(CERTIFICATE_LABELS.ielts)} value={scoreByType.get('ielts') ?? null} />
        <RuledStat label={t(CERTIFICATE_LABELS.unt)} value={scoreByType.get('unt') ?? null} />
        <RuledStat label="GPA" value={hasGpa ? `${gpaValue}/${GPA_SCALE_LABELS[gpaScale]}` : null} />
        <RuledStat label={t(CERTIFICATE_LABELS.sat)} value={scoreByType.get('sat') ?? null} />
        <RuledStat label={t(CERTIFICATE_LABELS.toefl)} value={scoreByType.get('toefl') ?? null} />
      </RuledGrid>
    </LedgerSection>
  );
}
