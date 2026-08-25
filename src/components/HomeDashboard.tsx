import React from 'react';
import {
  Play,
  Pause,
  UploadCloud,
  Clock,
  Sparkles,
  BookOpen,
  Headphones,
  CheckCircle,
  ArrowRight,
  Heart,
  Download,
  Flame,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../data/languagesAndVoices';

export const HomeDashboard: React.FC = () => {
  const {
    documents,
    activeDocument,
    isPlaying,
    togglePlayPause,
    setActiveDocumentById,
    setCurrentView,
    setIsUploadModalOpen,
    processingJobs,
    toggleFavorite,
  } = useApp();

  // Highlighted continue document: activeDocument or the most recently played document or first document
  const continueDoc =
    activeDocument ||
    documents.find((d) => d.lastPlayedAt !== null) ||
    documents[0];

  const recentDocs = [...documents].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const recentlyPlayedDocs = documents.filter((d) => d.lastPlayedAt !== null);

  const favoriteDocs = documents.filter((d) => d.isFavorite);

  const activeProcessingJobs = processingJobs.filter(
    (j) => j.stage !== 'ready' && j.stage !== 'error'
  );

  const formatDuration = (secs: number) => {
    const min = Math.round(secs / 60);
    return `${min} min`;
  };

  const getLanguageLabel = (code: string) => {
    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return l ? `${l.flag} ${l.name.split(' ')[0]}` : code.toUpperCase();
  };

  return (
    <div id="home-dashboard" className="space-y-8 pb-24">
      {/* Top Banner Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-neutral-900/40 p-6 rounded-3xl border border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>AI-Powered Multilingual Audiobooks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Turn Any Book Into Something You Can Listen To
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Upload PDFs, documents, research papers, or journals and transform them into human-like audiobooks in English, Kannada, Tamil, Telugu, Malayalam, and more.
          </p>
        </div>

        <button
          id="home-upload-hero-btn"
          onClick={() => setIsUploadModalOpen(true)}
          className="shrink-0 py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-600/25 transition-all"
        >
          <UploadCloud className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Active Processing Alert (if any) */}
      {activeProcessingJobs.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="font-semibold text-amber-950 dark:text-amber-200 text-sm">
                Document Converting ({activeProcessingJobs.length})
              </h3>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Chapter-by-chapter processing enabled
            </span>
          </div>

          <div className="space-y-3">
            {activeProcessingJobs.map((job) => (
              <div key={job.id} className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium truncate">{job.documentTitle}</span>
                  <span className="font-mono">{job.progress}%</span>
                </div>
                <div className="w-full bg-amber-200/50 dark:bg-amber-900/40 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400">{job.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Continue Listening Hero Card */}
      {continueDoc && (
        <section id="continue-listening-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Continue Listening</span>
            </h2>
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              {/* Cover Artwork */}
              <div
                className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-gradient-to-br ${
                  continueDoc.coverColor || 'from-amber-700 to-stone-900'
                } flex flex-col items-center justify-center text-white shadow-md shrink-0 relative overflow-hidden`}
              >
                <BookOpen className="w-8 h-8 text-amber-200/90 mb-1" />
                <span className="text-[10px] font-mono text-amber-100/70 uppercase">
                  {continueDoc.fileType}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                    {continueDoc.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {getLanguageLabel(continueDoc.selectedLanguage)}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {continueDoc.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  By {continueDoc.author}
                </p>

                {/* Progress bar */}
                <div className="mt-3 w-48 sm:w-64 space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Progress</span>
                    <span className="font-mono font-medium">{continueDoc.currentProgressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${continueDoc.currentProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                id="resume-listening-btn"
                onClick={() => {
                  setActiveDocumentById(continueDoc.id, true);
                  setCurrentView('player');
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all"
              >
                {isPlaying && activeDocument?.id === continueDoc.id ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Now Playing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Recently Added Multilingual Works */}
      <section id="recently-added-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Recently Added to Library</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Ready-to-listen books and documents in multiple languages
            </p>
          </div>

          <button
            onClick={() => setCurrentView('library')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All ({documents.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDocs.slice(0, 4).map((doc) => {
            const isDocActive = activeDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                id={`doc-card-${doc.id}`}
                onClick={() => {
                  setActiveDocumentById(doc.id, false);
                  setCurrentView('player');
                }}
                className="group bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover Top */}
                  <div
                    className={`w-full h-36 rounded-xl bg-gradient-to-br ${
                      doc.coverColor || 'from-amber-800 to-stone-950'
                    } p-4 flex flex-col justify-between text-white relative shadow-inner mb-3 overflow-hidden`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/40 backdrop-blur-xs text-amber-200">
                        {doc.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(doc.id);
                        }}
                        className="p-1 rounded-full hover:bg-black/30 text-white/80 hover:text-rose-400 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            doc.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <span>{getLanguageLabel(doc.selectedLanguage)}</span>
                        <span>•</span>
                        <span>{doc.chapters.length} Chapters</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {doc.author}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{formatDuration(doc.totalDurationSeconds)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocumentById(doc.id, true);
                      setCurrentView('player');
                    }}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-400 transition-all"
                  >
                    {isDocActive && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Quick Recommended Multilingual Journeys */}
      <section className="bg-neutral-100/70 dark:bg-neutral-900/60 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
            Multilingual Listening Spotlights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => {
              const doc = documents.find((d) => d.id === 'doc-kannada-heritage');
              if (doc) {
                setActiveDocumentById(doc.id, true);
                setCurrentView('player');
              }
            }}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ಕನ್ನಡ • Kannada
              </span>
              <Play className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Vachana Sahitya & Basavanna
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Listen to classical 12th-century philosophical verses in authentic Kannada cadence.
            </p>
          </div>

          <div
            onClick={() => {
              const doc = documents.find((d) => d.id === 'doc-tamil-thirukkural');
              if (doc) {
                setActiveDocumentById(doc.id, true);
                setCurrentView('player');
              }
            }}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                தமிழ் • Tamil
              </span>
              <Play className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Thirukkural on Virtue & Speech
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Timeless ethics by Thiruvalluvar translated with poetic resonance.
            </p>
          </div>

          <div
            onClick={() => {
              const doc = documents.find((d) => d.id === 'doc-art-of-war');
              if (doc) {
                setActiveDocumentById(doc.id, true);
                setCurrentView('player');
              }
            }}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                English & Translation
              </span>
              <Play className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              The Art of Strategy & Flow
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Master deep focus, mental clarity, and effortless action with deep baritone voice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
