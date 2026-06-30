import { Outlet } from 'react-router';
import { Header } from '@/shared/ui/navigation/Header';
import { Sidebar } from '@/shared/ui/navigation/Sidebar';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';
import { Spinner } from '@/shared/ui';
import { useAssessmentSync } from '@/shared/hooks/useAssessmentSync';
import { useAssessmentStore } from '@/shared/store/assessment';

export function AppLayout() {
  useAssessmentSync();
  const syncDone = useAssessmentStore(s => s.syncDone);

  return (
    <div className="h-screen bg-page text-primary flex overflow-hidden">
      <ScrollToTop />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {syncDone ? <Outlet /> : (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <Spinner size="lg" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
