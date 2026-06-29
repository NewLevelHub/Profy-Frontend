import { Outlet } from 'react-router';
import { Header } from '@/shared/ui/navigation/Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
