import { Outlet } from 'react-router';
import { PageContainer } from '@/shared/ui/PageContainer';

/** Navigation lives in AppLayout's fixed admin shell; pages own their content. */
export function AdminLayout() {
  return <PageContainer className="rd-admin-content"><Outlet /></PageContainer>;
}
