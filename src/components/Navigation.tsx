import React from 'react';
import {
  Home,
  BookOpen,
  UploadCloud,
  Download,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Headphones,
  Moon,
  Sun,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { NavigationView, useApp } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    processingJobs,
    bookmarks,
    documents,
    isDarkMode,
    toggleDarkMode,
    setIsUploadModalOpen,
  } = useApp();

  const activeProcessingCount = processingJobs.filter(
    (j) => j.stage !== 'ready' && j.stage !== 'error'
  ).length;

  const downloadedCount = documents.filter((d) => d.isDownloaded).length;

  const navItems: { id: NavigationView; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'My Library', icon: BookOpen, badge: documents.length },
    { id: 'upload', label: 'Upload & Convert', icon: UploadCloud, badge: activeProcessingCount > 0 ? `${activeProcessingCount} converting` : undefined },
    { id: 'downloads', label: 'Downloads', icon: Download, badge: downloadedCount > 0 ? downloadedCount : undefined },
    { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon, badge: bookmarks.length > 0 ? bookmarks.length : undefined },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md h-screen sticky top-0 shrink-0 z-20"
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <button
            id="brand-home-btn"
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 text-left group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                  Listen<span className="text-amber-600 dark:text-amber-500">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  Pro
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Multilingual Audiobooks
              </p>
            </div>
          </button>
        </div>

        {/* Quick Upload CTA */}
        <div className="px-4 pt-4 pb-2">
          <button
            id="sidebar-upload-cta"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-amber-600/20 hover:shadow-amber-600/30 active:scale-98 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-900 dark:text-amber-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      typeof item.badge === 'string'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse-subtle'
                        : isActive
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Privacy & Theme Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Private & Secure</span>
            </div>
            <button
              id="theme-toggle-sidebar"
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          
          <button
            id="landing-info-btn"
            onClick={() => setCurrentView('landing')}
            className="w-full text-left p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-medium">About ListenAI</span>
            </div>
            <span className="text-[11px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200">
              Guide →
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around"
      >
        <button
          id="mob-nav-home"
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium ${
            currentView === 'home'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          id="mob-nav-library"
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium ${
            currentView === 'library'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Library</span>
        </button>

        <button
          id="mob-nav-upload"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 -mt-4 bg-gradient-to-tr from-amber-600 to-amber-500 text-white rounded-full shadow-lg shadow-amber-600/30 text-xs font-medium"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Upload</span>
        </button>

        <button
          id="mob-nav-bookmarks"
          onClick={() => setCurrentView('bookmarks')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium ${
            currentView === 'bookmarks'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <BookmarkIcon className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
        </button>

        <button
          id="mob-nav-settings"
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium ${
            currentView === 'settings'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <SettingsIcon className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </button>
      </div>
    </>
  );
};
