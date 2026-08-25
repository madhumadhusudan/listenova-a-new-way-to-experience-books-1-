import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Heart,
  Download,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languagesAndVoices';

export const LibraryView: React.FC = () => {
  const {
    documents,
    activeDocument,
    isPlaying,
    setActiveDocumentById,
    setCurrentView,
    deleteDocument,
    toggleFavorite,
    toggleDownload,
    updateDocumentMetadata,
    searchQuery,
    setSearchQuery,
    setIsUploadModalOpen,
  } = useApp();

  const [filterMode, setFilterMode] = useState<
    'all' | 'in_progress' | 'completed' | 'favorites' | 'downloads' | 'kannada' | 'tamil' | 'telugu' | 'malayalam'
  >('all');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');

  // Edit metadata modal state
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Delete confirm dialog
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter((doc) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Filter mode
    if (filterMode === 'in_progress') return doc.currentProgressPercent > 0 && doc.currentProgressPercent < 100;
    if (filterMode === 'completed') return doc.currentProgressPercent >= 100;
    if (filterMode === 'favorites') return doc.isFavorite;
    if (filterMode === 'downloads') return doc.isDownloaded;
    if (filterMode === 'kannada') return doc.selectedLanguage === 'kn';
    if (filterMode === 'tamil') return doc.selectedLanguage === 'ta';
    if (filterMode === 'telugu') return doc.selectedLanguage === 'te';
    if (filterMode === 'malayalam') return doc.selectedLanguage === 'ml';

    return true;
  });

  const getLanguageLabel = (code: string) => {
    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return l ? `${l.flag} ${l.name.split(' ')[0]}` : code.toUpperCase();
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditAuthor(doc.author);
    setEditCategory(doc.category);
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;
    updateDocumentMetadata(editingDoc.id, {
      title: editTitle,
      author: editAuthor,
      category: editCategory,
    });
    setEditingDoc(null);
  };

  return (
    <div id="library-view-container" className="space-y-6 pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white">
            My Audio Library
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {documents.length} books and documents transformed into speech
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-1.5 rounded-lg ${
                viewStyle === 'grid'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`p-1.5 rounded-lg ${
                viewStyle === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'downloads', label: 'Downloaded' },
          { id: 'completed', label: 'Completed' },
          { id: 'kannada', label: 'ಕನ್ನಡ Kannada' },
          { id: 'tamil', label: 'தமிழ் Tamil' },
          { id: 'telugu', label: 'తెలుగు Telugu' },
          { id: 'malayalam', label: 'മലയാളം Malayalam' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              filterMode === tab.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
            No matching audiobooks found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query or upload a new PDF, DOCX, or book document.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="py-2.5 px-5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20"
          >
            Upload Document
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewStyle === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const isDocActive = activeDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                id={`lib-grid-card-${doc.id}`}
                onClick={() => {
                  setActiveDocumentById(doc.id, false);
                  setCurrentView('player');
                }}
                className="group bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover Top */}
                  <div
                    className={`w-full h-40 rounded-xl bg-gradient-to-br ${
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

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>{doc.currentProgressPercent}% listened</span>
                    <span>{Math.round(doc.totalDurationSeconds / 60)} min</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${doc.currentProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(doc);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Edit metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocToDelete(doc);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocumentById(doc.id, true);
                      setCurrentView('player');
                    }}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-400 transition-all"
                  >
                    {isDocActive && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewStyle === 'list' && (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const isDocActive = activeDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                id={`lib-list-row-${doc.id}`}
                onClick={() => {
                  setActiveDocumentById(doc.id, false);
                  setCurrentView('player');
                }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-14 rounded-xl bg-gradient-to-br ${
                      doc.coverColor || 'from-amber-700 to-stone-900'
                    } flex items-center justify-center text-white shrink-0 shadow-xs`}
                  >
                    <BookOpen className="w-5 h-5 text-amber-200" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {getLanguageLabel(doc.selectedLanguage)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {doc.author} • {doc.category} • {Math.round(doc.totalDurationSeconds / 60)} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(doc.id);
                    }}
                    className="p-2 text-neutral-400 hover:text-rose-500"
                  >
                    <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(doc);
                    }}
                    className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocToDelete(doc);
                    }}
                    className="p-2 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocumentById(doc.id, true);
                      setCurrentView('player');
                    }}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all ml-1 shadow-xs"
                  >
                    {isDocActive && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingDoc(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              Edit Book Information
            </h3>

            <div className="space-y-3 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block mb-1">Author</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block mb-1">Category / Tag</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDocToDelete(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400">
              Delete Document?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to remove <span className="font-bold">"{docToDelete.title}"</span> from your library? This will delete saved bookmarks and progress.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Keep Book
              </button>
              <button
                onClick={() => {
                  deleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
