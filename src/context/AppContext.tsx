import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Bookmark,
  Chapter,
  DocumentItem,
  ListeningHistoryItem,
  ListeningMode,
  ProcessingJob,
  SentenceSegment,
  UserSettings,
  VoiceId,
} from '../types';
import {
  getStoredActiveDocId,
  getStoredBookmarks,
  getStoredDocuments,
  getStoredHistory,
  getStoredSettings,
  saveStoredBookmarks,
  saveStoredDocuments,
  saveStoredHistory,
  saveStoredSettings,
  setStoredActiveDocId,
} from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { analyzeDocumentAPI, generateSummaryAPI, translateChapterAPI } from '../services/api';
import confetti from 'canvas-confetti';

export type NavigationView =
  | 'home'
  | 'library'
  | 'upload'
  | 'player'
  | 'downloads'
  | 'bookmarks'
  | 'history'
  | 'settings'
  | 'landing';

interface AppContextType {
  // Navigation & View
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Documents
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  activeChapter: Chapter | null;
  setActiveDocumentById: (id: string | null, startPlaying?: boolean) => void;
  setActiveChapterById: (chapterId: string, startPlaying?: boolean) => void;
  updateDocumentMetadata: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleDownload: (id: string) => void;

  // Playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progressPercent: number;
  playbackSpeed: number;
  volume: number;
  activeSentenceIndex: number;
  listeningMode: ListeningMode;
  sleepTimer: number | 'end_of_chapter' | null;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (vol: number) => void;
  setListeningMode: (mode: ListeningMode) => void;
  setSleepTimerPreset: (minutes: number | 'end_of_chapter' | null) => void;
  playNextChapter: () => void;
  playPreviousChapter: () => void;
  playSelectedSnippet: (text: string) => void;

  // Language & Voice
  changeDocumentLanguage: (documentId: string, targetLang: string) => Promise<void>;
  changeDocumentVoice: (documentId: string, voiceId: VoiceId) => void;

  // Upload & Async Processing Pipeline
  processingJobs: ProcessingJob[];
  processNewDocument: (
    rawText: string,
    fileName: string,
    fileType: DocumentItem['fileType'],
    targetLang?: string,
    voiceId?: VoiceId
  ) => Promise<string>;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (note?: string) => void;
  editBookmark: (id: string, newNote: string) => void;
  deleteBookmark: (id: string) => void;
  jumpToBookmark: (bookmark: Bookmark) => void;

