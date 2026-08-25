import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Volume2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Globe,
  Loader2,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, VOICE_PROFILES } from '../data/languagesAndVoices';
import { parseUploadedFile } from '../utils/fileParser';
import { VoiceId } from '../types';
import { audioEngine } from '../utils/audioEngine';

export const UploadView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { processNewDocument, setActiveDocumentById, setCurrentView } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('kore');
  const [previewingVoice, setPreviewingVoice] = useState<VoiceId | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExtensions = ['pdf', 'docx', 'doc', 'epub', 'txt', 'rtf', 'md', 'html', 'htm'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload a PDF, DOCX, EPUB, TXT, RTF, or Markdown file.`);
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleVoicePreview = (voiceId: VoiceId) => {
    setPreviewingVoice(voiceId);
    audioEngine.previewVoice(voiceId, targetLanguage);
    setTimeout(() => {
      setPreviewingVoice(null);
    }, 3000);
  };

  const handleStartProcessing = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProcessingProgress(15);
      setProcessingStage('Analyzing file and extracting document text...');

      let text = '';
      let fileName = 'Pasted Text Document';
      let fileType: any = 'txt';

      if (inputMode === 'file' && selectedFile) {
        fileName = selectedFile.name;
        setProcessingStage(`Parsing ${fileName}...`);
        const parsed = await parseUploadedFile(selectedFile);
        text = parsed.text;
        fileType = parsed.fileType;
      } else if (inputMode === 'text') {
        if (!pastedText.trim()) {
          throw new Error('Please enter or paste some text to convert.');
        }
        text = pastedText;
        fileName = 'Custom Text Document';
        fileType = 'pasted';
      } else {
        throw new Error('Please select a file or paste text first.');
      }

      setProcessingProgress(60);
      setProcessingStage('Generating audiobook chapters and starting playback...');

      const docId = await processNewDocument(text, fileName, fileType, targetLanguage, selectedVoice, true);

      setProcessingProgress(100);
      setIsProcessing(false);
      setCurrentView('player');
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to process document. Please try again.');
    }
  };

  const sampleExcerpts = [
    {
      title: 'Mindfulness & Neural Flow',
      text: 'The architecture of human attention is like a quiet garden. When we focus on a single stream of thought without judgment, cognitive load diminishes and creativity blossoms effortlessly.',
    },
    {
      title: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಮತ್ತು ಪರಿಸರ ಪ್ರಜ್ಞೆ',
      text: 'ನಿಸರ್ಗ ಮತ್ತು ಮಾನವ ಸಂಬಂಧವು ಅತ್ಯಂತ ಅವಿನಾಭಾವವಾದುದು. ಗಿಡ ಮರಗಳು ಮತ್ತು ಹರಿಯುವ ನದಿಗಳು ನಮಗೆ ಜೀವನದ ನೈಜ ಸೌಂದರ್ಯವನ್ನು ಮತ್ತು ತ್ಯಾಗ ಮನೋಭಾವವನ್ನು ಬೋಧಿಸುತ್ತವೆ.',
    },
    {
      title: 'தமிழ் கவிதை மற்றும் அறநெறி',
      text: 'நல்ல எண்ணங்களும் தூய உள்ளமும் கொண்ட மனிதனின் சொற்கள் மலர்களைப் போல மணம் வீசும். அன்பும் நேர்மையும் மனித வாழ்வின் உயர் விழுமியங்கள்.',
    },
  ];

  return (
    <div id="upload-view-container" className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/20 p-6 rounded-3xl border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Audiobook Studio</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white">
          Turn Your Book Into An Audiobook
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
          Upload books, research papers, journals, articles, or notes. Listen immediately in the original language or in a translated voice.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setInputMode('file')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            inputMode === 'file'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Upload Document File
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            inputMode === 'text'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Paste Text / Article Excerpt
        </button>
      </div>

      {/* Upload Drag & Drop Area */}
      {inputMode === 'file' ? (
        <div
          id="dropzone-area"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-amber-500 bg-amber-500/10'
              : selectedFile
              ? 'border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-950/20'
              : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-amber-500/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.epub,.txt,.rtf,.md,.html"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                selectedFile
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              } transition-transform active:scale-95`}
            >
              {selectedFile ? <CheckCircle className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            {selectedFile ? (
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for processing
                </p>
                <span className="inline-block mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold underline">
                  Click to select different file
                </span>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Drag & Drop your document here, or <span className="text-amber-600 dark:text-amber-400">browse</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Supports PDF, DOCX, EPUB, TXT, RTF, Markdown, and HTML up to 50MB
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Paste Text Area */
        <div className="space-y-3">
          <textarea
            id="paste-text-input"
            rows={7}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste book chapters, research abstracts, news articles, or study notes here..."
            className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:border-amber-500 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none transition-all"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Or try a sample excerpt:
            </span>
            {sampleExcerpts.map((sample, i) => (
              <button
                key={i}
                onClick={() => setPastedText(sample.text)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Grid: Language & Voice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800">
        {/* 1. Target Language */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Target Listening Language</span>
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Convert or translate into any selected language automatically
          </p>

          <select
            id="upload-language-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full mt-1 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-amber-500 cursor-pointer"
          >
            <optgroup label="Supported Indian Regional Languages">
              {SUPPORTED_LANGUAGES.filter((l) => l.isRegionalIndian).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </optgroup>
            <optgroup label="International Languages">
              {SUPPORTED_LANGUAGES.filter((l) => !l.isRegionalIndian).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 2. Voice Selection & Preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Voice Model & Tone</span>
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Natural voices calibrated with human-like breathing and pacing
          </p>

          <div className="grid grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
            {VOICE_PROFILES.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              const isPrev = previewingVoice === voice.id;
              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{voice.name}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {voice.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {voice.gender} • {voice.accent}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id);
                    }}
                    className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    title="Preview Voice Sample"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPrev ? 'animate-bounce text-amber-600' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          ⚡ Chapter 1 starts playing immediately while remainder processes in background.
        </div>

        <button
          id="start-conversion-btn"
          disabled={isProcessing || (inputMode === 'file' && !selectedFile) || (inputMode === 'text' && !pastedText.trim())}
          onClick={handleStartProcessing}
          className="py-3.5 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{processingStage || 'Processing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Convert & Listen Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      {/* Processing Animation Modal Banner */}
      {isProcessing && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 space-y-3 animate-fadeIn">
          <div className="flex justify-between text-xs font-semibold text-amber-950 dark:text-amber-200">
            <span>{processingStage}</span>
            <span className="font-mono">{processingProgress}%</span>
          </div>
          <div className="w-full bg-amber-200/50 dark:bg-amber-900/40 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-800 dark:text-amber-400">
            <span>✓ Text Extraction</span>
            <span>✓ Chapter Segmentation</span>
            <span>✓ Contextual Translation</span>
            <span>✓ AI Voice Prosody</span>
          </div>
        </div>
      )}
    </div>
  );
};
