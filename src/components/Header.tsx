import React from 'react';
import { Search, Headphones, UploadCloud, Moon, Sun, Play, Pause, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    activeDocument,
    isPlaying,
    togglePlayPause,
    isDarkMode,
    toggleDarkMode,
    setIsUploadModalOpen,
  } = useApp();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4"
    >
      {/* Mobile Brand / View Title */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          id="mobile-header-brand"
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg text-neutral-900 dark:text-white">
            Listen<span className="text-amber-600 dark:text-amber-500">AI</span>
          </span>
        </button>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (currentView !== 'library' && e.target.value.trim().length > 0) {
              setCurrentView('library');
            }
          }}
          placeholder="Search books, authors, notes, or topics..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Active Listening Indicator */}
        {activeDocument && currentView !== 'player' && (
          <button
            id="now-playing-pill"
            onClick={() => setCurrentView('player')}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="truncate max-w-[140px]">{activeDocument.title}</span>
            <div
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="p-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </div>
          </button>
        )}

        {/* Upload Button */}
        <button
          id="header-upload-btn"
          onClick={() => setIsUploadModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm transition-all active:scale-98"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          id="header-theme-toggle"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* About / Guide Button */}
        <button
          id="header-guide-btn"
          onClick={() => setCurrentView('landing')}
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1 text-xs"
          title="About ListenAI & Multilingual Guide"
        >
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </button>
      </div>
    </header>
  );
};
