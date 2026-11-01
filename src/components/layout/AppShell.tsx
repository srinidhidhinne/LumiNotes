import { useState } from 'react';
import { FileText, Menu } from 'lucide-react';
import { APP_NAME, NAV_ITEMS, type ViewId } from '@/components/layout/navigation';
import { Wordmark } from '@/components/ui/Wordmark';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { PracticeTestsPage } from '@/pages/PracticeTestsPage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { StudyLibraryPage } from '@/pages/StudyLibraryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { useAuth } from '@/hooks/useAuth';

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const activeItem = NAV_ITEMS.find((item) => item.id === activeView);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage userEmail={user?.email ?? ''} onNavigate={setActiveView} />;
      case 'documents':
        return <DocumentsPage />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'practice':
        return <PracticeTestsPage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'library':
        return <StudyLibraryPage />;
      case 'settings':
        return <SettingsPage userEmail={user?.email ?? ''} />;
      default:
        return (
          <ComingSoonPage
            title={activeItem?.label ?? APP_NAME}
            onBack={() => setActiveView('dashboard')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <div
        className={`fixed inset-0 z-40 bg-navy-950/40 transition-opacity duration-200 lg:hidden ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          onClose={() => setIsMenuOpen(false)}
        />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy-100 bg-cream-100/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-100"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-navy-800" aria-hidden="true" />
            <Wordmark className="text-lg text-navy-900" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
