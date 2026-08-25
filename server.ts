import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const pdfParseLib = require('pdf-parse');
const PDFParse = pdfParseLib.PDFParse || pdfParseLib;

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Using smart fallback processing.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// High-Quality Multilingual TTS Proxy Endpoint for Kannada & all languages
const handleTTS = async (req: express.Request, res: express.Response) => {
  try {
    const text = ((req.method === 'POST' ? req.body.text : req.query.text) as string || '').trim();
    const lang = ((req.method === 'POST' ? req.body.lang : req.query.lang) as string || 'en').trim();
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const langCode = lang.split('-')[0].toLowerCase();
    
    // Split long text into <= 170 char chunks on sentence or word boundaries
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= 170) {
        chunks.push(remaining);
        break;
      }
      let splitIdx = remaining.lastIndexOf(' ', 170);
      if (splitIdx === -1 || splitIdx < 40) {
        splitIdx = 170;
      }
      chunks.push(remaining.slice(0, splitIdx).trim());
      remaining = remaining.slice(splitIdx).trim();
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      if (!chunk) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(langCode)}&client=tw-ob`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });
      if (response.ok) {
        const ab = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(ab));
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const combinedAudio = Buffer.concat(audioBuffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', combinedAudio.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Accept-Ranges', 'bytes');
    return res.send(combinedAudio);
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize speech' });
  }
};

app.get('/api/tts', handleTTS);
app.post('/api/tts', handleTTS);

// PDF Parsing & Text Extraction Endpoint
app.post('/api/parse-pdf', async (req, res) => {
  try {
    const { pdfBase64, fileName } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'pdfBase64 is required' });
    }

    const buffer = Buffer.from(pdfBase64, 'base64');
    let extractedText = '';
    let numPages = 1;
    let infoTitle = '';
    let infoAuthor = '';

    try {
      if (typeof PDFParse === 'function' && PDFParse.prototype && PDFParse.prototype.getText) {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        extractedText = (textResult?.text || '').trim();
        numPages = textResult?.total || 1;
        try {
          const infoResult = await parser.getInfo();
          if (infoResult?.info) {
            infoTitle = infoResult.info.Title || '';
            infoAuthor = infoResult.info.Author || '';
          }
        } catch (_) {}
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      } else if (typeof PDFParse === 'function') {
        const data = await PDFParse(buffer);
        extractedText = (data.text || '').trim();
        numPages = data.numpages || 1;
        if (data.info) {
          infoTitle = data.info.Title || '';
          infoAuthor = data.info.Author || '';
        }
      }
    } catch (parseErr) {
      console.warn('pdf-parse native extraction warning:', parseErr);
    }

    // If PDF is scanned or extractedText is negligible, use Gemini multimodal PDF reader
    const ai = getAI();
    if ((!extractedText || extractedText.length < 50) && ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              text: 'Extract and transcribe all the text, headings, and paragraphs from this document accurately in full. Do not summarize; extract the complete readable content.',
            },
          ],
        });
        if (response.text && response.text.trim().length > 0) {
          extractedText = response.text.trim();
        }
      } catch (geminiErr) {
        console.warn('Gemini PDF multimodal fallback error:', geminiErr);
      }
    }

    if (!extractedText || extractedText.length === 0) {
      return res.status(422).json({
        error: 'Unable to extract text from PDF. The file may be empty, image-only without OCR, or password protected.',
      });
    }

    const baseTitle = fileName
      ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      : infoTitle || 'PDF Document';

    res.json({
      text: extractedText,
      suggestedTitle: infoTitle && infoTitle.length > 2 ? infoTitle : baseTitle,
      suggestedAuthor: infoAuthor || '',
      numPages,
    });
  } catch (error: any) {
    console.error('Error in /api/parse-pdf:', error);
    res.status(500).json({ error: error.message || 'PDF parsing failed' });
  }
});

// Multi-Model Fallback Cascade to prevent 429 Quota Exceeded errors
const AVAILABLE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

// In-memory cache for API requests to avoid redundant calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
function getCachedResponse(key: string): any | null {
  const item = responseCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > 1000 * 60 * 60 * 12) {
    responseCache.delete(key);
    return null;
  }
  return item.data;
}

function setCachedResponse(key: string, data: any) {
  if (responseCache.size > 500) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

async function generateContentWithCascade(params: {
  contents: any;
  config?: any;
  cacheKey?: string;
}): Promise<any> {
  if (params.cacheKey) {
    const cached = getCachedResponse(params.cacheKey);
    if (cached) return cached;
  }

  const ai = getAI();
  if (!ai) throw new Error('AI client not initialized');

  let lastError: any = null;
  for (const model of AVAILABLE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (params.cacheKey) {
        setCachedResponse(params.cacheKey, response);
      }
      return response;
    } catch (err: any) {
      lastError = err;
      const isQuotaOrRate =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.message?.includes('429') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');
      console.warn(`Model ${model} encounter: ${err?.message || err}. Quota/Rate limit: ${isQuotaOrRate}`);
      // Continue to next model in cascade
    }
  }

  throw lastError || new Error('All fallback models exhausted');
}

// 1. Analyze Document & Segment Chapters
app.post('/api/gemini/analyze-document', async (req, res) => {
  const { rawText, fileName, fileType } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ error: 'rawText is required' });
  }

  // Helper for high-quality rule-based segmentation fallback
  const fallbackSegmentation = () => {
    const approxTitle = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Uploaded Document';
    const paragraphs = rawText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);
    const chunkSize = Math.max(1, Math.ceil(paragraphs.length / 3));
    const chapters = [];
    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const chNumber = Math.floor(i / chunkSize) + 1;
      const chText = paragraphs.slice(i, i + chunkSize).join('\n\n');
      chapters.push({
        chapterNumber: chNumber,
        title: `Chapter ${chNumber}: Section ${chNumber}`,
        originalText: chText,
        durationSeconds: Math.max(30, Math.round((chText.split(/\s+/).length / 130) * 60)),
      });
    }

    return {
      title: approxTitle,
      author: 'Unknown Author',
      detectedLanguage: 'en',
      category: 'General Reading',
      chapters: chapters.length > 0 ? chapters : [{ chapterNumber: 1, title: 'Chapter 1', originalText: rawText, durationSeconds: 60 }],
    };
  };

  const ai = getAI();
  if (!ai) {
    return res.json(fallbackSegmentation());
  }

  try {
    const prompt = `You are ListenAI's document analysis and intelligent audiobook preprocessor.
