import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { useRailSession } from '@/shared/ui/navigation/useRailSession';
import { Heading, Text } from '@/shared/ui/typography';

/** Home for sales and marketing roles: they work in Profy-CRM, which this
 *  app does not contain. Without it they would bounce into the student shell. */
export default function CrmOnlyPage() {
  const { t } = useTranslation('common');
  const { user, onLogout } = useRailSession();
  return (
    <PageContainer className="flex flex-col items-start gap-4 py-16 max-w-xl">
      <Heading level="display-sm">{t('crmOnly.title')}</Heading>
      <Text variant="body-md" className="text-muted">
        {t('crmOnly.body', { email: user?.email ?? '' })}
      </Text>
      <Button variant="ghost" size="md" muteSound onClick={onLogout}>
        {t('logout')}
      </Button>
    </PageContainer>
  );
}
