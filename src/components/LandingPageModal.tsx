import React from 'react';
import {
  Headphones,
  UploadCloud,
  Globe,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPageModal: React.FC = () => {
  const { setCurrentView, setIsUploadModalOpen, setActiveDocumentById } = useApp();

  return (
    <div id="landing-guide-view" className="space-y-12 pb-24 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Multilingual AI Audiobook Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Turn Any Book Into Something You Can{' '}
          <span className="text-amber-600 dark:text-amber-500 underline decoration-amber-500/40 decoration-4">
            Listen To
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          For people who love reading but don't have enough time to sit and read. Upload any document, select your preferred language and voice, and immerse yourself in natural audio storytelling.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            id="landing-upload-cta"
            onClick={() => setIsUploadModalOpen(true)}
            className="py-3.5 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-amber-600/30 active:scale-95 transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Document</span>
          </button>

          <button
            id="landing-explore-sample-cta"
            onClick={() => {
              setActiveDocumentById('doc-kannada-heritage', true);
              setCurrentView('player');
            }}
            className="py-3.5 px-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-current text-amber-600" />
            <span>Listen to Kannada Sample</span>
          </button>
        </div>
      </div>

      {/* 6 Key Pillars Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Universal Format Support
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Upload PDFs, DOCX, EPUB, TXT, RTF, Markdown, or HTML. Automatically strips headers, page numbers, and boilerplate text for seamless narration.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Multilingual Native Cadence
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            First-class support for English, Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Telugu (తెలుగు), Malayalam (മലയാളം), Hindi, and international languages.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Human-Like AI Voices
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Choose from warm, narrative, expressive, deep baritone, or clear professional voice profiles with realistic pacing and breathing pauses.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Synchronized Reading Mode
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Follow along with glowing sentence-level highlights. Select any passage on screen to immediately trigger audio synthesis of that section.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            AI Summaries & Document Q&A
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Get structured chapter takeaways, executive overviews, key quote extractions, and interactive conversational Q&A grounded in document text.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            100% Private & Offline Ready
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your personal library remains strictly private without public sharing links. Download audiobooks to your local device for offline listening.
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => setCurrentView('home')}
          className="py-3 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>Go to Home Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
