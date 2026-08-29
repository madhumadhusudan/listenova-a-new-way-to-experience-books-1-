# Listenova — A New Way to Experience Books

> **Transform any book, PDF, or document into an immersive, human-like listening experience in your language of choice.**

---

## 🌟 Overview

**Listenova** is an AI-powered multilingual document-to-audiobook platform designed to make reading effortless, accessible, and conversational. Whether you are consuming lengthy research papers, technical documents, literary classics, or personal notes, Listenova segments chapters, translates across languages with cultural nuance, and streams natural speech synchronized with a real-time visual teleprompter.

---
## 🖼 Application Preview.
<img width="1359" height="589" alt="Screenshot 2026-08-26 004830" src="https://github.com/user-attachments/assets/5dd138c3-f470-40c9-bcf9-4b383627d430" />

## ✨ Key Features

### 🎧 Intelligent AI Speech & Gapless Audio
- **Ultra-crisp Audio Streaming**: Low-latency, gapless sentence narration with background chunk prefetching.
- **Multilingual Native Pronunciation**: Flawless support for regional Indian languages (Kannada, Tamil, Telugu, Malayalam, Hindi, Marathi, Bengali, etc.) and global languages (Spanish, French, German, Japanese, and English).
- **Customizable Speed & Dynamics**: Fine-grained playback rate controls (0.5x to 2.5x), sleep timers (15m, 30m, 45m, end-of-chapter), and volume modulation.

### 🌐 Instant Multilingual Translation
- **Context-Aware Translation**: Automatically translates uploaded literature and textbooks while preserving literary tone, technical terminology, and paragraph rhythm.
- **Side-by-Side Synchronized Reading**: Seamlessly switch between the original text and your preferred translation language on the fly.

### 📄 Universal Document & PDF Parser
- **Versatile File Ingestion**: Upload PDFs, plain text files (`.txt`), Markdown (`.md`), or paste raw text.
- **Smart Chapter Segmentation**: AI automatically detects chapter boundaries, section headers, and reading durations.
- **Preloaded Literary Library**: Instant access to curated classics and works in Kannada, English, Hindi, and more.

### 💡 AI Document Assistant & Summarizer
- **In-Depth Document Q&A**: Ask any question about your active document and get grounded answers cited directly from the text.
- **Structured Executive Summaries**: Instant bullet points, key character breakdowns, thematic insights, and core takeaways.
- **Narration Cleaner**: Automatically removes messy line breaks, citation brackets `[1]`, and OCR artifacts before speaking.

### 📱 Reader-Centric Visual Interface
- **Sentence-by-Sentence Highlighting**: Interactive karaoke-style teleprompter highlights the exact sentence currently being narrated.
- **Interactive Scrubber & Paragraph Seeking**: Tap on any paragraph or sentence to jump playback instantly.
- **Personal Bookmarks & History**: Save your favorite timestamps and pick up reading right where you left off.
- **Dark / Light Theme**: Comfortable typography paired with eye-friendly contrast in both light and dark modes.

---

## 🚀 Getting Started & How to Use

### 1. Choosing or Uploading a Book
- **Curated Classics**: Browse the home library to pick featured works (e.g., *Vachana Sahitya*, *Meditations*, *The Art of War*, *Clean Code Insights*).
- **Upload Your Own**: Click the **Upload / New** button to drag and drop your PDF or text document. Listenova will automatically analyze and structure the chapters.

### 2. Selecting Language & Voice
- Use the **Language Selector** in the player or upload modal to choose your target language (e.g., **Kannada - ಕನ್ನಡ**, **Hindi - हिन्दी**, **English**, etc.).
- Click the **Voice Profile** to test voice samples and choose your favorite narrator tone.

### 3. Listening & Reading
- Press **Play** to start listening. 
- Follow along with the **Karaoke Teleprompter** highlighting the active sentence.
- Click any sentence to jump the audio directly to that exact line.
- Adjust playback speed (0.75x, 1x, 1.25x, 1.5x, 2x) or set a **Sleep Timer**.

### 4. Exploring Summaries & Asking Questions
- Click **Summary** in the player to view core takeaways and chapter breakdowns.
- Click **Ask Assistant** to converse directly with your book, ask for explanations, or clarify complex sections.

---

## 🌍 Supported Languages

| Language | Native Script | Audio Support | Translation |
| :--- | :--- | :---: | :---: |
| **Kannada** | ಕನ್ನಡ | ✅ Native Audio | ✅ Full AI |
| **Hindi** | हिन्दी | ✅ Native Audio | ✅ Full AI |
| **Tamil** | தமிழ் | ✅ Native Audio | ✅ Full AI |
| **Telugu** | తెలుగు | ✅ Native Audio | ✅ Full AI |
| **Malayalam** | മലയാളം | ✅ Native Audio | ✅ Full AI |
| **Marathi** | मराठी | ✅ Native Audio | ✅ Full AI |
| **Bengali** | বাংলা | ✅ Native Audio | ✅ Full AI |
| **English** | English | ✅ Studio Voice | ✅ Full AI |
| **Spanish** | Español | ✅ Native Audio | ✅ Full AI |
| **French** | Français | ✅ Native Audio | ✅ Full AI |
| **German** | Deutsch | ✅ Native Audio | ✅ Full AI |
| **Japanese** | 日本語 | ✅ Native Audio | ✅ Full AI |

---

## 🛠️ Architecture & Technical Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    Listenova Frontend                       │
│  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Listenova Backend                        │
│                   Express.js + Node.js                      │
├──────────────────────────────┼──────────────────────────────┤
│  ⚡ /api/tts                 │ Multi-chunk Audio Streamer   │
│  ⚡ /api/gemini/analyze      │ Intelligent Chapter Segmenter│
│  ⚡ /api/gemini/translate    │ Nuanced Literary Translator  │
│  ⚡ /api/gemini/summary      │ Structured Document Insights │
│  ⚡ /api/gemini/ask          │ Document-grounded Q&A        │
└──────────────────────────────┴──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Gemini Multi-Model Cascade                   │
│   Gemini 3.1 Flash Lite ➔ Gemini 3.6 Flash ➔ Gemini 3.7     │
└─────────────────────────────────────────────────────────────┘
```

- **Resilient AI Cascade**: Automatic fallback routing prevents rate-limit stalls and quota disruptions.
- **In-Memory LRU Caching**: Accelerates repeated translation requests and prevents redundant API usage.
- **Fail-Safe Heuristic Engine**: Rule-based text segmentation and semantic fallbacks guarantee uninterrupted operation.

---

## 📄 License

Built for avid readers, learners, and listeners everywhere.
