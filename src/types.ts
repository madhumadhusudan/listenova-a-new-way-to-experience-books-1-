export type ProcessingStatus = 
  | 'uploading' 
  | 'extracting' 
  | 'detecting_chapters' 
  | 'translating' 
  | 'generating_audio' 
  | 'ready' 
  | 'error';

export type ListeningMode = 
  | 'full'          // Full complete text reading
  | 'summary'       // AI-summarized insights narration
  | 'story'         // Expressive & theatrical cadence
  | 'study'         // Clear key concept emphasis with pauses
  | 'professional'; // Crisp, neutral broadcast style

export type VoiceCategory = 
  | 'Calm' 
  | 'Warm' 
  | 'Professional' 
  | 'Deep' 
  | 'Friendly' 
  | 'Storyteller' 
  | 'Expressive';

export type VoiceId = 
  | 'kore' 
  | 'zephyr' 
  | 'puck' 
  | 'fenrir' 
  | 'charon' 
  | 'ananya' 
  | 'aarav' 
  | 'meera' 
  | 'kavya' 
  | 'arjun';

export interface VoiceProfile {
  id: VoiceId;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  category: VoiceCategory;
  description: string;
  geminiVoiceName: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  accent: string;
  sampleText: string;
  pitch: number;
  rate: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRegionalIndian?: boolean;
}

export interface SentenceSegment {
  id: string;
  text: string;
  startPercent: number;
  endPercent: number;
  timestampSeconds?: number;
}

export interface Chapter {
  id: string;
  documentId: string;
  chapterNumber: number;
  title: string;
  durationSeconds: number;
  isProcessed: boolean;
  originalText: string;
  translatedText?: string;
  narrationScript?: string;
  audioUrl?: string; // audio data url or synthesis reference
  sentences: SentenceSegment[];
  summary?: string;
}

export interface DocumentSummary {
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
  mainCharactersOrEntities: { name: string; role: string; description: string }[];
  keyQuotesOrTakeaways: string[];
  chapterBreakdown: { chapterNumber: number; title: string; summary: string }[];
}

export interface DocumentItem {
  id: string;
  title: string;
  author: string;
  originalLanguage: string;
  selectedLanguage: string;
  selectedVoice: VoiceId;
  coverColor: string;
  coverIcon: string;
  coverImage?: string;
  category: string;
  fileType: 'pdf' | 'docx' | 'epub' | 'txt' | 'md' | 'rtf' | 'html' | 'pasted';
  fileSize: number;
  totalDurationSeconds: number;
  currentProgressPercent: number;
  currentChapterId: string;
  currentAudioPositionSeconds: number;
  isFavorite: boolean;
  isDownloaded: boolean;
  downloadSizeMb?: number;
  processingStatus: ProcessingStatus;
  processingProgress: number;
  processingStageMessage: string;
  chapters: Chapter[];
  summary?: DocumentSummary;
  createdAt: string;
  lastPlayedAt: string | null;
  userNotes?: string;
}

export interface Bookmark {
  id: string;
  documentId: string;
  documentTitle: string;
  chapterId: string;
  chapterTitle: string;
  audioPositionSeconds: number;
  progressPercent: number;
  note: string;
  textSnippet: string;
  createdAt: string;
}

export interface ListeningHistoryItem {
  id: string;
  documentId: string;
  chapterId: string;
  progressPercent: number;
  lastListenedAt: string;
  durationListenedSeconds: number;
}

export interface DocumentQAMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedChapter?: string;
}

export interface UserSettings {
  preferredLanguage: string;
  defaultListeningLanguage: string;
  defaultVoiceId: VoiceId;
  preferredVoice?: VoiceId;
  defaultPlaybackSpeed: number;
  theme: 'light' | 'dark' | 'system';
  autoPlayNextChapter: boolean;
  highlightSpokenSentences?: boolean;
  offlineAutoDownload: boolean;
  readingMode: 'both' | 'audio_only' | 'text_only';
  textDisplayMode: 'translated' | 'original' | 'side_by_side';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  documentTitle: string;
  stage: ProcessingStatus;
  progress: number;
  currentChapter: number;
  totalChapters: number;
  message: string;
  error?: string;
  startedAt: string;
}