  // History
  history: ListeningHistoryItem[];
  clearHistory: () => void;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Modals & UI helpers
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isSummarizerOpen: boolean;
  setIsSummarizerOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  selectedTextForAudio: string | null;
  setSelectedTextForAudio: (text: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavigationView>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [documents, setDocuments] = useState<DocumentItem[]>(() => getStoredDocuments());
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => getStoredActiveDocId());
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(100);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [playbackSpeed, setSpeedState] = useState<number>(1.0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [listeningMode, setListeningMode] = useState<ListeningMode>('full');
  const [sleepTimer, setSleepTimer] = useState<number | 'end_of_chapter' | null>(null);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getStoredBookmarks());
  const [history, setHistory] = useState<ListeningHistoryItem[]>(() => getStoredHistory());
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSummarizerOpen, setIsSummarizerOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [selectedTextForAudio, setSelectedTextForAudio] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = getStoredSettings().theme;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    updateSettings({ theme: next ? 'dark' : 'light' });
  };

  // Derive active document & active chapter
  const activeDocument = documents.find((d) => d.id === activeDocumentId) || null;
  const activeChapter = activeDocument
    ? activeDocument.chapters.find((c) => c.id === (activeChapterId || activeDocument.currentChapterId)) || activeDocument.chapters[0] || null
    : null;

  // Persist state updates
  useEffect(() => {
    saveStoredDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveStoredBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    setStoredActiveDocId(activeDocumentId);
  }, [activeDocumentId]);

  // Audio Engine Callbacks Setup
  useEffect(() => {
    audioEngine.setCallbacks({
      onTimeUpdate: (curTime, totalDur, pct) => {
        setCurrentTime(curTime);
        setDuration(totalDur);
        setProgressPercent(pct);

        // Update document progress in state
        if (activeDocumentId && activeChapter) {
          setDocuments((prevDocs) =>
            prevDocs.map((doc) => {
              if (doc.id === activeDocumentId) {
                return {
                  ...doc,
                  currentAudioPositionSeconds: Math.round(curTime),
                  currentProgressPercent: Math.round(pct),
                  lastPlayedAt: new Date().toISOString(),
                };
              }
              return doc;
            })
          );
        }
      },
      onSentenceChange: (idx) => {
        setActiveSentenceIndex(idx);
      },
      onPlayStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onEnded: () => {
        setIsPlaying(false);
        // Check if sleep timer was on end_of_chapter
        if (sleepTimer === 'end_of_chapter') {
          setSleepTimer(null);
          return;
        }
        if (settings.autoPlayNextChapter) {
          playNextChapter();
        }
      },
      onError: (msg) => {
        console.warn('Audio Engine callback error:', msg);
        setIsPlaying(false);
      },
    });
  }, [activeDocumentId, activeChapter, sleepTimer, settings.autoPlayNextChapter]);

  // Update history item when active doc plays
  const recordHistory = useCallback((docId: string, chapterId: string, pct: number) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => !(h.documentId === docId && h.chapterId === chapterId));
      const newItem: ListeningHistoryItem = {
        id: `hist-${Date.now()}`,
        documentId: docId,
        chapterId,
        progressPercent: pct,
        lastListenedAt: new Date().toISOString(),
        durationListenedSeconds: Math.round(currentTime),
      };
      return [newItem, ...filtered].slice(0, 30);
    });
  }, [currentTime]);

  // Playback control functions
  const play = useCallback(async () => {
    if (!activeDocument || !activeChapter) return;
    const isNonOriginalLang = activeDocument.selectedLanguage !== activeDocument.originalLanguage;
    
    let textToSpeak =
      isNonOriginalLang && activeChapter.translatedText
        ? activeChapter.translatedText
        : activeChapter.narrationScript || activeChapter.originalText || '';

    // If target language is non-original and not translated yet, translate on-the-fly
    if (isNonOriginalLang && (!activeChapter.translatedText || activeChapter.translatedText === activeChapter.originalText)) {
      try {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === activeDocument.id
              ? { ...d, processingStageMessage: `Translating chapter into ${activeDocument.selectedLanguage}...` }
              : d
          )
        );
        const translated = await translateChapterAPI(
          activeChapter.originalText,
          activeDocument.selectedLanguage,
          activeDocument.originalLanguage,
          activeDocument.title
        );
        if (translated) {
          textToSpeak = translated;
          const translatedSentences = generateSentenceSegments(translated);
          setDocuments((prev) =>
            prev.map((d) => {
              if (d.id === activeDocument.id) {
                const updatedChapters = d.chapters.map((c) =>
                  c.id === activeChapter.id
                    ? { ...c, translatedText: translated, sentences: translatedSentences }
                    : c
                );
                return { ...d, processingStageMessage: 'Ready', chapters: updatedChapters };
              }
              return d;
            })
          );
        }
      } catch (err) {
        console.warn('Failed on-demand chapter translation:', err);
      }
    }

    if (!textToSpeak) return;

    audioEngine.loadAndPlay(
      isNonOriginalLang ? undefined : activeChapter.audioUrl,
      textToSpeak,
      activeDocument.selectedLanguage,
      activeDocument.selectedVoice,
      activeDocument.currentAudioPositionSeconds || 0,
      activeChapter.durationSeconds || 180
    );
    recordHistory(activeDocument.id, activeChapter.id, activeDocument.currentProgressPercent || 0);
  }, [activeDocument, activeChapter, recordHistory]);

  const pause = useCallback(() => {
    audioEngine.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
  }, []);

  const skip = useCallback((seconds: number) => {
    audioEngine.skipSeconds(seconds);
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setSpeedState(speed);
    audioEngine.setPlaybackRate(speed);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
  }, []);

  const setSleepTimerPreset = useCallback((minutes: number | 'end_of_chapter' | null) => {
    setSleepTimer(minutes);
    if (minutes === null) {
      audioEngine.clearSleepTimer();
    } else if (minutes === 'end_of_chapter') {
      // Audio engine onEnded handles this
    } else {
      audioEngine.setSleepTimer(minutes, () => {
        setSleepTimer(null);
      });
    }
  }, []);

  const setActiveDocumentById = useCallback((id: string | null, startPlaying: boolean = false) => {
    if (!id) {
      audioEngine.stop();
      setActiveDocumentId(null);
      setActiveChapterId(null);
      return;
    }
    const targetDoc = documents.find((d) => d.id === id);
    if (targetDoc) {
      audioEngine.stop();
      setActiveDocumentId(id);
      const ch =
        targetDoc.chapters?.find((c) => c.id === targetDoc.currentChapterId) ||
        targetDoc.chapters?.[0] ||
        null;
      if (ch) {
        setActiveChapterId(ch.id);
      }
      if (startPlaying && ch) {
        setTimeout(async () => {
          const isNonOriginalLang = targetDoc.selectedLanguage !== targetDoc.originalLanguage;
          let textToSpeak =
            isNonOriginalLang && ch.translatedText
              ? ch.translatedText
              : ch.narrationScript || ch.originalText || '';

          if (isNonOriginalLang && !ch.translatedText) {
            try {
              const trans = await translateChapterAPI(
                ch.originalText,
                targetDoc.selectedLanguage,
                targetDoc.originalLanguage,
                targetDoc.title
              );
              if (trans) {
                textToSpeak = trans;
                const translatedSentences = generateSentenceSegments(trans);
                setDocuments((prev) =>
                  prev.map((d) => {
                    if (d.id === targetDoc.id) {
                      const updatedChapters = d.chapters.map((cItem) =>
                        cItem.id === ch.id
                          ? { ...cItem, translatedText: trans, sentences: translatedSentences }
                          : cItem
                      );
                      return { ...d, chapters: updatedChapters };
                    }
                    return d;
                  })
                );
              }
            } catch (e) {
              console.warn(e);
            }
          }

          if (textToSpeak) {
            audioEngine.loadAndPlay(
              isNonOriginalLang ? undefined : ch.audioUrl,
              textToSpeak,
              targetDoc.selectedLanguage,
              targetDoc.selectedVoice,
              targetDoc.currentAudioPositionSeconds || 0,
              ch.durationSeconds || 180
            );
          }
        }, 150);
      }
    }
  }, [documents]);

  const setActiveChapterById = useCallback((chapterId: string, startPlaying: boolean = true) => {
    if (!activeDocument || !activeDocument.chapters) return;
    const targetChapter = activeDocument.chapters.find((c) => c.id === chapterId);
    if (targetChapter) {
      audioEngine.stop();
      setActiveChapterId(chapterId);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocument.id
            ? { ...doc, currentChapterId: chapterId, currentAudioPositionSeconds: 0, currentProgressPercent: 0 }
            : doc
        )
      );
      if (startPlaying) {
        setTimeout(async () => {
          const isNonOriginalLang = activeDocument.selectedLanguage !== activeDocument.originalLanguage;
          let textToSpeak =
            isNonOriginalLang && targetChapter.translatedText
              ? targetChapter.translatedText
              : targetChapter.narrationScript || targetChapter.originalText || '';

          if (isNonOriginalLang && !targetChapter.translatedText) {
            try {
              const trans = await translateChapterAPI(
                targetChapter.originalText,
                activeDocument.selectedLanguage,
                activeDocument.originalLanguage,
                activeDocument.title
              );
              if (trans) {
                textToSpeak = trans;
                const translatedSentences = generateSentenceSegments(trans);
                setDocuments((prev) =>
                  prev.map((d) => {
                    if (d.id === activeDocument.id) {
                      const updatedChapters = d.chapters.map((cItem) =>
                        cItem.id === targetChapter.id
                          ? { ...cItem, translatedText: trans, sentences: translatedSentences }
                          : cItem
                      );
                      return { ...d, chapters: updatedChapters };
                    }
                    return d;
                  })
                );
              }
            } catch (e) {
              console.warn(e);
            }
          }

          if (textToSpeak) {
            audioEngine.loadAndPlay(
              isNonOriginalLang ? undefined : targetChapter.audioUrl,
              textToSpeak,
              activeDocument.selectedLanguage,
              activeDocument.selectedVoice,
              0,
              targetChapter.durationSeconds || 180
            );
          }
        }, 150);
      }
    }
  }, [activeDocument]);

  const playNextChapter = useCallback(() => {
    if (!activeDocument || !activeChapter || !activeDocument.chapters) return;
    const curIdx = activeDocument.chapters.findIndex((c) => c.id === activeChapter.id);
    if (curIdx >= 0 && curIdx < activeDocument.chapters.length - 1) {
      const nextCh = activeDocument.chapters[curIdx + 1];
      if (nextCh) {
        setActiveChapterById(nextCh.id, true);
      }
    } else {
      // Completed book!
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  }, [activeDocument, activeChapter, setActiveChapterById]);

  const playPreviousChapter = useCallback(() => {
    if (!activeDocument || !activeChapter || !activeDocument.chapters) return;
    const curIdx = activeDocument.chapters.findIndex((c) => c.id === activeChapter.id);
    if (curIdx > 0) {
      const prevCh = activeDocument.chapters[curIdx - 1];
      if (prevCh) {
        setActiveChapterById(prevCh.id, true);
      }
    } else {
      seek(0);
    }
  }, [activeDocument, activeChapter, setActiveChapterById, seek]);

  const playSelectedSnippet = useCallback((text: string) => {
    if (!text.trim()) return;
    const lang = activeDocument?.selectedLanguage || 'en';
    const voice = activeDocument?.selectedVoice || 'kore';
    audioEngine.playSynthetic(text, lang, voice, 0);
  }, [activeDocument]);

  // Language change with context-aware auto-translation
  const changeDocumentLanguage = useCallback(async (docId: string, targetLang: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc || !doc.chapters || doc.chapters.length === 0) return;

    const isCurrentActive = activeDocumentId === docId;
    const wasPlaying = audioEngine.getIsPlaying();

    // 1. Immediately update document's selectedLanguage state
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, selectedLanguage: targetLang } : d))
    );

    // If switching back to original language:
    if (doc.originalLanguage === targetLang) {
      if (isCurrentActive && activeChapter) {
        const textToSpeak = activeChapter.narrationScript || activeChapter.originalText;
        if (wasPlaying) {
          audioEngine.loadAndPlay(
            activeChapter.audioUrl,
            textToSpeak,
            targetLang,
            doc.selectedVoice,
            currentTime,
            activeChapter.durationSeconds || 180
          );
        }
      }
      return;
    }

    // Switching to target language (e.g. 'kn' Kannada, 'hi' Hindi, 'ta' Tamil):
    const currentChapter =
      doc.chapters.find((c) => c.id === (isCurrentActive ? activeChapterId : doc.currentChapterId)) ||
      doc.chapters[0];

    if (currentChapter) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                selectedLanguage: targetLang,
                processingStageMessage: `Translating chapter into ${targetLang}...`,
              }
            : d
        )
      );

      try {
        const translated = await translateChapterAPI(
          currentChapter.originalText,
          targetLang,
          doc.originalLanguage,
          doc.title
        );

        const translatedSentences = generateSentenceSegments(translated);

        setDocuments((prev) =>
          prev.map((d) => {
            if (d.id === docId) {
              const updatedChapters = d.chapters.map((c) =>
                c.id === currentChapter.id
                  ? { ...c, translatedText: translated, sentences: translatedSentences }
                  : c
              );
              return {
                ...d,
                selectedLanguage: targetLang,
                processingStageMessage: `Ready in ${targetLang}`,
                chapters: updatedChapters,
              };
            }
            return d;
          })
        );

        // Always restart speech in the new language with the translated text if it's active or playing!
        if (isCurrentActive) {
          audioEngine.loadAndPlay(
            undefined, // Force synthetic speech with translated native text
            translated,
            targetLang,
            doc.selectedVoice,
            wasPlaying ? currentTime : 0,
            currentChapter.durationSeconds || 180
          );
        }

        // Stagger background translation of remaining chapters with small delay
        const otherChapters = doc.chapters.filter((c) => c.id !== currentChapter.id);
        let delayMs = 1200;
        for (const oCh of otherChapters) {
          setTimeout(() => {
            translateChapterAPI(oCh.originalText, targetLang, doc.originalLanguage, doc.title)
              .then((trans) => {
                const transSentences = generateSentenceSegments(trans);
                setDocuments((prev) =>
                  prev.map((d) => {
                    if (d.id === docId) {
                      const updated = d.chapters.map((c) =>
                        c.id === oCh.id
                          ? { ...c, translatedText: trans, sentences: transSentences }
                          : c
                      );
                      return { ...d, chapters: updated };
                    }
                    return d;
                  })
                );
              })
              .catch(() => {});
          }, delayMs);
          delayMs += 1500;
        }
      } catch (err) {
        console.error('Failed chapter translation:', err);
      }
    }
  }, [documents, activeDocumentId, activeChapterId, activeChapter, currentTime]);

  const changeDocumentVoice = useCallback((docId: string, voiceId: VoiceId) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, selectedVoice: voiceId } : d))
    );
    const doc = documents.find((d) => d.id === docId);
    if (activeDocumentId === docId && activeChapter) {
      const isNonOriginalLang = doc && doc.selectedLanguage !== doc.originalLanguage;
      const textToSpeak =
        isNonOriginalLang && activeChapter?.translatedText
          ? activeChapter.translatedText
          : activeChapter?.narrationScript || activeChapter?.originalText || '';
      const latestTime = audioEngine.getCurrentTime();
      if (isPlaying && textToSpeak) {
        audioEngine.loadAndPlay(
          isNonOriginalLang ? undefined : activeChapter.audioUrl,
          textToSpeak,
          doc?.selectedLanguage || 'en',
          voiceId,
          latestTime,
          activeChapter.durationSeconds || 180
        );
      }
    }
  }, [documents, activeDocumentId, isPlaying, activeChapter]);

  const updateDocumentMetadata = useCallback((id: string, updates: Partial<DocumentItem>) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    if (activeDocumentId === id) {
      audioEngine.stop();
      setActiveDocumentId(null);
      setActiveChapterId(null);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setBookmarks((prev) => prev.filter((b) => b.documentId !== id));
    setHistory((prev) => prev.filter((h) => h.documentId !== id));
  }, [activeDocumentId]);

  const toggleFavorite = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc))
    );
  }, []);

  const toggleDownload = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextDownloaded = !doc.isDownloaded;
          const estSize = doc.downloadSizeMb || Math.round((doc.fileSize / 1024 / 1024) * 4 * 10) / 10 || 5.2;
          return {
            ...doc,
            isDownloaded: nextDownloaded,
            downloadSizeMb: nextDownloaded ? estSize : undefined,
          };
        }
        return doc;
      })
    );
  }, []);

  // Bookmarks management
  const addBookmark = useCallback((note: string = '') => {
    if (!activeDocument || !activeChapter) return;
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      documentId: activeDocument.id,
      documentTitle: activeDocument.title,
      chapterId: activeChapter.id,
      chapterTitle: activeChapter.title,
      audioPositionSeconds: Math.round(currentTime),
      progressPercent: Math.round(progressPercent),
      note: note || `Bookmark at ${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`,
      textSnippet: (activeChapter.originalText || '').slice(0, 140) + '...',
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [newBookmark, ...prev]);
  }, [activeDocument, activeChapter, currentTime, progressPercent]);

  const editBookmark = useCallback((id: string, newNote: string) => {
    setBookmarks((prev) => prev.map((bm) => (bm.id === id ? { ...bm, note: newNote } : bm)));
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
  }, []);

  const jumpToBookmark = useCallback((bookmark: Bookmark) => {
    setActiveDocumentById(bookmark.documentId, false);
    setTimeout(() => {
      setActiveChapterById(bookmark.chapterId, false);
      seek(bookmark.audioPositionSeconds);
      play();
    }, 150);
  }, [setActiveDocumentById, setActiveChapterById, seek, play]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Full Asynchronous Document Processing Pipeline
  const processNewDocument = useCallback(
    async (
      rawText: string,
      fileName: string,
      fileType: DocumentItem['fileType'],
      targetLang: string = 'en',
      voiceId: VoiceId = 'kore',
      startPlayingImmediately: boolean = true
    ): Promise<string> => {
      const docId = `doc-${Date.now()}`;
      const jobId = `job-${Date.now()}`;

      const cleanText = rawText.trim();
      const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      const chunkSize = Math.max(1, Math.ceil(paragraphs.length / 3));
      const initialChapters: Chapter[] = [];

      for (let i = 0; i < paragraphs.length; i += chunkSize) {
        const chNum = Math.floor(i / chunkSize) + 1;
        const chText = paragraphs.slice(i, i + chunkSize).join('\n\n');
        initialChapters.push({
          id: `ch-${docId}-${chNum}`,
          documentId: docId,
          chapterNumber: chNum,
          title: `Chapter ${chNum}: Section ${chNum}`,
          durationSeconds: Math.max(30, Math.round((chText.split(/\s+/).length / 130) * 60)),
          isProcessed: true,
          originalText: chText,
          sentences: generateSentenceSegments(chText),
        });
      }

      if (initialChapters.length === 0) {
        initialChapters.push({
          id: `ch-${docId}-1`,
          documentId: docId,
          chapterNumber: 1,
          title: 'Chapter 1',
          durationSeconds: Math.max(30, Math.round((cleanText.split(/\s+/).length / 130) * 60)),
          isProcessed: true,
          originalText: cleanText,
          sentences: generateSentenceSegments(cleanText),
        });
      }

      const totalInitialDuration = initialChapters.reduce((acc, c) => acc + c.durationSeconds, 0);

      // 1. Create initial doc with ready chapters
      const initialDoc: DocumentItem = {
        id: docId,
        title: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        author: 'Analyzing...',
        originalLanguage: 'en',
        selectedLanguage: targetLang,
        selectedVoice: voiceId,
        coverColor: getRandomCoverPalette(),
        coverIcon: getRandomCoverIcon(),
        category: 'General Reading',
        fileType,
        fileSize: rawText.length * 2,
        totalDurationSeconds: totalInitialDuration,
        currentProgressPercent: 0,
        currentChapterId: initialChapters[0].id,
        currentAudioPositionSeconds: 0,
        isFavorite: false,
        isDownloaded: false,
        processingStatus: 'uploading',
        processingProgress: 35,
        processingStageMessage: 'Analyzing document structure & natural prosody...',
        chapters: initialChapters,
        createdAt: new Date().toISOString(),
        lastPlayedAt: null,
      };

      setDocuments((prev) => [initialDoc, ...prev]);
      setActiveDocumentId(docId);
      setActiveChapterId(initialChapters[0].id);

      const initialJob: ProcessingJob = {
        id: jobId,
        documentId: docId,
        documentTitle: initialDoc.title,
        stage: 'uploading',
        progress: 35,
        currentChapter: 1,
        totalChapters: initialChapters.length,
        message: 'Analyzing document structure...',
        startedAt: new Date().toISOString(),
      };
      setProcessingJobs((prev) => [initialJob, ...prev]);

      // If immediate playback requested, start Chapter 1 narration
      if (startPlayingImmediately) {
        if (targetLang && targetLang !== 'en') {
          // Translate Chapter 1 first, then speak in target language
          translateChapterAPI(initialChapters[0].originalText, targetLang, 'en', initialDoc.title)
            .then((transText) => {
              const transSentences = generateSentenceSegments(transText);
              setDocuments((prev) =>
                prev.map((d) => {
                  if (d.id === docId) {
                    const updatedChapters = d.chapters.map((c, idx) =>
                      idx === 0 ? { ...c, translatedText: transText, sentences: transSentences } : c
                    );
                    return { ...d, chapters: updatedChapters };
                  }
                  return d;
                })
              );
              audioEngine.loadAndPlay(
                undefined,
                transText,
                targetLang,
                voiceId,
                0,
                initialChapters[0].durationSeconds
              );
            })
            .catch(() => {
              audioEngine.loadAndPlay(
                undefined,
                initialChapters[0].originalText,
                targetLang,
                voiceId,
                0,
                initialChapters[0].durationSeconds
              );
            });
        } else {
          setTimeout(() => {
            const textToSpeak = initialChapters[0].originalText;
            if (textToSpeak) {
              audioEngine.loadAndPlay(
                undefined,
                textToSpeak,
                targetLang,
                voiceId,
                0,
                initialChapters[0].durationSeconds
              );
            }
          }, 300);
        }
      }

      // Execute background AI enrichment pipeline
      setTimeout(async () => {
        try {
          // Stage 2: Extracting & Analyzing
          updateDocProgress(docId, 'extracting', 50, 'Refining chapter boundaries & literary tone...');
          updateJobProgress(jobId, 'extracting', 50, 'Refining metadata & chapter hierarchy');

          const analysis = await analyzeDocumentAPI(rawText, fileName, fileType);

          // Stage 3: Updating Chapters
          updateDocProgress(docId, 'detecting_chapters', 70, `Refined ${analysis.chapters.length} chapters with sentence maps`);
          updateJobProgress(jobId, 'detecting_chapters', 70, `Detected ${analysis.chapters.length} chapters`);

          const chapters: Chapter[] = analysis.chapters.map((ch, idx) => {
            const sentences: SentenceSegment[] = generateSentenceSegments(ch.originalText);
            const duration = ch.durationSeconds || Math.max(30, Math.round((ch.originalText.split(/\s+/).length / 130) * 60));
            return {
              id: `ch-${docId}-${idx + 1}`,
              documentId: docId,
              chapterNumber: ch.chapterNumber || idx + 1,
              title: ch.title || `Chapter ${idx + 1}`,
              durationSeconds: duration,
              isProcessed: true,
              originalText: ch.originalText,
              sentences,
            };
          });

          const totalDuration = chapters.reduce((acc, c) => acc + c.durationSeconds, 0);

          // Stage 4: Preparing Translation (if needed)
          if (targetLang !== analysis.detectedLanguage && chapters[0]) {
            updateDocProgress(docId, 'translating', 85, `Translating Chapter 1 into ${targetLang}...`);
            updateJobProgress(jobId, 'translating', 85, `Translating into ${targetLang}`);
            const ch1 = chapters[0];
            ch1.translatedText = await translateChapterAPI(ch1.originalText, targetLang, analysis.detectedLanguage, analysis.title);
          }

          // Stage 5: Ready!
          updateDocProgress(docId, 'generating_audio', 95, 'Calibrating natural voice prosody...');
          updateJobProgress(jobId, 'generating_audio', 95, 'Calibrating voice audio');

          // Stage 6: Generate Summary in Background
          generateSummaryAPI(analysis.title, analysis.author, rawText).then((summary) => {
            setDocuments((prev) =>
              prev.map((d) => (d.id === docId ? { ...d, summary } : d))
            );
          });

          // Final update with enriched metadata
          setDocuments((prev) =>
            prev.map((d) => {
              if (d.id !== docId) return d;
              return {
                ...d,
                title: analysis.title || d.title,
                author: analysis.author || 'Author',
                originalLanguage: analysis.detectedLanguage || 'en',
                selectedLanguage: targetLang,
                category: analysis.category || 'General Reading',
                totalDurationSeconds: totalDuration,
                processingStatus: 'ready',
                processingProgress: 100,
                processingStageMessage: 'Ready to listen in natural AI voice',
                chapters: chapters.length > 0 ? chapters : d.chapters,
              };
            })
          );

          setProcessingJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, stage: 'ready', progress: 100, message: 'Ready to listen' } : j))
          );
        } catch (err: any) {
          console.error('Background analysis completed with fallback:', err);
          // Ensure document is still marked ready
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === docId
                ? {
                    ...d,
                    processingStatus: 'ready',
                    processingProgress: 100,
                    processingStageMessage: 'Ready to listen in natural AI voice',
                  }
                : d
            )
          );
          setProcessingJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, stage: 'ready', progress: 100, message: 'Ready to listen' } : j))
          );
        }
      }, 300);

      return docId;
    },
    []
  );

  const updateDocProgress = (docId: string, status: DocumentItem['processingStatus'], pct: number, msg: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, processingStatus: status, processingProgress: pct, processingStageMessage: msg } : d))
    );
  };

  const updateJobProgress = (jobId: string, stage: ProcessingJob['stage'], pct: number, msg: string) => {
    setProcessingJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, stage, progress: pct, message: msg } : j))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        documents,
        activeDocument,
        activeChapter,
        setActiveDocumentById,
        setActiveChapterById,
        updateDocumentMetadata,
        deleteDocument,
        toggleFavorite,
        toggleDownload,
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
        playSelectedSnippet,
        changeDocumentLanguage,
        changeDocumentVoice,
        processingJobs,
        processNewDocument,
        bookmarks,
        addBookmark,
        editBookmark,
        deleteBookmark,
        jumpToBookmark,
        history,
        clearHistory,
        settings,
        updateSettings,
        isDarkMode,
        toggleDarkMode,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isSummarizerOpen,
        setIsSummarizerOpen,
        isAssistantOpen,
        setIsAssistantOpen,
        selectedTextForAudio,
        setSelectedTextForAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helpers for cover styling
function getRandomCoverPalette(): string {
  const palettes = [
    'from-amber-700 via-stone-800 to-stone-950',
    'from-emerald-800 via-teal-900 to-neutral-950',
    'from-indigo-900 via-slate-900 to-neutral-950',
    'from-rose-900 via-stone-900 to-neutral-950',
    'from-blue-900 via-cyan-950 to-slate-950',
    'from-violet-900 via-purple-950 to-stone-950',
  ];
  return palettes[Math.floor(Math.random() * palettes.length)];
}

function getRandomCoverIcon(): string {
  const icons = ['BookOpen', 'Sparkles', 'Compass', 'Feather', 'Cpu', 'Layers'];
  return icons[Math.floor(Math.random() * icons.length)];
}

function generateSentenceSegments(text: string): SentenceSegment[] {
  const matches = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const total = matches.length || 1;
  return matches.map((s, idx) => ({
    id: `s-${idx}`,
    text: s.trim(),
    startPercent: Math.round((idx / total) * 100),
    endPercent: Math.round(((idx + 1) / total) * 100),
  }));
}
