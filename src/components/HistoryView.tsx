import React from 'react';
import { History as HistoryIcon, Play, Trash2, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryView: React.FC = () => {
  const { history, clearHistory, documents, setActiveDocumentById, setCurrentView } = useApp();

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div id="history-view-container" className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Listening History</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Track your listening habits, session durations, and chapter completions.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <HistoryIcon className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
            No history recorded yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Your listening progress across books and chapters will automatically be tracked here.
          </p>
          <button
            onClick={() => setCurrentView('library')}
            className="py-2.5 px-5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const doc = documents.find((d) => d.id === item.documentId);
            const chapter = doc?.chapters.find((c) => c.id === item.chapterId);
            if (!doc) return null;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveDocumentById(doc.id, true);
                  setCurrentView('player');
                }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-14 rounded-xl bg-gradient-to-br ${
                      doc.coverColor || 'from-amber-700 to-stone-900'
                    } flex items-center justify-center text-white shrink-0 shadow-xs`}
                  >
                    <BookOpen className="w-5 h-5 text-amber-200" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {formatTimeAgo(item.lastListenedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {chapter?.title || 'Chapter'} • {item.progressPercent}% completed
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDocumentById(doc.id, true);
                    setCurrentView('player');
                  }}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-400 font-bold transition-all shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
