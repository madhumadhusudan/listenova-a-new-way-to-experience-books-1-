import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize2, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../data/languagesAndVoices';

export const MiniPlayer: React.FC = () => {
  const {
    activeDocument,
    activeChapter,
    isPlaying,
    togglePlayPause,
    skip,
    currentTime,
    duration,
    progressPercent,
    currentView,
    setCurrentView,
    playbackSpeed,
  } = useApp();

  if (!activeDocument || currentView === 'player') {
    return null;
  }

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === activeDocument.selectedLanguage);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="mini-player-bar"
      className="fixed bottom-14 md:bottom-4 left-3 right-3 md:left-68 md:right-6 z-20 bg-neutral-900/95 dark:bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-xl shadow-black/20 border border-neutral-800 transition-all animate-fadeIn cursor-pointer"
      onClick={() => setCurrentView('player')}
    >
      {/* Top Thin Progress Line */}
      <div className="absolute top-0 left-3 right-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activeDocument.coverColor || 'from-amber-600 to-stone-900'} flex items-center justify-center text-white shrink-0 shadow-md`}
          >
            <BookOpen className="w-5 h-5 text-amber-200" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate flex items-center gap-2">
              {activeDocument.title}
              {langObj && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300">
                  {langObj.flag} {langObj.name.split(' ')[0]}
                </span>
              )}
            </h4>
            <p className="text-xs text-neutral-400 truncate">
              {activeChapter?.title || 'Chapter 1'} • {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Center/Right: Playback Controls */}
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id="mini-player-skip-back"
            onClick={() => skip(-15)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Skip 15s backward"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="mini-player-play-toggle"
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/25 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="mini-player-skip-forward"
            onClick={() => skip(15)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Skip 15s forward"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-neutral-800">
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {playbackSpeed}x
            </span>
          </div>

          <button
            id="mini-player-expand"
            onClick={() => setCurrentView('player')}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors ml-1"
            title="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
