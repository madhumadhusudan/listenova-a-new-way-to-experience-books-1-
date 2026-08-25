import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Bookmark as BookmarkIcon,
  Moon,
  Sparkles,
  BookOpen,
  Globe,
  Sliders,
  List,
  FileText,
  MessageSquare,
  Maximize2,
  Minimize2,
  Check,
  Heart,
  Download,
  Share2,
  Headphones,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, VOICE_PROFILES } from '../data/languagesAndVoices';
import { ListeningMode, VoiceId } from '../types';
import { DocumentSummaryDrawer } from './DocumentSummaryDrawer';
import { DocumentAssistantDrawer } from './DocumentAssistantDrawer';
import { audioEngine } from '../utils/audioEngine';

export const AudioPlayerView: React.FC = () => {
  const {
    activeDocument,
    activeChapter,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    playbackSpeed,
    volume,
    activeSentenceIndex,
    listeningMode,
    sleepTimer,
    play,
    pause,
    togglePlayPause,
    seek,
    skip,
    setPlaybackSpeed,
    setVolume,
    setListeningMode,
    setSleepTimerPreset,
    playNextChapter,
    playPreviousChapter,
    setActiveChapterById,
    changeDocumentLanguage,
    changeDocumentVoice,
    addBookmark,
    toggleFavorite,
    toggleDownload,
    playSelectedSnippet,
    setIsUploadModalOpen,
    setCurrentView,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'both' | 'audio_only' | 'text_only'>('both');
  const [textLanguageMode, setTextLanguageMode] = useState<'translated' | 'original'>('translated');
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Sync text mode when language changes
  useEffect(() => {
    if (activeDocument && activeDocument.selectedLanguage !== activeDocument.originalLanguage) {
      setTextLanguageMode('translated');
    }
  }, [activeDocument?.selectedLanguage, activeDocument?.originalLanguage]);

  // Auto-scroll to highlighted sentence in Synchronized Reading Mode
  useEffect(() => {
    if (activeSentenceIndex >= 0 && textContainerRef.current) {
      const activeEl = document.getElementById(`sentence-${activeSentenceIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSentenceIndex]);

  // Handle text selection for "Listen to this section"
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText('');
    }
  };

  if (!activeDocument || !activeChapter) {
    return (
      <div className="py-20 px-6 max-w-lg mx-auto text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          <Headphones className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
          No Audiobook Selected
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2 mb-8">
          Upload a PDF, document, research paper, or book to instantly listen in natural AI voices.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          <button
            onClick={() => setCurrentView('library')}
            className="px-5 py-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-medium transition-all"
          >
            Open Library
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === activeDocument.selectedLanguage);
  const currentVoiceObj = VOICE_PROFILES.find((v) => v.id === activeDocument.selectedVoice);

  const displayedText =
    textLanguageMode === 'original'
      ? activeChapter.originalText
      : activeChapter.translatedText || activeChapter.originalText;

  const sentences = activeChapter.sentences && activeChapter.sentences.length > 0
    ? activeChapter.sentences
    : [{ id: 's-0', text: displayedText, startPercent: 0, endPercent: 100 }];

  const listeningModes: { id: ListeningMode; label: string; desc: string }[] = [
    { id: 'full', label: 'Full Book', desc: 'Complete narration' },
    { id: 'summary', label: 'Summary', desc: 'Core takeaways' },
    { id: 'story', label: 'Storyteller', desc: 'Expressive rhythm' },
    { id: 'study', label: 'Study Mode', desc: 'Clear key concepts' },
    { id: 'professional', label: 'Professional', desc: 'Crisp broadcast voice' },
  ];

  return (
    <div
      id="audio-player-container"
      className={`relative pb-24 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-neutral-950 text-white p-6 overflow-y-auto'
          : 'space-y-6 max-w-6xl mx-auto'
      }`}
    >
      {/* Top Bar: Book Title, Mode Toggles, Actions */}
      <div className="flex items-center justify-between gap-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsChapterDrawerOpen(!isChapterDrawerOpen)}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="View Chapters"
          >
            <List className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Chapters ({activeDocument.chapters.length})</span>
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
              {activeDocument.title}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {activeChapter.title} • {activeDocument.author}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AI Summary Button */}
          <button
            id="open-summary-drawer-btn"
            onClick={() => setShowSummaryDrawer(true)}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="AI Document Summary"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Summary</span>
          </button>

          {/* AI Q&A Assistant Button */}
          <button
            id="open-qa-assistant-btn"
            onClick={() => setShowAssistantDrawer(true)}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Ask AI about this Document"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">Ask AI</span>
          </button>

          {/* Favorite & Download */}
          <button
            onClick={() => toggleFavorite(activeDocument.id)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Favorite"
          >
            <Heart
              className={`w-4 h-4 ${
                activeDocument.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          <button
            onClick={() => toggleDownload(activeDocument.id)}
            className={`p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              activeDocument.isDownloaded
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-600 dark:text-neutral-300'
            }`}
            title={activeDocument.isDownloaded ? 'Downloaded for offline' : 'Download for offline'}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AI Background Processing Banner */}
      {activeDocument.processingStatus !== 'ready' && (
        <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
            <span className="truncate">
              <strong>AI Enrichment ({activeDocument.processingProgress}%):</strong>{' '}
              {activeDocument.processingStageMessage}
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            Audio Narration Active
          </span>
        </div>
      )}

      {/* Main Split: Artwork & Controls on Left, Synchronized Reading on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player Hub (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cover & Audio Visualizer Canvas Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${
                activeDocument.coverColor || 'from-amber-600/10 to-transparent'
              } opacity-20 pointer-events-none`}
            />

            {/* Book Artwork Cover */}
            <div
              className={`w-48 h-56 sm:w-56 sm:h-64 rounded-2xl bg-gradient-to-br ${
                activeDocument.coverColor || 'from-amber-700 via-stone-800 to-stone-950'
              } p-6 flex flex-col justify-between text-white shadow-xl shadow-black/20 relative my-2 overflow-hidden transition-transform duration-500 hover:scale-102`}
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-xs text-amber-200">
                  {activeDocument.category}
                </span>
                <span className="font-mono text-xs text-amber-200/80 uppercase">
                  {activeDocument.fileType}
                </span>
              </div>

              <div>
                <BookOpen className="w-10 h-10 text-amber-200/90 mb-2 mx-auto" />
                <h3 className="font-display font-bold text-base line-clamp-2">{activeDocument.title}</h3>
                <p className="text-xs text-amber-100/80 mt-1">By {activeDocument.author}</p>
              </div>

              <div className="text-[11px] text-amber-100/70 font-medium">
                ListenAI Intelligent Speech
              </div>
            </div>

            {/* Language & Voice Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                id="select-listening-lang-btn"
                onClick={() => setIsLanguageModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {currentLangObj ? `${currentLangObj.flag} ${currentLangObj.name}` : 'Language'}
                </span>
              </button>

              <button
                id="select-voice-btn"
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Voice: {currentVoiceObj?.name || 'Kore'}</span>
              </button>

              <button
                id="sleep-timer-btn"
                onClick={() => setIsSleepModalOpen(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  sleepTimer !== null
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-600" />
                <span>{sleepTimer ? `Sleep: ${sleepTimer}m` : 'Sleep Timer'}</span>
              </button>
            </div>

            {/* Listening Mode Selector */}
            <div className="w-full mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                <span>Listening Mode</span>
                <span className="capitalize text-amber-600 dark:text-amber-400 font-bold">{listeningMode}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {listeningModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setListeningMode(m.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                      listeningMode === m.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                    title={m.desc}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Transport Controller Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            {/* Progress Scrubber */}
            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <input
                  id="audio-scrubber"
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Core Buttons */}
            <div className="flex items-center justify-between gap-2">
              {/* Playback Speed dropdown */}
              <div className="relative group">
                <select
                  id="playback-speed-select"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="py-1.5 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.75}>1.75x</option>
                  <option value={2.0}>2.0x</option>
                  <option value={2.5}>2.5x</option>
                </select>
              </div>

              {/* Prev Chapter */}
              <button
                id="player-prev-chapter"
                onClick={playPreviousChapter}
                className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Previous Chapter"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip Back 15s */}
              <button
                id="player-skip-back"
                onClick={() => skip(-15)}
                className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Skip -15s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Central Play/Pause Button */}
              <button
                id="player-main-play-toggle"
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white flex items-center justify-center font-bold shadow-xl shadow-amber-600/30 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Skip Forward 15s */}
              <button
                id="player-skip-forward"
                onClick={() => skip(15)}
                className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Skip +15s"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Next Chapter */}
              <button
                id="player-next-chapter"
                onClick={playNextChapter}
                className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Next Chapter"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Bookmark Button */}
              <button
                id="player-add-bookmark"
                onClick={() => setIsBookmarkModalOpen(true)}
                className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Save Bookmark"
              >
                <BookmarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 1)}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Reading Mode (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col h-[620px]">
            {/* Reader Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-bold text-sm text-neutral-900 dark:text-white">
                  Synchronized Reading
                </h3>
              </div>

              {/* Text language toggle (Original vs Translated) */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs">
                <button
                  onClick={() => setTextLanguageMode('translated')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    textLanguageMode === 'translated'
                      ? 'bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Translated Text ({currentLangObj?.name.split(' ')[0]})
                </button>
                <button
                  onClick={() => setTextLanguageMode('original')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    textLanguageMode === 'original'
                      ? 'bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Original ({activeDocument.originalLanguage.toUpperCase()})
                </button>
              </div>
            </div>

            {/* "Listen to this section" Popover if text selected */}
            {selectedText && (
              <div className="my-2 p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-3 animate-fadeIn">
                <p className="text-xs text-amber-950 dark:text-amber-200 truncate flex-1 font-medium">
                  "{selectedText}"
                </p>
                <button
                  onClick={() => playSelectedSnippet(selectedText)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen to this section</span>
                </button>
              </div>
            )}

            {/* Reader Text Scroll Area */}
            <div
              ref={textContainerRef}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              className="flex-1 overflow-y-auto py-4 pr-2 space-y-4 font-reading text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 selection:bg-amber-500/30"
            >
              {sentences.map((s, idx) => {
                const isActive = idx === activeSentenceIndex && isPlaying;
                return (
                  <span
                    key={s.id || idx}
                    id={`sentence-${idx}`}
                    onClick={() => {
                      // Click sentence to jump audio position
                      const targetSec = (s.startPercent / 100) * duration;
                      seek(targetSec);
                    }}
                    className={`inline cursor-pointer transition-all duration-200 rounded px-1 py-0.5 ${
                      isActive
                        ? 'bg-amber-400/25 text-amber-950 dark:text-amber-200 font-medium underline decoration-amber-500 decoration-2 underline-offset-4'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {s.text}{' '}
                  </span>
                );
              })}
            </div>

            {/* Footer Hint */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Click any sentence to jump audio playback</span>
              <span>Select text to listen to a specific section</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Drawer / Modal */}
      {isChapterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsChapterDrawerOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
                Chapters & Sections
              </h3>
              <button
                onClick={() => setIsChapterDrawerOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {activeDocument.chapters.map((ch) => {
                const isCurrent = ch.id === activeChapter.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setActiveChapterById(ch.id, true);
                      setIsChapterDrawerOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm">{ch.title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Duration: {Math.round(ch.durationSeconds / 60)} min
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 text-amber-600 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsLanguageModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
                  Select Listening Language
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Instant contextual translation into native cadence
                </p>
              </div>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="text-xs text-neutral-500"
              >
                Close
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Indian Regional Languages
              </p>
              {SUPPORTED_LANGUAGES.filter((l) => l.isRegionalIndian).map((lang) => {
                const isSelected = activeDocument.selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeDocumentLanguage(activeDocument.id, lang.code);
                      setIsLanguageModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-semibold">{lang.name}</p>
                        <p className="text-xs text-neutral-500">{lang.nativeName}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-amber-600" />}
                  </button>
                );
              })}

              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider pt-2">
                International Languages
              </p>
              {SUPPORTED_LANGUAGES.filter((l) => !l.isRegionalIndian).map((lang) => {
                const isSelected = activeDocument.selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeDocumentLanguage(activeDocument.id, lang.code);
                      setIsLanguageModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-semibold">{lang.name}</p>
                        <p className="text-xs text-neutral-500">{lang.nativeName}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Voice Selection Modal */}
      {isVoiceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsVoiceModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
                  Choose AI Voice Model
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Calibrated for long-form reading and audiobook pacing
                </p>
              </div>
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-xs text-neutral-500"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {VOICE_PROFILES.map((voice) => {
                const isSelected = activeDocument.selectedVoice === voice.id;
                return (
                  <div
                    key={voice.id}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        changeDocumentVoice(activeDocument.id, voice.id);
                        setIsVoiceModalOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{voice.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {voice.category}
                        </span>
                        <span className="text-[10px] text-neutral-400 capitalize">
                          {voice.gender} • {voice.accent}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {voice.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.previewVoice(voice.id, activeDocument.selectedLanguage);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Listen to sample"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sample</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          changeDocumentVoice(activeDocument.id, voice.id);
                          setIsVoiceModalOpen(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                          isSelected
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sleep Timer Preset Modal */}
      {isSleepModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsSleepModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              Sleep Timer
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Audio playback will gently pause after the selected duration.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '5 Minutes', val: 5 },
                { label: '15 Minutes', val: 15 },
                { label: '30 Minutes', val: 30 },
                { label: '45 Minutes', val: 45 },
                { label: '60 Minutes', val: 60 },
                { label: 'End of Chapter', val: 'end_of_chapter' as const },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSleepTimerPreset(opt.val);
                    setIsSleepModalOpen(false);
                  }}
                  className="py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 hover:bg-amber-500/10 text-xs font-bold text-neutral-800 dark:text-neutral-200 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {sleepTimer !== null && (
              <button
                onClick={() => {
                  setSleepTimerPreset(null);
                  setIsSleepModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                Turn Off Timer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bookmark Note Modal */}
      {isBookmarkModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsBookmarkModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              Save Bookmark
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Saving location at {formatTime(currentTime)} in {activeChapter.title}
            </p>

            <input
              type="text"
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Add an optional note (e.g. Favorite quote, key argument)..."
              className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBookmarkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addBookmark(bookmarkNote);
                  setIsBookmarkModalOpen(false);
                  setBookmarkNote('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20"
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Drawer */}
      <DocumentSummaryDrawer
        isOpen={showSummaryDrawer}
        onClose={() => setShowSummaryDrawer(false)}
        document={activeDocument}
      />

      {/* AI Document Assistant Q&A Drawer */}
      <DocumentAssistantDrawer
        isOpen={showAssistantDrawer}
        onClose={() => setShowAssistantDrawer(false)}
        document={activeDocument}
      />
    </div>
  );
};