Analyze the following document text from file "${fileName || 'document'}" (${fileType || 'text'}).

Tasks:
1. Identify the most accurate book/document title and author name.
2. Detect the primary original language (ISO 2-letter code e.g. en, kn, ta, te, ml, hi, mr, bn, es, fr, etc.).
3. Determine the literary/thematic category (e.g. Philosophy, Literature, Science & Tech, Business, Self-Help, Research Paper, Notes, History).
4. Divide the document logically into coherent chapters or sections (1 to 6 chapters based on length). Clean up noise like raw page headers, page numbers, duplicate artifacts.
5. Provide a short title for each chapter and its cleaned text.

Document content excerpt:
${rawText.slice(0, 30000)}
`;

    const cacheKey = `analyze_${fileName || 'doc'}_${rawText.slice(0, 200).length}`;
    const response = await generateContentWithCascade({
      contents: prompt,
      cacheKey,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Book or document title' },
            author: { type: Type.STRING, description: 'Author or entity name' },
            detectedLanguage: { type: Type.STRING, description: '2-letter language code like en, kn, ta, te, ml, hi' },
            category: { type: Type.STRING, description: 'Content category' },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  durationSeconds: { type: Type.INTEGER },
                },
                required: ['chapterNumber', 'title', 'originalText'],
              },
            },
          },
          required: ['title', 'author', 'detectedLanguage', 'category', 'chapters'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.title && Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
      return res.json(parsed);
    }
    return res.json(fallbackSegmentation());
  } catch (error: any) {
    console.warn('Document analysis AI cascade fallback triggered:', error?.message || error);
    return res.json(fallbackSegmentation());
  }
});

// 2. Contextual Translation
app.post('/api/gemini/translate-chapter', async (req, res) => {
  const { text, targetLanguage, sourceLanguage, bookContext } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'text and targetLanguage are required' });
  }

  if (targetLanguage === sourceLanguage) {
    return res.json({ translatedText: text });
  }

  const LANGUAGE_NAMES: Record<string, string> = {
    kn: 'Kannada (ಕನ್ನಡ)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    ml: 'Malayalam (മലയാളം)',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    gu: 'Gujarati (ગુજરાતી)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    ja: 'Japanese (日本語)',
    en: 'English',
  };

  const targetLangName = LANGUAGE_NAMES[targetLanguage.toLowerCase()] || targetLanguage;
  const sourceLangName = LANGUAGE_NAMES[(sourceLanguage || 'en').toLowerCase()] || sourceLanguage || 'English';

  const ai = getAI();
  if (!ai) {
    return res.json({ translatedText: text });
  }

  try {
    const prompt = `You are ListenAI's context-aware literary and document translator.
