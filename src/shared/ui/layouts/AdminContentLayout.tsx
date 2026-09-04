import { Outlet } from 'react-router';

/**
 * Pass-through for the `/admin/content/*` route branch.
 *
 * It used to render a second tab row for the five content entities. Those are
 * now first-class destinations in `AdminLayout`'s side rail — visible without
 * clicking into a section first — so this layout carries no chrome of its own.
 * The route nesting is kept because the child routes are declared relative to
 * it and the URLs are already in use.
 */
export function AdminContentLayout() {
  return <Outlet />;
}
