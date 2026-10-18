import { useEffect, useRef, useState } from 'react';
import { prepareTtsText, SPEECH_RATE } from '../hebrewSpeech';
import { READING_COPY } from '../readingCopy';
import { loadSefariaPassage, type PassageVerse } from '../sefariaPassage';
import { controlsCopy, type Lang } from '../supportCopy';

const PHRASE_CHARS = 180;

function speechPhrases(text: string): string[] {
  const prepared = prepareTtsText(text);
  const words = prepared.split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  let chunk: string[] = [];
  const flush = () => {
    if (chunk.length === 0) return;
    phrases.push(chunk.join(' '));
    chunk = [];
  };
  for (const word of words) {
    const next = chunk.length === 0 ? word : `${chunk.join(' ')} ${word}`;
    if (chunk.length > 0 && next.length > PHRASE_CHARS) flush();
    chunk.push(word);
  }
  flush();
  return phrases;
}

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

function HebrewVerse({ verse, onWord }: { verse: PassageVerse; onWord: (word: string) => void }) {
  const words = verse.hebrew.split(/\s+/).filter(Boolean);
  return (
    <p dir="rtl" lang="he" className="he-serif text-right text-[22px] leading-[1.9] text-zinc-900">
      <span dir="ltr" className="ui-sans me-2 text-[12px] font-medium text-zinc-400">{verse.chapter}:{verse.verse}</span>
      {words.map((word, index) => (
        <span key={`${verse.chapter}-${verse.verse}-${index}`}>
          {index > 0 ? ' ' : null}
          <button
            type="button"
            className="inline appearance-none border-0 bg-transparent p-0 font-[inherit] text-inherit rounded-sm hover:bg-teal-50 active:bg-teal-100"
            onClick={() => onWord(word)}
          >
            {word}
          </button>
        </span>
      ))}
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
  const playRef = useRef<{ cancelled: boolean } | null>(null);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const stop = () => {
    if (playRef.current) playRef.current.cancelled = true;
    playRef.current = null;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
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

  const speak = (text: string, onend?: () => void) => {
    const utter = new SpeechSynthesisUtterance(text);
    configureHebrewUtterance(utter);
    utter.onend = () => onend?.();
    utter.onerror = (event) => {
      const code = 'error' in event ? String(event.error) : '';
      if (code === 'interrupted' || code === 'canceled' || code === 'cancelled') return;
      if (playRef.current) playRef.current.cancelled = true;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (code === 'language-unavailable' || code === 'voice-unavailable' || code === 'synthesis-unavailable') {
        setNotice(ui.ttsNoHebrew);
      }
      setIsPlaying(false);
    };
    window.speechSynthesis.speak(utter);
  };

  const speakWord = (word: string) => {
    stop();
    setProgress(0);
    setCurrentSec(0);
    speak(prepareTtsText(word));
  };

  const startProgress = (duration: number, offset = 0) => {
    const started = Date.now() - offset * 1000;
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
      return;
    }
    if (synth.paused && playRef.current) {
      synth.resume();
      setIsPlaying(true);
      startProgress(durationSec, elapsedRef.current);
      return;
    }

    const hebrew = verses.map((verse) => verse.hebrew).join(' ');
    const phrases = speechPhrases(hebrew);
    const duration = estimateDuration(hebrew);
    stop();
    const state = { cancelled: false };
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
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        playRef.current = null;
        return;
      }
      speak(phrases[index], () => speakPhrase(index + 1));
    };
    window.setTimeout(() => {
      if (!state.cancelled) speakPhrase(0);
    }, 50);
  };

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
            {verses.map((verse) => (
              <HebrewVerse key={`${verse.chapter}:${verse.verse}`} verse={verse} onWord={speakWord} />
            ))}
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