Translate the following text accurately from ${sourceLangName} into ${targetLangName}.

Translation Requirements:
1. Translate the entire text cleanly and naturally into the target language's authentic native script (for example, for Kannada use Kannada script ಕನ್ನಡ, for Hindi use Devanagari हिन्दी, for Tamil use Tamil script தமிழ்).
2. Maintain natural audiobook storytelling cadence, paragraph structure, and appropriate punctuation so text-to-speech engines can speak it fluidly.
3. Translate concepts and idioms culturally and contextually while preserving proper names.
4. Output ONLY the translated text. Do not add conversational intros, explanatory notes, markdown titles, or quotation marks.

Book context: ${bookContext || 'General document'}

Text to translate:
${text.slice(0, 15000)}
`;

    const cacheKey = `trans_${targetLanguage}_${sourceLanguage}_${text.slice(0, 120)}`;
    const response = await generateContentWithCascade({
      contents: prompt,
      cacheKey,
      config: {
        systemInstruction: 'You are an expert multilingual audiobook translator. Output ONLY the direct translated text in authentic native script.',
        temperature: 0.25,
      },
    });

    const translatedText = (response.text || text).trim();
    return res.json({ translatedText });
  } catch (error: any) {
    console.warn('Chapter translation fallback triggered:', error?.message || error);
    return res.json({ translatedText: text });
  }
});

// 3. Generate Structured Summary
app.post('/api/gemini/generate-summary', async (req, res) => {
  const { documentTitle, author, fullText } = req.body;
  if (!fullText) {
    return res.status(400).json({ error: 'fullText is required' });
  }

  const fallbackSummary = () => {
    const paragraphs = fullText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 30);
    const firstPara = paragraphs[0] || `An overview of ${documentTitle || 'this document'}.`;
    const secondPara = paragraphs[1] || 'Explores essential insights, principles, and key narratives.';
    return {
      shortSummary: firstPara.length > 200 ? firstPara.slice(0, 197) + '...' : firstPara,
      detailedSummary: `${firstPara}\n\n${secondPara}\n\nThis structured reading provides foundational perspectives on the subject matter, offering practical takeaways for reflective listening.`,
      keyPoints: [
        'Core conceptual framework and foundational thesis.',
        'Exploration of key context, themes, and narrative flow.',
        'Practical takeaways and insights for listeners.',
      ],
      mainCharactersOrEntities: [
        { name: author || 'Author', role: 'Primary Voice', description: 'Central author and speaker of the work.' },
      ],
      keyQuotesOrTakeaways: [
        'Knowledge deepens through mindful reflection and listening.',
      ],
      chapterBreakdown: [
        { chapterNumber: 1, title: 'Primary Content', summary: 'Foundational arguments and narrative themes.' },
      ],
    };
  };

  const ai = getAI();
  if (!ai) {
    return res.json(fallbackSummary());
  }

  try {
    const prompt = `You are ListenAI's document comprehension and summarization engine.
Generate a structured, insightful summary of the document titled "${documentTitle || 'Untitled'}" by "${author || 'Unknown'}".

