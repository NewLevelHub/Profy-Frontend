import { AdminNavigation } from '@/shared/ui/redesign/AdminNavigation';
import { useRailSession } from '@/shared/ui/navigation/useRailSession';
import { AppLayout } from './AppLayout';
import '../redesign/admin.css';

function AdminRail() {
  const { user, activePath, onLogout } = useRailSession();
  return <AdminNavigation activePath={activePath} email={user?.email} onLogout={onLogout} />;
}

/**
 * The admin shell as a lazy route: its navigation and admin.css (scoped to
 * .rd-admin) load with it, before the first render, instead of shipping to
 * every student and guest inside the entry chunk.
 */
export default function AdminArea() {
  return <AppLayout area="admin" rail={<AdminRail />} />;
}
