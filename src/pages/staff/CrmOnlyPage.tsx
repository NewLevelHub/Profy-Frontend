import { useTranslation } from 'react-i18next';
import { env } from '@/shared/config/env';
import { Button, buttonClasses } from '@/shared/ui/Button';
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
      <div className="flex flex-wrap gap-3">
        {env.CRM_URL && (
          <a href={env.CRM_URL} className={buttonClasses({ variant: 'primary', size: 'md' })}>
            {t('crmOnly.open')}
          </a>
        )}
        <Button variant="ghost" size="md" muteSound onClick={onLogout}>
          {t('logout')}
        </Button>
      </div>
    </PageContainer>
  );
}
