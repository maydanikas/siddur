import { useEffect, useRef, useState } from 'react';
import {
  charIndexToWordIndex,
  prepareTtsText,
  readingSpeechPhrases,
  SPEECH_RATE,
  wordIndexAtElapsed,
  type SpeechPhrase,
} from '../hebrewSpeech';
import { READING_COPY } from '../readingCopy';
import { loadSefariaPassage, type PassageVerse } from '../sefariaPassage';
import { controlsCopy, type Lang } from '../supportCopy';

function configureHebrewUtterance(utter: SpeechSynthesisUtterance) {
  utter.rate = SPEECH_RATE;
  utter.pitch = 1;
  utter.lang = 'he-IL';
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const hebrew = voices.filter((voice) => voice.lang.toLowerCase().startsWith('he'));
  const voice = hebrew.find((item) => /google/i.test(item.name)) ?? hebrew[0];
  if (voice) utter.voice = voice;
}

function estimateDuration(text: string): number {
  return Math.max(4, Math.ceil((prepareTtsText(text).length * 0.085) / SPEECH_RATE));
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function HebrewVerse({
  verse,
  wordStart,
  activeWord,
  onWord,
}: {
  verse: PassageVerse;
  wordStart: number;
  activeWord: number | null;
  onWord: (word: string) => void;
}) {
  const words = verse.hebrew.split(/\s+/).filter(Boolean);
  return (
    <p dir="rtl" lang="he" className="he-serif text-right text-[22px] leading-[1.9] text-zinc-900">
      <span dir="ltr" className="ui-sans me-2 text-[12px] font-medium text-zinc-400">{verse.chapter}:{verse.verse}</span>
      {words.map((word, index) => {
        const wordIndex = wordStart + index;
        const spoken = wordIndex === activeWord;
        return (
          <span key={`${verse.chapter}-${verse.verse}-${index}`}>
            {index > 0 ? ' ' : null}
            <button
              type="button"
              data-reading-word={wordIndex}
              className={`inline cursor-pointer appearance-none border-0 p-0 font-[inherit] text-inherit rounded-sm transition-colors ${
                spoken
                  ? 'bg-teal-200/90 ring-1 ring-teal-400/70'
                  : 'bg-transparent hover:bg-teal-50/80 active:bg-teal-100'
              }`}
              onClick={() => onWord(word)}
            >
              {word}
            </button>
          </span>
        );
      })}
    </p>
  );
}

export default function ReadingCard({
  title,
  sefariaRef,
  lang,
  nextTitle,
  onNext,
  onHome,
}: {
  title: string;
  sefariaRef: string;
  lang: Lang;
  nextTitle?: string;
  onNext?: () => void;
  onHome: () => void;
}) {
  const copy = READING_COPY[lang];
  const ui = controlsCopy(lang);
  const [verses, setVerses] = useState<PassageVerse[] | null>(null);
  const [transliteration, setTransliteration] = useState('');
  const [failed, setFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const playRef = useRef<{
    cancelled: boolean;
    phrase: SpeechPhrase | null;
    phraseStarted: number;
    pausedInPhrase: number;
  } | null>(null);
  const timerRef = useRef<number | null>(null);
  const highlightRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const progressStartedRef = useRef(0);

  const clearHighlightTimer = () => {
    if (highlightRef.current !== null) window.clearInterval(highlightRef.current);
    highlightRef.current = null;
  };

  const stop = () => {
    if (playRef.current) playRef.current.cancelled = true;
    playRef.current = null;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    clearHighlightTimer();
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setActiveWord(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    setVerses(null);
    setTransliteration('');
    setFailed(false);
    setNotice(null);
    loadSefariaPassage(sefariaRef)
      .then((passage) => {
        if (controller.signal.aborted) return;
        setVerses(passage.verses);
        setTransliteration(passage.transliteration);
        setDurationSec(estimateDuration(passage.verses.map((verse) => verse.hebrew).join(' ')));
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => {
      controller.abort();
      stop();
    };
  }, [sefariaRef]);

  const followPhrase = (phrase: SpeechPhrase, phraseDuration: number, alreadyElapsed = 0) => {
    const started = Date.now() - alreadyElapsed * 1000;
    if (playRef.current) {
      playRef.current.phrase = phrase;
      playRef.current.phraseStarted = started;
    }
    clearHighlightTimer();
    setActiveWord(phrase.wordStart + wordIndexAtElapsed(phrase.text, alreadyElapsed, phraseDuration));
    highlightRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      setActiveWord(phrase.wordStart + wordIndexAtElapsed(phrase.text, elapsed, phraseDuration));
    }, 80);
  };

  const speak = (text: string, phrase: SpeechPhrase | null, phraseDuration: number, onend?: () => void) => {
    const utter = new SpeechSynthesisUtterance(text);
    configureHebrewUtterance(utter);
    utter.onstart = () => {
      if (phrase) followPhrase(phrase, phraseDuration);
    };
    utter.onboundary = (event) => {
      if (!phrase || event.charIndex === undefined) return;
      if (event.name && event.name !== 'word') return;
      clearHighlightTimer();
      setActiveWord(phrase.wordStart + charIndexToWordIndex(phrase.text, event.charIndex));
    };
    utter.onend = () => onend?.();
    utter.onerror = (event) => {
      const code = 'error' in event ? String(event.error) : '';
      if (code === 'interrupted' || code === 'canceled' || code === 'cancelled') return;
      if (playRef.current) playRef.current.cancelled = true;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      clearHighlightTimer();
      if (code === 'language-unavailable' || code === 'voice-unavailable' || code === 'synthesis-unavailable') {
        setNotice(ui.ttsNoHebrew);
      }
      setIsPlaying(false);
      setActiveWord(null);
    };
    window.speechSynthesis.speak(utter);
  };

  const speakWord = (word: string) => {
    stop();
    setProgress(0);
    setCurrentSec(0);
    speak(prepareTtsText(word), null, 0);
  };

  const startProgress = (duration: number, offset = 0) => {
    const started = Date.now() - offset * 1000;
    progressStartedRef.current = started;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      elapsedRef.current = elapsed;
      if (elapsed >= duration) {
        setCurrentSec(duration);
        setProgress(100);
      } else {
        setCurrentSec(elapsed);
        setProgress((elapsed / duration) * 100);
      }
    }, 120);
  };

  const playPassage = () => {
    if (!verses) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      clearHighlightTimer();
      if (progressStartedRef.current > 0) {
        elapsedRef.current = Math.max(0, (Date.now() - progressStartedRef.current) / 1000);
      }
      if (playRef.current && playRef.current.phraseStarted > 0) {
        playRef.current.pausedInPhrase = Math.max(0, (Date.now() - playRef.current.phraseStarted) / 1000);
      }
      return;
    }
    if (synth.paused && playRef.current?.phrase) {
      synth.resume();
      setIsPlaying(true);
      startProgress(durationSec, elapsedRef.current);
      const phrase = playRef.current.phrase;
      const phraseDuration = Math.max(0.4, estimateDuration(phrase.text));
      followPhrase(phrase, phraseDuration, playRef.current.pausedInPhrase);
      return;
    }

    const hebrew = verses.map((verse) => verse.hebrew).join(' ');
    const phrases = readingSpeechPhrases(hebrew);
    const duration = estimateDuration(hebrew);
    stop();
    const state = { cancelled: false, phrase: null as SpeechPhrase | null, phraseStarted: 0, pausedInPhrase: 0 };
    playRef.current = state;
    elapsedRef.current = 0;
    setDurationSec(duration);
    setCurrentSec(0);
    setProgress(0);
    setNotice(null);
    setIsPlaying(true);
    startProgress(duration);

    const speakPhrase = (index: number) => {
      if (state.cancelled) return;
      if (index >= phrases.length) {
        setIsPlaying(false);
        setProgress(100);
        setCurrentSec(duration);
        setActiveWord(null);
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        clearHighlightTimer();
        playRef.current = null;
        return;
      }
      const phrase = phrases[index];
      speak(phrase.text, phrase, Math.max(0.4, estimateDuration(phrase.text)), () => speakPhrase(index + 1));
    };
    window.setTimeout(() => {
      if (!state.cancelled) speakPhrase(0);
    }, 50);
  };

  useEffect(() => {
    if (activeWord === null) return;
    document.querySelector(`[data-reading-word="${activeWord}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeWord]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto px-5 pb-[168px]">
        <h2 className="pt-1 text-[22px] font-semibold leading-snug tracking-tight text-[#0D9488]">{title}</h2>
        {verses === null && !failed ? (
          <p className="mt-6 text-[15px] text-zinc-500">{copy.loading}</p>
        ) : null}
        {failed ? <p className="mt-6 text-[15px] text-zinc-500">{copy.error}</p> : null}
        {verses ? (
          <div className="mt-6 space-y-3">
            {(() => {
              let wordStart = 0;
              return verses.map((verse) => {
                const count = verse.hebrew.split(/\s+/).filter(Boolean).length;
                const start = wordStart;
                wordStart += count;
                return (
                  <HebrewVerse
                    key={`${verse.chapter}:${verse.verse}`}
                    verse={verse}
                    wordStart={start}
                    activeWord={activeWord}
                    onWord={speakWord}
                  />
                );
              });
            })()}
          </div>
        ) : null}
        {transliteration ? (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-[15px] italic leading-7 text-zinc-700">
            {transliteration}
          </div>
        ) : null}
        {verses ? (
          <p className="mt-6 text-[11px] leading-4 text-zinc-400">
            Miqra according to the Masorah ·{' '}
            <a
              href={`https://www.sefaria.org/${sefariaRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-zinc-300 underline-offset-2"
            >
              Sefaria
            </a>
            {' '}· CC-BY-SA
          </p>
        ) : null}
        {nextTitle && onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="mt-8 block text-left text-[15px] font-medium text-[#0D9488] underline decoration-[#0D9488]/40 underline-offset-2"
          >
            {copy.next} · {nextTitle}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onHome}
          className="mt-4 h-11 w-full rounded-full border border-[#0D9488] text-[14px] font-medium text-[#0D9488]"
        >
          {copy.home}
        </button>
      </div>
      {verses ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)] ui-sans">
          <div className="mx-auto max-w-[720px] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={playPassage}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-sm"
                  aria-label={isPlaying ? ui.pause : ui.play}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="4" height="14" rx="1" /><rect x="13" y="5" width="4" height="14" rx="1" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-[2px]"><path d="M7 5.5c0-1.2 1.3-1.9 2.3-1.1l9 7c.8.6.8 1.8 0 2.4l-9 7c-1 .7-2.3 0-2.3-1.2v-14z" /></svg>
                  )}
                </button>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-none">{ui.listen}</div>
                  <div className="mt-1 truncate text-[11px] text-zinc-500">{title} • he-IL 0.50×</div>
                </div>
              </div>
              <div className="text-[11px] font-medium tabular-nums text-zinc-600">{formatTime(currentSec)} / {formatTime(durationSec || 0)}</div>
            </div>
            <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-[#0D9488]" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            {notice ? <p className="mt-2 text-[11px] leading-4 text-zinc-500">{notice}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
