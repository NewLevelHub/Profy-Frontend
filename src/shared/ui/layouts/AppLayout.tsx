import { Outlet } from 'react-router';
import { Header } from '@/shared/ui/navigation/Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
