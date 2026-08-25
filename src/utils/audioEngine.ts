import { VOICE_PROFILES } from '../data/languagesAndVoices';
import { VoiceId } from '../types';

export interface AudioEngineCallbacks {
  onTimeUpdate: (currentTime: number, duration: number, progressPercent: number) => void;
  onSentenceChange?: (sentenceIndex: number) => void;
  onEnded: () => void;
  onError: (error: string) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}

interface SentenceItem {
  index: number;
  text: string;
  startSec: number;
  durationSec: number;
}

class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private ttsAudioElement: HTMLAudioElement | null = null;
  private prefetchAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSyntheticSpeech: boolean = false;
  private rawText: string = '';
  private currentLanguage: string = 'en';
  private currentVoiceId: VoiceId = 'kore';
  private duration: number = 60;
  private currentTime: number = 0;
  private playbackRate: number = 1.0;
  private volume: number = 1.0;
  private isPlaying: boolean = false;
  private callbacks: Partial<AudioEngineCallbacks> = {};
  private timerInterval: any = null;
  private sleepTimerTimeout: any = null;
  private watchdogInterval: any = null;

  private sentenceQueue: SentenceItem[] = [];
  private currentSentenceIdx: number = 0;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isSpeakingChunk: boolean = false;
  private activeTtsMode: 'server' | 'browser' = 'server';

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.ttsAudioElement = new Audio();
      this.prefetchAudioElement = new Audio();

      this.audioElement.addEventListener('timeupdate', () => {
        if (!this.isSyntheticSpeech && this.audioElement) {
          this.currentTime = this.audioElement.currentTime;
          this.duration = this.audioElement.duration || this.duration || 1;
          const pct = Math.min(100, Math.max(0, (this.currentTime / this.duration) * 100));
          this.callbacks.onTimeUpdate?.(this.currentTime, this.duration, pct);
        }
      });
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        this.callbacks.onPlayStateChange?.(false);
        this.callbacks.onEnded?.();
      });
      this.audioElement.addEventListener('error', () => {
        this.fallbackToSynthetic();
      });

      // Initialize speech synthesis voices
      this.loadVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.availableVoices = voices;
      }
    }
  }

  public setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = callbacks;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.ttsAudioElement) {
      this.ttsAudioElement.volume = this.volume;
    }
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.volume;
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.5, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.playbackRate;
    }
    if (this.ttsAudioElement) {
      this.ttsAudioElement.playbackRate = this.playbackRate;
    }
    if (this.isSyntheticSpeech && this.isPlaying && this.activeTtsMode === 'browser') {
      // Re-trigger current sentence with updated rate for browser synthesis
      this.speakCurrentSentence();
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public loadAndPlay(
    audioUrl: string | undefined,
    fallbackText: string,
    language: string,
    voiceId: VoiceId,
    startPositionSeconds: number = 0,
    estimatedDurationSeconds: number = 180
  ) {
    this.stop();
    this.rawText = fallbackText;
    this.currentLanguage = language;
    this.currentVoiceId = voiceId;

    const hasRealAudio =
      this.currentLanguage === 'en' &&
      audioUrl &&
      (audioUrl.startsWith('http://') ||
        audioUrl.startsWith('https://') ||
        audioUrl.startsWith('data:audio') ||
        audioUrl.startsWith('blob:')) &&
      !audioUrl.includes('example.com');

    if (hasRealAudio && this.audioElement) {
      this.isSyntheticSpeech = false;
      this.audioElement.src = audioUrl;
      this.audioElement.playbackRate = this.playbackRate;
      this.audioElement.volume = this.volume;
      this.audioElement.currentTime = startPositionSeconds;
      this.audioElement
        .play()
        .then(() => {
          this.isPlaying = true;
          this.callbacks.onPlayStateChange?.(true);
        })
        .catch(() => {
          this.playSynthetic(fallbackText, language, voiceId, startPositionSeconds, estimatedDurationSeconds);
        });
    } else {
      this.playSynthetic(fallbackText, language, voiceId, startPositionSeconds, estimatedDurationSeconds);
    }
  }

  public playSynthetic(
    text: string,
    language: string,
    voiceId: VoiceId,
    startPositionSeconds: number = 0,
    estimatedDurationSeconds?: number
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.callbacks.onError?.('Speech synthesis is not supported on this browser.');
      return;
    }

    this.stop();
    this.isSyntheticSpeech = true;
    this.rawText = text;
    this.currentLanguage = language;
    this.currentVoiceId = voiceId;

    // Build sentence queue
    this.buildSentenceQueue(text, estimatedDurationSeconds);

    // Calculate start sentence from startPositionSeconds
    let targetIdx = 0;
    for (let i = 0; i < this.sentenceQueue.length; i++) {
      if (this.sentenceQueue[i].startSec <= startPositionSeconds) {
        targetIdx = i;
      } else {
        break;
      }
    }
    this.currentSentenceIdx = targetIdx;
    this.currentTime = this.sentenceQueue[targetIdx]?.startSec || startPositionSeconds;

    // Start playback sequence with slight tick to avoid Chrome cancel race condition
    this.isPlaying = true;
    this.callbacks.onPlayStateChange?.(true);
    this.startWatchdog();

    setTimeout(() => {
      if (this.isPlaying) {
        this.speakCurrentSentence();
      }
    }, 50);
  }

  private buildSentenceQueue(text: string, estimatedDurationSeconds?: number) {
    // Split by punctuation sentences (including Indic danda) or sensible paragraph chunks
    const rawMatches = text.match(/[^.!?।॥\n]+[.!?।॥\n]*/g) || [text];
    const sentences = rawMatches
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const totalWords = text.trim().split(/\s+/).length || 1;
    const totalEstDuration =
      estimatedDurationSeconds || Math.max(10, Math.round((totalWords / 130) * 60));
    this.duration = totalEstDuration;

    let accumulatedSec = 0;
    this.sentenceQueue = sentences.map((sentText, index) => {
      const words = sentText.split(/\s+/).length;
      const sentDuration = Math.max(1.5, (words / totalWords) * totalEstDuration);
      const item: SentenceItem = {
        index,
        text: sentText,
        startSec: accumulatedSec,
        durationSec: sentDuration,
      };
      accumulatedSec += sentDuration;
      return item;
    });

    if (this.sentenceQueue.length === 0) {
      this.sentenceQueue = [
        {
          index: 0,
          text: text,
          startSec: 0,
          durationSec: totalEstDuration,
        },
      ];
    }
  }

  private speakCurrentSentence() {
    if (!this.isPlaying || typeof window === 'undefined') return;

    if (this.currentSentenceIdx >= this.sentenceQueue.length) {
      // Completed chapter
      this.isPlaying = false;
      this.stopTimer();
      this.stopWatchdog();
      this.currentTime = this.duration;
      this.callbacks.onTimeUpdate?.(this.duration, this.duration, 100);
      this.callbacks.onPlayStateChange?.(false);
      this.callbacks.onEnded?.();
      return;
    }

    const currentItem = this.sentenceQueue[this.currentSentenceIdx];
    this.currentTime = currentItem.startSec;
    const pct = Math.min(100, Math.max(0, (this.currentTime / this.duration) * 100));
    this.callbacks.onTimeUpdate?.(this.currentTime, this.duration, pct);
    this.callbacks.onSentenceChange?.(currentItem.index);

    // Cancel any prior speech safely
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.removeAttribute('src');
    }

    // Clean text for natural speech
    const cleanText = currentItem.text
      .replace(/•|\*|#|-{2,}|_{2,}/g, ' ')
      .replace(/\[\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      this.currentSentenceIdx++;
      this.speakCurrentSentence();
      return;
    }

    const langCode = this.currentLanguage.split('-')[0].toLowerCase();
    const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langCode)}`;

    // Try server-side studio TTS first (works for Kannada, Indian & all languages seamlessly)
    if (this.ttsAudioElement) {
      this.activeTtsMode = 'server';
      this.isSpeakingChunk = true;
      this.ttsAudioElement.src = ttsUrl;
      this.ttsAudioElement.playbackRate = this.playbackRate;
      this.ttsAudioElement.volume = this.volume;

      this.ttsAudioElement.ontimeupdate = () => {
        if (this.isPlaying && this.ttsAudioElement) {
          const sentElapsed = this.ttsAudioElement.currentTime || 0;
          this.currentTime = currentItem.startSec + sentElapsed;
          const progress = Math.min(100, Math.max(0, (this.currentTime / this.duration) * 100));
          this.callbacks.onTimeUpdate?.(this.currentTime, this.duration, progress);
        }
      };

      this.ttsAudioElement.onended = () => {
        this.isSpeakingChunk = false;
        if (this.isPlaying) {
          this.currentSentenceIdx++;
          // Seamless next sentence with minimal gap
          setTimeout(() => {
            if (this.isPlaying) {
              this.speakCurrentSentence();
            }
          }, 30);
        }
      };

      this.ttsAudioElement.onerror = () => {
        // Fallback to browser speech synthesis if server is unreachable
        this.speakWithSpeechSynthesis(cleanText, currentItem);
      };

      this.ttsAudioElement
        .play()
        .then(() => {
          this.isSpeakingChunk = true;
          this.callbacks.onSentenceChange?.(currentItem.index);

          // Prefetch the next sentence in the background for zero-latency gapless playback
          if (
            this.currentSentenceIdx + 1 < this.sentenceQueue.length &&
            this.prefetchAudioElement
          ) {
            const nextItem = this.sentenceQueue[this.currentSentenceIdx + 1];
            const nextClean = nextItem.text
              .replace(/•|\*|#|-{2,}|_{2,}/g, ' ')
              .replace(/\[\d+\]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            if (nextClean) {
              const nextUrl = `/api/tts?text=${encodeURIComponent(nextClean)}&lang=${encodeURIComponent(langCode)}`;
              this.prefetchAudioElement.src = nextUrl;
            }
          }
        })
        .catch(() => {
          this.speakWithSpeechSynthesis(cleanText, currentItem);
        });
    } else {
      this.speakWithSpeechSynthesis(cleanText, currentItem);
    }
  }

  private speakWithSpeechSynthesis(cleanText: string, currentItem: SentenceItem) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.activeTtsMode = 'browser';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    const bcp47 = this.getBCP47LangCode(this.currentLanguage);
    utterance.lang = bcp47;

    const profile = VOICE_PROFILES.find((v) => v.id === this.currentVoiceId) || VOICE_PROFILES[0];
    const matchedVoice = this.findBestVoice(this.currentLanguage, this.currentVoiceId);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || bcp47;
    } else {
      utterance.lang = bcp47;
    }

    utterance.pitch = Math.max(0.5, Math.min(2.0, profile.pitch || 1.0));
    utterance.rate = Math.max(0.5, Math.min(2.0, (profile.rate || 1.0) * this.playbackRate));
    utterance.volume = this.volume;

    this.isSpeakingChunk = true;

    utterance.onstart = () => {
      this.isSpeakingChunk = true;
      this.callbacks.onSentenceChange?.(currentItem.index);
    };

    utterance.onend = () => {
      this.isSpeakingChunk = false;
      if (this.isPlaying) {
        this.currentSentenceIdx++;
        setTimeout(() => {
          if (this.isPlaying) {
            this.speakCurrentSentence();
          }
        }, 40);
      }
    };

    utterance.onerror = (event) => {
      this.isSpeakingChunk = false;
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }
      console.warn('Utterance speech error:', event.error);
      if (this.isPlaying) {
        this.currentSentenceIdx++;
        setTimeout(() => {
          if (this.isPlaying) {
            this.speakCurrentSentence();
          }
        }, 100);
      }
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }

  private findBestVoice(languageCode: string, voiceId: VoiceId): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    const voices = this.availableVoices;
    if (!voices || voices.length === 0) return null;

    const bcp47 = this.getBCP47LangCode(languageCode).toLowerCase();
    const langPrefix = languageCode.toLowerCase().split('-')[0];
    const profile = VOICE_PROFILES.find((v) => v.id === voiceId) || VOICE_PROFILES[0];
    const targetGender = profile.gender; // 'female' | 'male' | 'neutral'

    const langNameMap: Record<string, string> = {
      kn: 'kannada',
      ta: 'tamil',
      te: 'telugu',
      ml: 'malayalam',
      hi: 'hindi',
      mr: 'marathi',
      bn: 'bengali',
      gu: 'gujarati',
      pa: 'punjabi',
      es: 'spanish',
      fr: 'french',
      de: 'german',
      ja: 'japanese',
    };
    const targetLangName = langNameMap[langPrefix] || '';

    // 1. Filter voices by language code or language name in voice metadata
    const langVoices = voices.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace(/_/g, '-');
      const vName = (v.name || '').toLowerCase();
      return (
        vLang === bcp47 ||
        vLang.startsWith(langPrefix + '-') ||
        vLang === langPrefix ||
        (targetLangName && vName.includes(targetLangName))
      );
    });

    if (langVoices.length > 0) {
      // Try to match gender / name cues
      if (targetGender === 'female') {
        const femaleVoice = langVoices.find(
          (v) =>
            /female|woman|girl|kavya|meera|samantha|zira|victoria|karen|veena|lekha|priya|siri|sapna|kalpana/i.test(v.name)
        );
        if (femaleVoice) return femaleVoice;
      } else if (targetGender === 'male') {
        const maleVoice = langVoices.find(
          (v) =>
            /male|man|guy|rishi|david|daniel|george|alex|fred|aarav|charon|zephyr|gagan|madhav|valluvar/i.test(v.name)
        );
        if (maleVoice) return maleVoice;
      }
      return langVoices[0];
    }

    // CRITICAL: If the target language is NOT English (e.g. Kannada 'kn', Tamil 'ta', etc.)
    // and no browser voice specifically matched, return null so that the browser's
    // SpeechSynthesis uses utterance.lang (e.g. 'kn-IN', 'hi-IN') directly.
    // If we return an English voice object here, the browser will force English phonetics!
    if (langPrefix !== 'en') {
      return null;
    }

    // 2. English fallback
    if (targetGender === 'female') {
      const femaleFallback = voices.find((v) =>
        /female|samantha|zira|victoria|karen|veena|priya/i.test(v.name)
      );
      if (femaleFallback) return femaleFallback;
    } else if (targetGender === 'male') {
      const maleFallback = voices.find((v) =>
        /male|david|daniel|george|alex|rishi/i.test(v.name)
      );
      if (maleFallback) return maleFallback;
    }

    const defaultLang = voices.find((v) => v.lang.startsWith('en'));
    return defaultLang || voices[0] || null;
  }

  private getBCP47LangCode(code: string): string {
    const langMap: Record<string, string> = {
      en: 'en-US',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
    };
    return langMap[code] || 'en-US';
  }

  private startWatchdog() {
    this.stopWatchdog();
    // Chrome Speech API watchdog to keep utterance alive and un-pause if stuck
    this.watchdogInterval = setInterval(() => {
      if (this.isPlaying && typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 3000);
  }

  private stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public pause() {
    this.isPlaying = false;
    this.callbacks.onPlayStateChange?.(false);
    this.stopTimer();
    this.stopWatchdog();

    if (!this.isSyntheticSpeech && this.audioElement) {
      this.audioElement.pause();
    } else {
      if (this.ttsAudioElement) {
        this.ttsAudioElement.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public resume() {
    if (!this.isSyntheticSpeech && this.audioElement) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.callbacks.onPlayStateChange?.(true);
      });
    } else {
      this.isPlaying = true;
      this.callbacks.onPlayStateChange?.(true);
      this.startWatchdog();
      if (
        this.activeTtsMode === 'server' &&
        this.ttsAudioElement &&
        this.ttsAudioElement.src &&
        this.ttsAudioElement.paused &&
        !this.ttsAudioElement.ended
      ) {
        this.ttsAudioElement.play().catch(() => {
          this.speakCurrentSentence();
        });
      } else {
        this.speakCurrentSentence();
      }
    }
  }

  public seek(targetSeconds: number) {
    targetSeconds = Math.max(0, Math.min(this.duration || 100, targetSeconds));
    this.currentTime = targetSeconds;
    const pct = this.duration > 0 ? (targetSeconds / this.duration) * 100 : 0;
    this.callbacks.onTimeUpdate?.(targetSeconds, this.duration, pct);

    if (!this.isSyntheticSpeech && this.audioElement) {
      this.audioElement.currentTime = targetSeconds;
    } else if (this.isSyntheticSpeech) {
      // Find sentence matching targetSeconds
      let targetIdx = 0;
      for (let i = 0; i < this.sentenceQueue.length; i++) {
        if (this.sentenceQueue[i].startSec <= targetSeconds) {
          targetIdx = i;
        } else {
          break;
        }
      }
      this.currentSentenceIdx = targetIdx;
      if (this.isPlaying) {
        this.speakCurrentSentence();
      }
    }
  }

  public skipSeconds(seconds: number) {
    this.seek(this.currentTime + seconds);
  }

  public stop() {
    this.isPlaying = false;
    this.stopTimer();
    this.stopWatchdog();
    this.callbacks.onPlayStateChange?.(false);

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.removeAttribute('src');
    }
    if (this.prefetchAudioElement) {
      this.prefetchAudioElement.removeAttribute('src');
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public setSleepTimer(minutes: number | 'end_of_chapter', onTimerFired: () => void) {
    this.clearSleepTimer();
    if (minutes === 'end_of_chapter') {
      return;
    }
    if (minutes > 0) {
      this.sleepTimerTimeout = setTimeout(() => {
        this.pause();
        onTimerFired();
      }, minutes * 60 * 1000);
    }
  }

  public clearSleepTimer() {
    if (this.sleepTimerTimeout) {
      clearTimeout(this.sleepTimerTimeout);
      this.sleepTimerTimeout = null;
    }
  }

  public previewVoice(voice: VoiceId, language: string = 'en') {
    if (typeof window === 'undefined') return;
    const profile = VOICE_PROFILES.find((v) => v.id === voice) || VOICE_PROFILES[0];
    
    // Stop prior preview
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const langCode = language.split('-')[0].toLowerCase();
    const sampleTextByLang: Record<string, string> = {
      kn: 'ನಮಸ್ಕಾರ, ಇದು ಲಿಸನ್ ಎಐ ಧ್ವನಿ ಮಾದರಿ. ನಿಮ್ಮ ನೆಚ್ಚಿನ ಪುಸ್ತಕಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಸುಂದರವಾಗಿ ಆಲಿಸಿ.',
      ta: 'வணக்கம், இது ListenAI குரல் மாதிரி. புத்தகங்களை இனிமையாகக் கேளுங்கள்.',
      te: 'నమస్కారం, ఇది ListenAI వాయిస్ నమూనా. మీ పుస్తకాలను ఆనందంగా వినండి.',
      ml: 'നമസ്കാരം, ഇത് ListenAI വോയ്‌സ് സാമ്പിൾ ആണ്.',
      hi: 'नमस्ते, यह ListenAI आवाज़ का नमूना है। अपनी पुस्तकों को आसानी से सुनें।',
      mr: 'नमस्कार, हा ListenAI आवाज नमुना आहे.',
      bn: 'নমস্কার, এটি ListenAI ভয়েস নমুনা।',
      es: 'Hola, esta es una muestra de voz de ListenAI.',
      fr: 'Bonjour, voici un échantillon de voix de ListenAI.',
      de: 'Hallo, dies ist eine Sprachprobe von ListenAI.',
      ja: 'こんにちは、ListenAIの音声サンプルです。',
      en: profile.sampleText || `Hello, this is ${profile.name}. ListenAI gives voice to your written world.`,
    };

    const sampleText = sampleTextByLang[langCode] || sampleTextByLang.en;

    // Use server TTS for crisp native pronunciation
    const audioUrl = `/api/tts?text=${encodeURIComponent(sampleText)}&lang=${encodeURIComponent(langCode)}`;
    const previewAudio = new Audio(audioUrl);
    previewAudio.volume = this.volume;
    previewAudio.playbackRate = profile.rate || 1.0;
    
    previewAudio.play().catch(() => {
      // Fallback to speech synthesis
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(sampleText);
        const matchedVoice = this.findBestVoice(language, voice);
        if (matchedVoice) {
          utt.voice = matchedVoice;
          utt.lang = matchedVoice.lang;
        } else {
          utt.lang = this.getBCP47LangCode(language);
        }
        utt.rate = profile.rate || 1.0;
        utt.pitch = profile.pitch || 1.0;
        utt.volume = this.volume;
        window.speechSynthesis.speak(utt);
      }
    });
  }

  private fallbackToSynthetic() {
    if (this.rawText) {
      this.playSynthetic(
        this.rawText,
        this.currentLanguage,
        this.currentVoiceId,
        this.currentTime,
        this.duration
      );
    }
  }
}

export const audioEngine = new AudioEngine();
