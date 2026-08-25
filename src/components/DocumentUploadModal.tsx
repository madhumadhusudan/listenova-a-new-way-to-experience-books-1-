import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UploadView } from './UploadView';

export const DocumentUploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen } = useApp();

  if (!isUploadModalOpen) return null;

  return (
    <div
      id="upload-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={() => setIsUploadModalOpen(false)}
    >
      <div
        id="upload-modal-content"
        className="bg-neutral-50 dark:bg-neutral-950 w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-upload-modal-btn"
          onClick={() => setIsUploadModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <UploadView onClose={() => setIsUploadModalOpen(false)} />
      </div>
    </div>
  );
};
