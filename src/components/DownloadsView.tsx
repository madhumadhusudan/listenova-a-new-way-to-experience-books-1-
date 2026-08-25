import React from 'react';
import { Download, HardDrive, Play, Pause, Trash2, CheckCircle2, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../data/languagesAndVoices';

export const DownloadsView: React.FC = () => {
  const {
    documents,
    activeDocument,
    isPlaying,
    setActiveDocumentById,
    setCurrentView,
    toggleDownload,
    setIsUploadModalOpen,
  } = useApp();

  const downloadedDocs = documents.filter((d) => d.isDownloaded);

  const totalMb = downloadedDocs.reduce(
    (acc, d) => acc + (d.downloadSizeMb || 4.5),
    0
  );

  const getLanguageLabel = (code: string) => {
    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return l ? `${l.flag} ${l.name.split(' ')[0]}` : code.toUpperCase();
  };

  return (
    <div id="downloads-view-container" className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header & Storage Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/20 p-6 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Offline Ready Listening</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white">
            Downloaded Audiobooks
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Listen seamlessly on flights, commutes, or areas with poor internet connectivity.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 shrink-0">
          <HardDrive className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="text-xs text-neutral-500 font-medium">Offline Storage</span>
            <p className="text-base font-bold font-mono text-neutral-900 dark:text-white">
              {totalMb.toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Downloaded List */}
      {downloadedDocs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <Download className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
            No offline downloads yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click the download icon on any audiobook in your library to make it available offline.
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
          {downloadedDocs.map((doc) => {
            const isDocActive = activeDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => {
                  setActiveDocumentById(doc.id, false);
                  setCurrentView('player');
                }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-14 rounded-xl bg-gradient-to-br ${
                      doc.coverColor || 'from-emerald-800 to-stone-950'
                    } flex items-center justify-center text-white shrink-0 shadow-xs`}
                  >
                    <BookOpen className="w-5 h-5 text-emerald-200" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold">
                        Downloaded
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {doc.author} • {getLanguageLabel(doc.selectedLanguage)} • {doc.downloadSizeMb || 4.5} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDownload(doc.id);
                    }}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Remove offline download"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocumentById(doc.id, true);
                      setCurrentView('player');
                    }}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all ml-1 shadow-xs"
                  >
                    {isDocActive && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
