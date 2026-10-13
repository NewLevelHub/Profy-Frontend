import { AppLayout } from './AppLayout';
import '../redesign/admin.css';

/**
 * The admin shell as a lazy route: admin.css (scoped to .rd-admin) loads
 * with it, before the first render, instead of shipping to every student
 * and guest inside the entry stylesheet.
 */
export default function AdminArea() {
  return <AppLayout area="admin" />;
}
