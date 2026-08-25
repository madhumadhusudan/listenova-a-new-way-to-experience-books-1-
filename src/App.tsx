import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { AudioPlayerView } from './components/AudioPlayerView';
import { LibraryView } from './components/LibraryView';
import { UploadView } from './components/UploadView';
import { DownloadsView } from './components/DownloadsView';
import { BookmarksView } from './components/BookmarksView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { LandingPageModal } from './components/LandingPageModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { MiniPlayer } from './components/MiniPlayer';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row antialiased selection:bg-amber-500/25">
      {/* Sidebar / Bottom Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'home' && <HomeDashboard />}
          {currentView === 'player' && <AudioPlayerView />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'upload' && <UploadView />}
          {currentView === 'downloads' && <DownloadsView />}
          {currentView === 'bookmarks' && <BookmarksView />}
          {currentView === 'history' && <HistoryView />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'landing' && <LandingPageModal />}
        </main>
      </div>

      {/* Global Modals & Persistent Mini Player */}
      <DocumentUploadModal />
      <MiniPlayer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
