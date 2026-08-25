import React, { useState } from 'react';
import { X, Sparkles, Headphones, BookOpen, Quote, CheckCircle, Layers } from 'lucide-react';
import { DocumentItem } from '../types';
import { useApp } from '../context/AppContext';

interface DocumentSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem;
}

export const DocumentSummaryDrawer: React.FC<DocumentSummaryDrawerProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { playSelectedSnippet } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'points' | 'characters' | 'chapters'>('overview');

  if (!isOpen || !document) return null;

  const summary = document.summary || {
    shortSummary: `Executive summary of ${document.title} by ${document.author}.`,
    detailedSummary: `This book explores key concepts in ${document.category}, detailing core themes, arguments, and practical applications.`,
    keyPoints: [
      'Comprehensive exploration of the foundational thesis.',
      'Analysis of strategic perspectives and real-world implications.',
      'Actionable principles for thoughtful decision making.',
    ],
    mainCharactersOrEntities: [
      { name: document.author, role: 'Author / Subject', description: 'Central voice and investigator.' },
    ],
    keyQuotesOrTakeaways: ['Knowledge combined with deliberate action yields mastery.'],
    chapterBreakdown: document.chapters.map((c) => ({
      chapterNumber: c.chapterNumber,
      title: c.title,
      summary: `Explores section ${c.chapterNumber} with deep thematic grounding.`,
    })),
  };

  const handleListenToSummary = () => {
    const text = `${summary.shortSummary}. ${summary.detailedSummary}. Key takeaways include: ${summary.keyPoints.join('. ')}`;
    playSelectedSnippet(text);
  };

  return (
    <div
      id="summary-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="summary-drawer-content"
        className="bg-white dark:bg-neutral-900 w-full max-w-xl h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 p-6 flex flex-col space-y-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white">
                AI Document Summary
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                {document.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleListenToSummary}
              className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Listen to this summary in AI voice"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'points', label: 'Key Points' },
            { id: 'characters', label: 'Entities' },
            { id: 'chapters', label: 'Chapters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
                  Executive Takeaway
                </h4>
                <p className="leading-relaxed text-amber-950 dark:text-amber-100 text-sm font-medium">
                  {summary.shortSummary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                  Detailed Narrative
                </h4>
                <p className="leading-relaxed whitespace-pre-line text-neutral-800 dark:text-neutral-200">
                  {summary.detailedSummary}
                </p>
              </div>

              {summary.keyQuotesOrTakeaways && summary.keyQuotesOrTakeaways.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-600" />
                    <span>Memorable Quotes & Principles</span>
                  </h4>
                  {summary.keyQuotesOrTakeaways.map((q, i) => (
                    <blockquote
                      key={i}
                      className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border-l-3 border-amber-500 text-xs italic"
                    >
                      "{q}"
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                Core Insights ({summary.keyPoints?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {summary.keyPoints?.map((pt, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                Key Entities, Authors & Figures
              </h4>
              <div className="space-y-2">
                {summary.mainCharactersOrEntities?.map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {item.name}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-semibold">
                        {item.role}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                Chapter-by-Chapter Takeaways
              </h4>
              <div className="space-y-2.5">
                {summary.chapterBreakdown?.map((ch, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">
                        {ch.chapterNumber}
                      </span>
                      <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {ch.title}
                      </h5>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 pl-7">
                      {ch.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