Document Text:
${fullText.slice(0, 25000)}
`;

    const cacheKey = `summary_${documentTitle || 'doc'}_${fullText.slice(0, 150)}`;
    const response = await generateContentWithCascade({
      contents: prompt,
      cacheKey,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortSummary: { type: Type.STRING, description: '1-2 sentence executive overview' },
            detailedSummary: { type: Type.STRING, description: 'Comprehensive multi-paragraph synthesis' },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 6 major bullet points',
            },
            mainCharactersOrEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'role', 'description'],
              },
            },
            keyQuotesOrTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            chapterBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: ['chapterNumber', 'title', 'summary'],
              },
            },
          },
          required: ['shortSummary', 'detailedSummary', 'keyPoints', 'mainCharactersOrEntities', 'keyQuotesOrTakeaways', 'chapterBreakdown'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.shortSummary) {
      return res.json(parsed);
    }
    return res.json(fallbackSummary());
  } catch (error: any) {
    console.warn('Summary generation AI cascade fallback triggered:', error?.message || error);
    return res.json(fallbackSummary());
  }
});

// 4. Interactive Document Q&A Assistant
app.post('/api/gemini/ask-document', async (req, res) => {
  const { question, documentTitle, documentText, history } = req.body;
  if (!question || !documentText) {
    return res.status(400).json({ error: 'question and documentText are required' });
  }

  const fallbackAnswer = () => {
    const qLower = question.toLowerCase();
    const sentences = documentText.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    const matched = sentences.filter((s: string) => {
      const sLower = s.toLowerCase();
      const words = qLower.split(/\s+/).filter((w: string) => w.length > 3);
      return words.some((w: string) => sLower.includes(w));
    });

    if (matched.length > 0) {
      return `Based on "${documentTitle || 'the document'}", here is relevant context: "${matched.slice(0, 2).join('. ').trim()}."`;
    }
    return `In "${documentTitle || 'this document'}", the text discusses central concepts related to "${question}". Refer to the audio playback and chapters for the full narrative.`;
  };

  const ai = getAI();
  if (!ai) {
    return res.json({ answer: fallbackAnswer() });
  }

  try {
    const conversationContext = Array.isArray(history)
      ? history.map((m: any) => `${m.sender === 'user' ? 'User' : 'ListenAI Assistant'}: ${m.content}`).join('\n')
      : '';

    const prompt = `You are ListenAI's intelligent document companion.
Answer the user's question strictly based on the provided document content for "${documentTitle || 'Document'}".
If the information is not present in the document, clearly and politely indicate that it is not covered in the text.
Provide concise, clear, and helpful explanations with references to relevant sections or chapters where applicable.

Conversation History:
${conversationContext}

User Question: ${question}

Document Content:
${documentText.slice(0, 25000)}
`;

    const response = await generateContentWithCascade({
      contents: prompt,
      config: {
        systemInstruction: 'You are an intelligent, articulate literary and document companion. Ground all factual assertions in the text.',
        temperature: 0.2,
      },
    });

    return res.json({
      answer: response.text || fallbackAnswer(),
    });
  } catch (error: any) {
    console.warn('Ask document AI cascade fallback triggered:', error?.message || error);
    return res.json({ answer: fallbackAnswer() });
  }
});

// 5. Clean Narration & Speech Prosody
app.post('/api/gemini/clean-narration', async (req, res) => {
  const { text, mode, language } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  const fallbackClean = () => {
    return text
      .replace(/\[\d+\]/g, '')
      .replace(/•|\*|#|-{2,}|_{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const ai = getAI();
  if (!ai) {
    return res.json({ cleanedText: fallbackClean() });
  }

  try {
    const prompt = `Normalize and refine the following text for natural audiobook text-to-speech reading in mode "${mode || 'full'}" (Language: ${language || 'en'}).
Tasks:
1. Fix awkward line breaks and hyphenated words across lines.
2. Expand abbreviations where appropriate for clear spoken voice.
3. Add appropriate natural commas and periods to guide audio pause rhythm.
4. Remove citation numbers [1], [2], footnote asterisks, and repetitive metadata.

Original Text:
${text.slice(0, 8000)}
`;

    const cacheKey = `clean_${language}_${text.slice(0, 100)}`;
    const response = await generateContentWithCascade({
      contents: prompt,
      cacheKey,
      config: {
        temperature: 0.2,
      },
    });

    return res.json({ cleanedText: response.text || fallbackClean() });
  } catch (error: any) {
    return res.json({ cleanedText: fallbackClean() });
  }
});

// 6. Gemini Neural Speech Generation (Text-to-Speech)
app.post('/api/gemini/generate-speech', async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    const ai = getAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini AI not configured' });
    }

    const validVoice = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text.slice(0, 2000) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    res.json({ audioData: base64Audio });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-speech:', error);
    res.status(500).json({ error: error.message || 'Speech generation failed' });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ListenAI Server running on http://localhost:${PORT}`);
  });
}

startServer();
