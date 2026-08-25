import { INITIAL_SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { Bookmark, DocumentItem, ListeningHistoryItem, UserSettings } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'listenai_documents_v1',
  BOOKMARKS: 'listenai_bookmarks_v1',
  HISTORY: 'listenai_history_v1',
  SETTINGS: 'listenai_settings_v1',
  DOWNLOADS: 'listenai_downloads_v1',
  ACTIVE_DOC_ID: 'listenai_active_doc_id',
  USER_PROFILE: 'listenai_user_profile',
};

export const DEFAULT_SETTINGS: UserSettings = {
  preferredLanguage: 'en',
  defaultListeningLanguage: 'en',
  defaultVoiceId: 'kore',
  defaultPlaybackSpeed: 1.0,
  theme: 'light',
  autoPlayNextChapter: true,
  offlineAutoDownload: false,
  readingMode: 'both',
  textDisplayMode: 'translated',
  fontSize: 'md',
};

export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      saveStoredDocuments(INITIAL_SAMPLE_DOCUMENTS);
      return INITIAL_SAMPLE_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_DOCUMENTS;
  } catch (e) {
    console.error('Failed to parse stored documents:', e);
    return INITIAL_SAMPLE_DOCUMENTS;
  }
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to localStorage:', e);
  }
}

export function getStoredBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (e) {}
}

export function getStoredHistory(): ListeningHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredHistory(history: ListeningHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {}
}

export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export function getStoredActiveDocId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
}

export function setStoredActiveDocId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DOC_ID);
  }
}

export function getStoredUserProfile(): { name: string; email: string; avatarUrl?: string } {
  if (typeof window === 'undefined') return { name: 'Book Lover', email: 'reader@listenai.app' };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : { name: 'Book Lover', email: 'reader@listenai.app' };
  } catch (e) {
    return { name: 'Book Lover', email: 'reader@listenai.app' };
  }
}

export function saveStoredUserProfile(profile: { name: string; email: string }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

export function resetToSampleDocuments(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_SAMPLE_DOCUMENTS));
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DOC_ID);
  } catch (e) {
    console.error('Failed to reset storage:', e);
  }
}
