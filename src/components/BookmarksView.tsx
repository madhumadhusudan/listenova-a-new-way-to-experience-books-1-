import React, { useState } from 'react';
import { Bookmark as BookmarkIcon, Play, Trash2, Edit2, Clock, BookOpen, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bookmark } from '../types';

export const BookmarksView: React.FC = () => {
  const { bookmarks, jumpToBookmark, deleteBookmark, editBookmark, setCurrentView } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditNote(bm.note || '');
  };

  const handleSaveEdit = (id: string) => {
    editBookmark(id, editNote);
    setEditingId(null);
  };

  return (
    <div id="bookmarks-view-container" className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <BookmarkIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Saved Bookmarks ({bookmarks.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Jump back into exact timestamps, favorite quotes, and key chapters.
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <BookmarkIcon className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
            No bookmarks saved yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            While listening to an audiobook, click the bookmark icon to save moments with custom notes.
          </p>
          <button
            onClick={() => setCurrentView('library')}
            className="py-2.5 px-5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20"
          >
            Go to Library
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-amber-500/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(bm.audioPositionSeconds)}</span>
                    <span>•</span>
                    <span className="truncate">{bm.chapterTitle}</span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 dark:text-white truncate mt-0.5">
                    {bm.documentTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleStartEdit(bm)}
                    className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Edit Note"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteBookmark(bm.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => jumpToBookmark(bm)}
                    className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Jump In</span>
                  </button>
                </div>
              </div>

              {/* Note or Edit Input */}
              {editingId === bm.id ? (
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Bookmark note..."
                    className="flex-1 p-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleSaveEdit(bm.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-xl text-xs text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                bm.note && (
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-700 dark:text-neutral-300 italic">
                    "{bm.note}"
                  </div>
                )
              )}

              {bm.textSnippet && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 pl-2 border-l-2 border-amber-500/40">
                  {bm.textSnippet}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
