import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CabinetSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation('psychologist');
  return <label className="rd-psych-search">
    <Search size={18} aria-hidden="true" />
    <span className="sr-only">{t('queue.searchLabel')}</span>
    <input type="search" placeholder={t('queue.searchPlaceholder')} value={value} onChange={event => onChange(event.target.value)} />
  </label>;
}
