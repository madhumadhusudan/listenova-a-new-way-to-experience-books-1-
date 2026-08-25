import React, { useState } from 'react';
import { X, MessageSquare, Send, Sparkles, Headphones, Bot, User, Loader2 } from 'lucide-react';
import { DocumentItem } from '../types';
import { askDocumentAPI } from '../services/api';
import { useApp } from '../context/AppContext';

interface DocumentAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const DocumentAssistantDrawer: React.FC<DocumentAssistantDrawerProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { playSelectedSnippet } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      content: `Hello! I have thoroughly analyzed "${document?.title}". Ask me any question about its key arguments, chapters, concepts, or characters.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !document) return null;

  const suggestedQuestions = [
    'What are the core arguments of this book?',
    'Summarize Chapter 1 in simple terms.',
    'What are the practical applications or actions?',
    'What is the central thesis of the author?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const fullText = document.chapters.map((c) => c.originalText).join('\n\n');
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const answer = await askDocumentAPI(q, document.title, fullText, historyPayload);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'I had trouble analyzing that question against the document text. Please try asking in a different way.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="assistant-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="assistant-drawer-content"
        className="bg-white dark:bg-neutral-900 w-full max-w-xl h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white">
                Ask Document AI
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                Grounded in "{document.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-200/60 dark:border-neutral-700/50'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {m.sender === 'assistant' && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400">
                    <span>{m.timestamp}</span>
                    <button
                      onClick={() => playSelectedSnippet(m.content)}
                      className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-semibold"
                      title="Listen to this response"
                    >
                      <Headphones className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Analyzing document context...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="space-y-1.5 shrink-0 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Quick Questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="px-2.5 py-1 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about this document..."
            className="flex-1 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold transition-all shrink-0 shadow-md shadow-amber-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
