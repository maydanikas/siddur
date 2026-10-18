import { useCallback, useEffect, useRef, useState } from 'react';
import {
  androidPhraseSeconds,
  charIndexToWordIndex,
  nextHighlightScale,
  prepareTtsText,
  SPEECH_RATE,
  speechDurationSeconds,
  speechPhrases,
  usesPhrasePlayback,
  type SpeechPhrase,
} from './hebrewSpeech';

function isAndroidDevice(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

function buildWordEndTimes(text: string, totalDuration: number): number[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const weights = words.map((word) => Math.max(1, word.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulative = 0;
  return weights.map((weight) => {
    cumulative += (weight / totalWeight) * totalDuration;
    return cumulative;
  });
}

function wordIndexFromEndTimes(endTimes: number[], elapsedSec: number): number {
  for (let i = 0; i < endTimes.length; i++) {
    if (elapsedSec < endTimes[i]) return i;
  }
  return Math.max(0, endTimes.length - 1);
}

function speechErrorCode(event: Event): string {
  if ('error' in event && typeof (event as SpeechSynthesisErrorEvent).error === 'string') {
    return (event as SpeechSynthesisErrorEvent).error;
  }
  return '';
}

function isIgnorableSpeechError(code: string): boolean {
  return code === 'interrupted' || code === 'canceled' || code === 'cancelled';
}

function isMissingHebrewVoice(code: string): boolean {
  return code === 'language-unavailable' || code === 'voice-unavailable' || code === 'synthesis-unavailable';
}

type PhrasePlayState = {
  phrases: SpeechPhrase[];
  phraseIndex: number;
  estDuration: number;
  totalWords: number;
  cancelled: boolean;
  durationScale: number;
  phrasesMeasured: number;
  currentPhraseStartTime: number;
  android: boolean;
};

/**
 * The one Hebrew player. Prayers and readings both call it.
 * Android, and any text longer than a prayer, is spoken in phrases. The phrase
 * clock is corrected from the length of the phrase just heard.
 */
export function useHebrewPlayer(source: string | null, missingVoiceNotice: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const wordHighlightRef = useRef<number | null>(null);
  const phrasePlayRef = useRef<PhrasePlayState | null>(null);
  const speechKeepAliveRef = useRef<number | null>(null);
  const userPausedRef = useRef(false);
  const startRef = useRef(0);
  const pausedAccumRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sourceRef = useRef(source);
  const noticeRef = useRef(missingVoiceNotice);
  const durationRef = useRef(0);
  sourceRef.current = source;
  noticeRef.current = missingVoiceNotice;
  durationRef.current = durationSec;

  const clearTimers = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
    if (speechKeepAliveRef.current) window.clearInterval(speechKeepAliveRef.current);
    intervalRef.current = null;
    wordHighlightRef.current = null;
    speechKeepAliveRef.current = null;
  };

  const resumeSpeechIfStuck = (force = false) => {
    const synth = window.speechSynthesis;
    if (!synth || userPausedRef.current || !synth.paused) return;
    if (!force && !synth.speaking && !synth.pending) return;
    try {
      synth.resume();
    } catch {
      /* Samsung throws if resume races with cancel */
    }
  };

  const armSpeechKeepAlive = () => {
    if (speechKeepAliveRef.current) return;
    speechKeepAliveRef.current = window.setInterval(resumeSpeechIfStuck, 3000);
  };

  const configure = (utter: SpeechSynthesisUtterance) => {
    utter.rate = SPEECH_RATE;
    utter.pitch = 1;
    utter.lang = 'he-IL';
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const hebrew = voices.filter((voice) => voice.lang.toLowerCase().startsWith('he'));
    const voice = hebrew.find((item) => /google/i.test(item.name)) ?? hebrew[0];
    if (voice) utter.voice = voice;
  };

  const stop = useCallback(() => {
    if (phrasePlayRef.current) phrasePlayRef.current.cancelled = true;
    phrasePlayRef.current = null;
    const synth = window.speechSynthesis;
    let cancelled = false;
    if (synth && (synth.speaking || synth.pending)) {
      synth.cancel();
      cancelled = true;
    }
    clearTimers();
    setIsPlaying(false);
    setActiveWord(null);
    setNotice(null);
    utteranceRef.current = null;
    userPausedRef.current = false;
    return cancelled;
  }, []);

  useEffect(() => {
    stop();
    setProgress(0);
    setCurrentSec(0);
    setDurationSec(0);
    pausedAccumRef.current = 0;
  }, [source, stop]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      clearTimers();
    };
  }, []);

  const startPhraseWordHighlight = (phraseText: string, wordStart: number, phraseStartTime: number, scale: number) => {
    const duration = androidPhraseSeconds(phraseText, scale);
    const endTimes = buildWordEndTimes(phraseText, duration);
    if (endTimes.length === 0) return;
    if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
    wordHighlightRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - phraseStartTime) / 1000;
      setActiveWord(wordStart + wordIndexFromEndTimes(endTimes, elapsed));
    }, 60);
  };

  const startProgressInterval = (estDuration: number) => {
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      if (elapsed >= estDuration) {
        setCurrentSec(estDuration);
        setProgress(100);
      } else {
        setCurrentSec(elapsed);
        setProgress((elapsed / estDuration) * 100);
      }
    }, 120);
  };

  const startWordHighlightFallback = (ttsText: string, estDuration: number) => {
    const endTimes = buildWordEndTimes(ttsText, estDuration);
    if (endTimes.length === 0) return;
    if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
    wordHighlightRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setActiveWord(wordIndexFromEndTimes(endTimes, elapsed));
    }, 80);
  };

  const finishPlayback = (estDuration: number) => {
    setIsPlaying(false);
    setProgress(100);
    setCurrentSec(estDuration);
    setActiveWord(null);
    clearTimers();
    phrasePlayRef.current = null;
    utteranceRef.current = null;
    pausedAccumRef.current = 0;
  };

  const speakWhenReady = (utter: SpeechSynthesisUtterance, cancelledJustNow: boolean, android: boolean) => {
    const synth = window.speechSynthesis;
    const run = () => {
      synth.speak(utter);
      if (!android) return;
      resumeSpeechIfStuck(true);
      window.setTimeout(() => resumeSpeechIfStuck(true), 120);
    };
    if (cancelledJustNow) window.setTimeout(run, 50);
    else run();
  };

  const speakWord = (text: string) => {
    const cancelled = stop();
    setProgress(0);
    setCurrentSec(0);
    setDurationSec(0);
    pausedAccumRef.current = 0;
    const utter = new SpeechSynthesisUtterance(prepareTtsText(text));
    configure(utter);
    speakWhenReady(utter, cancelled, isAndroidDevice());
  };

  const playPhrases = (raw: string, android: boolean, cancelled: boolean) => {
    const phrases = speechPhrases(raw);
    const words = prepareTtsText(raw).split(/\s+/).filter(Boolean);
    const estDuration = speechDurationSeconds(raw, android);
    const state: PhrasePlayState = {
      phrases,
      phraseIndex: 0,
      estDuration,
      totalWords: words.length,
      cancelled: false,
      durationScale: 1,
      phrasesMeasured: 0,
      currentPhraseStartTime: 0,
      android,
    };
    phrasePlayRef.current = state;

    const speakPhrase = (phraseIndex: number) => {
      if (state.cancelled || phraseIndex >= state.phrases.length) {
        finishPlayback(estDuration);
        return;
      }
      state.phraseIndex = phraseIndex;
      const phrase = state.phrases[phraseIndex];
      const utter = new SpeechSynthesisUtterance(phrase.text);
      configure(utter);
      utteranceRef.current = utter;

      utter.onstart = () => {
        const phraseStartTime = Date.now();
        state.currentPhraseStartTime = phraseStartTime;
        if (phraseIndex === 0) {
          startRef.current = phraseStartTime;
          startProgressInterval(estDuration);
        }
        setActiveWord(phrase.wordStart);
        const scale = android ? state.durationScale : 1 / SPEECH_RATE;
        startPhraseWordHighlight(phrase.text, phrase.wordStart, phraseStartTime, scale);
        setProgress((phrase.wordStart / state.totalWords) * 100);
        setCurrentSec((phrase.wordStart / state.totalWords) * estDuration);
      };

      utter.onboundary = (event) => {
        if (event.charIndex === undefined) return;
        if (wordHighlightRef.current) {
          window.clearInterval(wordHighlightRef.current);
          wordHighlightRef.current = null;
        }
        setActiveWord(phrase.wordStart + charIndexToWordIndex(phrase.text, event.charIndex));
      };

      utter.onend = () => {
        if (state.cancelled) return;
        if (wordHighlightRef.current) {
          window.clearInterval(wordHighlightRef.current);
          wordHighlightRef.current = null;
        }
        if (android) {
          const actualSec = (Date.now() - state.currentPhraseStartTime) / 1000;
          const next = nextHighlightScale(state.durationScale, state.phrasesMeasured, phrase.text, actualSec);
          state.durationScale = next.scale;
          state.phrasesMeasured = next.measured;
        }
        const wordsDone = phrase.wordStart + phrase.wordCount;
        setActiveWord(wordsDone - 1);
        setProgress((wordsDone / state.totalWords) * 100);
        setCurrentSec((wordsDone / state.totalWords) * estDuration);
        speakPhrase(phraseIndex + 1);
      };

      utter.onerror = (event) => {
        if (state.cancelled) return;
        const code = speechErrorCode(event);
        if (isIgnorableSpeechError(code)) return;
        if (isMissingHebrewVoice(code)) setNotice(noticeRef.current);
        finishPlayback(estDuration);
      };
      speakWhenReady(utter, phraseIndex === 0 && cancelled, android);
    };

    speakPhrase(0);
    if (android) armSpeechKeepAlive();
    setIsPlaying(true);
  };

  const toggle = () => {
    const raw = sourceRef.current;
    if (!raw) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isPlaying) {
      userPausedRef.current = true;
      synth.pause();
      setIsPlaying(false);
      pausedAccumRef.current = (Date.now() - startRef.current) / 1000;
      clearTimers();
      return;
    }

    if (synth.paused && (utteranceRef.current || phrasePlayRef.current)) {
      userPausedRef.current = false;
      synth.resume();
      setIsPlaying(true);
      startRef.current = Date.now() - pausedAccumRef.current * 1000;
      startProgressInterval(durationRef.current);
      const phraseState = phrasePlayRef.current;
      if (phraseState) {
        const phrase = phraseState.phrases[phraseState.phraseIndex];
        if (phrase) {
          const scale = phraseState.android ? phraseState.durationScale : 1 / SPEECH_RATE;
          startPhraseWordHighlight(
            phrase.text,
            phrase.wordStart,
            phraseState.currentPhraseStartTime || Date.now(),
            scale,
          );
        }
      } else {
        startWordHighlightFallback(prepareTtsText(raw), durationRef.current);
      }
      return;
    }

    const android = isAndroidDevice();
    const ttsText = prepareTtsText(raw);
    const estDuration = speechDurationSeconds(raw, android);
    const cancelled = stop();
    setDurationSec(estDuration);
    setCurrentSec(0);
    setProgress(0);
    setActiveWord(0);
    pausedAccumRef.current = 0;
    startRef.current = 0;

    if (usesPhrasePlayback(raw, android)) {
      playPhrases(raw, android, cancelled);
      return;
    }

    const utter = new SpeechSynthesisUtterance(ttsText);
    configure(utter);
    utter.onstart = () => {
      startRef.current = Date.now();
      setActiveWord(0);
      startWordHighlightFallback(ttsText, estDuration);
      startProgressInterval(estDuration);
    };
    utter.onboundary = (event) => {
      if (event.name !== 'word' || event.charIndex === undefined) return;
      if (wordHighlightRef.current) {
        window.clearInterval(wordHighlightRef.current);
        wordHighlightRef.current = null;
      }
      setActiveWord(charIndexToWordIndex(ttsText, event.charIndex));
    };
    utter.onend = () => finishPlayback(estDuration);
    utter.onerror = (event) => {
      const code = speechErrorCode(event);
      if (isIgnorableSpeechError(code)) return;
      if (isMissingHebrewVoice(code)) setNotice(noticeRef.current);
      setIsPlaying(false);
      setActiveWord(null);
      clearTimers();
    };
    utteranceRef.current = utter;
    speakWhenReady(utter, cancelled, false);
    setIsPlaying(true);
  };

  return { isPlaying, progress, currentSec, durationSec, activeWord, notice, toggle, speakWord, stop };
}
