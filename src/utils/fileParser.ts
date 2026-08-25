import mammoth from 'mammoth';

export interface ParsedDocumentResult {
  text: string;
  suggestedTitle: string;
  suggestedAuthor?: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'epub' | 'txt' | 'md' | 'rtf' | 'html' | 'pasted';
  detectedLanguageHint?: string;
}

export async function parseUploadedFile(file: File): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  let baseTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let suggestedAuthor = '';

  let fileType: ParsedDocumentResult['fileType'] = 'txt';
  let extractedText = '';

  if (extension === 'docx') {
    fileType = 'docx';
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value || '';
  } else if (extension === 'pdf') {
    fileType = 'pdf';
    try {
      // 1. Send to server PDF extractor (uses pdf-parse with Gemini multimodal OCR fallback)
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, fileName }),
      });

      if (res.ok) {
        const data = await res.json();
        extractedText = data.text || '';
        if (data.suggestedTitle) baseTitle = data.suggestedTitle;
        if (data.suggestedAuthor) suggestedAuthor = data.suggestedAuthor;
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server PDF parsing returned an error');
      }
    } catch (err: any) {
      console.warn('Server PDF extraction failed, trying local fallback...', err);
      // Fallback: arrayBuffer stream decode
      const arrayBuffer = await file.arrayBuffer();
      extractedText = extractTextFromPdfArrayBuffer(arrayBuffer);
      if (!extractedText || extractedText.trim().length < 50) {
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = textDecoder.decode(arrayBuffer);
        extractedText = cleanPdfRawStream(rawString);
      }
    }
  } else if (extension === 'epub') {
    fileType = 'epub';
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const buffer = await file.arrayBuffer();
    const raw = textDecoder.decode(buffer);
    // Strip XML/HTML tags
    extractedText = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  } else if (extension === 'html' || extension === 'htm') {
    fileType = 'html';
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    extractedText = doc.body.textContent || text.replace(/<[^>]+>/g, ' ');
  } else if (extension === 'md') {
    fileType = 'md';
    extractedText = await file.text();
  } else if (extension === 'rtf') {
    fileType = 'rtf';
    const raw = await file.text();
    extractedText = raw.replace(/\\[a-z0-9-]+ ?/gi, ' ').replace(/[{}]/g, ' ').trim();
  } else {
    // Default txt
    fileType = 'txt';
    extractedText = await file.text();
  }

  // Clean extracted text: remove redundant headers, page numbers, duplicate spaces
  extractedText = cleanExtractedText(extractedText);

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error(
      `Could not extract readable text from "${fileName}". Please ensure the file is not empty or password protected.`
    );
  }

  return {
    text: extractedText,
    suggestedTitle: baseTitle,
    suggestedAuthor,
    fileSize: file.size,
    fileType,
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip "data:*/*;base64," prefix
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    // Remove standalone page numbers like "Page 12 of 45" or "--- 12 ---"
    .replace(/^(Page\s+\d+(\s+of\s+\d+)?|\d+|\s*-\s*\d+\s*-\s*)$/gim, '')
    // Normalize excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove repeated hyphens or underscores
    .replace(/_{3,}|-{3,}/g, '')
    .trim();
}

function extractTextFromPdfArrayBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let text = '';
  const raw = new TextDecoder('latin1').decode(bytes);
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;
  while ((match = streamRegex.exec(raw)) !== null) {
    const streamContent = match[1];
    const textMatches = streamContent.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g);
    if (textMatches) {
      for (const tm of textMatches) {
        const cleaned = tm.replace(/^\[|\(?\)?(Tj|TJ)|\]$/g, '').replace(/\\(\d{3})/g, '');
        text += cleaned + ' ';
      }
    }
  }
  return text.trim();
}

function cleanPdfRawStream(raw: string): string {
  const words = raw.match(
    /[\w\u0C80-\u0CFF\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F\u0900-\u097F.,'’"“”!?-]{2,}/g
  );
  if (words && words.length > 20) {
    return words.join(' ');
  }
  return raw.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, ' ').slice(0, 50000);
}
