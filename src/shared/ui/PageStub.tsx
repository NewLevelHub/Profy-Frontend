import { Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  description?: string;
}

export function PageStub({ title, description }: Props) {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="rounded-full bg-raised p-4">
        <Construction size={32} className="text-muted" />
      </div>
      <h1 className="text-xl font-semibold text-primary">{title}</h1>
      {description && <p className="text-secondary text-sm max-w-sm">{description}</p>}
      <p className="text-subtle text-xs">{t('pageInDevelopment')}</p>
    </div>
  );
}
