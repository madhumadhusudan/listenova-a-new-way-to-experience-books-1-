import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Volume2,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  Cpu,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, VOICE_PROFILES } from '../data/languagesAndVoices';
import { resetToSampleDocuments } from '../utils/storage';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    isDarkMode,
    toggleDarkMode,
    setCurrentView,
  } = useApp();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetData = () => {
    resetToSampleDocuments();
    window.location.reload();
  };

  return (
    <div id="settings-view-container" className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configure multilingual voice synthesis, playback preferences, and reading themes.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Voice & Language Defaults */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Voice & Language Defaults</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                Default Target Language
              </label>
              <select
                value={settings.preferredLanguage}
                onChange={(e) => updateSettings({ preferredLanguage: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white font-medium outline-none focus:border-amber-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                Default Voice Model
              </label>
              <select
                value={settings.preferredVoice}
                onChange={(e) => updateSettings({ preferredVoice: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white font-medium outline-none focus:border-amber-500"
              >
                {VOICE_PROFILES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}, {v.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Playback Behavior */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Playback & Automation</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Autoplay Next Chapter
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Seamlessly progress to the next chapter when the current audio concludes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlayNextChapter}
                onChange={(e) => updateSettings({ autoPlayNextChapter: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Synchronized Highlight Pulse
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Highlight sentences dynamically in real-time as words are spoken.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.highlightSpokenSentences}
                onChange={(e) => updateSettings({ highlightSpokenSentences: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  App Appearance
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Switch between warm light theme and deep dark night reading mode.
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 text-xs font-semibold"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. AI & Privacy Architecture Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>AI Architecture & Privacy</span>
          </h3>

          <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Private Personal Library:
                </span>{' '}
                Your uploaded documents are processed privately for your personal listening experience. No public sharing links exist.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <Cpu className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 dark:text-amber-200">
                  Server-Side Gemini AI Pipeline:
                </span>{' '}
                All document analysis, translation, and summary generation is securely orchestrated via backend API proxy routes.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Reset Data & Library */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/40 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Reset Library & Samples
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Restore default multilingual sample audiobooks and clear custom uploaded documents.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors shrink-0"
          >
            Reset Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsResetConfirmOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400">
              Reset All Library Data?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              This will restore the default sample documents and clear custom uploads, bookmarks, and listening history.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
